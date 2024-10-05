import mime from 'mime-types';
import { v4 as uuidv4 } from 'uuid';
import { S3Client } from '@aws-sdk/client-s3';
import sharp from 'sharp';
import { FileRepositoryDynamoDb } from '../repository/dynamodb/file.repository.dynamodb';

import {
	FILES_BUCKET,
	AWS_REGION,
	AWS_ACCESS_KEY_ID,
	AWS_SECRET_ACCESS_KEY
} from '$env/static/private';
import { FileType, type AppUser, type File } from '$lib/type/api.type';
import type { FileDto } from '../repository/dto/file.dto';
import { S3Util } from '../data/s3.util';
import { OrderAuditTrailService } from './order-audit-trail.service';
import type { IFileRepository } from '../repository/file.repository.interface';

export class FileService {
	private repository: IFileRepository;
	private orderAuditTrailServiceOrder: OrderAuditTrailService;
	private s3Client: S3Client;

	constructor(user: AppUser) {
		this.repository = new FileRepositoryDynamoDb();
		this.orderAuditTrailServiceOrder = new OrderAuditTrailService(user);
		this.s3Client = new S3Client({
			region: AWS_REGION,
			credentials: {
				accessKeyId: AWS_ACCESS_KEY_ID,
				secretAccessKey: AWS_SECRET_ACCESS_KEY
			}
		});
	}

	public async createFile(orderId: string, fileName: string): Promise<File> {
		const mimeType = mime.lookup(fileName);
		if (mimeType === false) throw Error('Invalid filename');
		const id = uuidv4();
		const type = FileService.classifyMimeType(mimeType);
		const file: File = {
			orderId,
			id,
			type,
			originalFilename: fileName
		};
		const storageKey = FileService.generateStorageKey(file, fileName);
		const fileDto = FileService.toDto(file, storageKey);
		const uploadUrl = await S3Util.getPresignedUploadUrl(
			this.s3Client,
			FILES_BUCKET,
			storageKey,
			mimeType,
			300
		);
		file.uploadUrl = uploadUrl;
		await Promise.all([
			this.repository.createFile(fileDto),
			this.orderAuditTrailServiceOrder.storeEntry(orderId, [
				this.orderAuditTrailServiceOrder.logOrderFileCreated(orderId, fileName)
			])
		]);
		return file;
	}

	public async generateOptimizations(orderId: string, id: string) {
		const fileDto = await this.repository.getFile(orderId, id);
		if (fileDto == null) return;
		const file = FileService.fromDto(fileDto);

		if (file.type !== FileType.PHOTO) {
			return;
		}

		if (fileDto.optimizedKey != null && fileDto.thumbnailKey != null) {
			return;
		}

		const originalFile = await S3Util.getFileFromS3(this.s3Client, FILES_BUCKET, fileDto.key);
		if (fileDto.optimizedKey == null) {
			fileDto.optimizedKey = `optimized/${fileDto.key}`;
			const optimizedImage = await this.optimizeImage(originalFile.file);
			await S3Util.uploadToS3(
				this.s3Client,
				FILES_BUCKET,
				fileDto.optimizedKey,
				optimizedImage,
				originalFile.contentType
			);
		}

		if (fileDto.thumbnailKey == null) {
			fileDto.thumbnailKey = `thumbnail/${fileDto.key}`;
			const thumbnailImage = await this.generateThumbnail(originalFile.file);
			await S3Util.uploadToS3(
				this.s3Client,
				FILES_BUCKET,
				fileDto.thumbnailKey,
				thumbnailImage,
				originalFile.contentType
			);
		}

		await this.repository.createFile(fileDto);
	}

	public async getFile(orderId: string, id: string): Promise<File | undefined> {
		const fileDto = await this.repository.getFile(orderId, id);
		if (fileDto == null) return undefined;
		return this.processFileToDownload(fileDto);
	}

	public async getFilesByOrder(orderId: string): Promise<File[]> {
		const fileDtos = await this.repository.getFilesByOrder(orderId);
		const promises = fileDtos.map((dto) => this.processFileToDownload(dto));
		return await Promise.all(promises);
	}

	public async deleteFile(orderId: string, id: string) {
		const dto = await this.repository.getFile(orderId, id);
		if (dto == null) return;
		await Promise.all([
			this.repository.deleteFile(orderId, id),
			S3Util.batchDeleteFiles(this.s3Client, FILES_BUCKET, FileService.getAllFileKeys(dto)),
			this.orderAuditTrailServiceOrder.storeEntry(orderId, [
				this.orderAuditTrailServiceOrder.logOrderFileDeleted(orderId, dto.originalFilename)
			])
		]);
	}

	public async deleteAllOrderFiles(orderId: string) {
		const dtos = await this.repository.getFilesByOrder(orderId);
		if (dtos.length === 0) return;
		await Promise.all([
			this.repository.deleteFiles(dtos),
			S3Util.batchDeleteFiles(
				this.s3Client,
				FILES_BUCKET,
				dtos.map((dto) => FileService.getAllFileKeys(dto)).flat()
			),
			this.orderAuditTrailServiceOrder.storeEntry(
				orderId,
				dtos.map((dto) =>
					this.orderAuditTrailServiceOrder.logOrderFileDeleted(orderId, dto.originalFilename)
				)
			)
		]);
	}

	private async processFileToDownload(fileDto: FileDto): Promise<File> {
		const downloadUrl = await S3Util.getPresignedDownloadUrl(
			this.s3Client,
			FILES_BUCKET,
			fileDto.optimizedKey ?? fileDto.key,
			600
		);

		const thumbnailDownloadUrl = fileDto.thumbnailKey
			? await S3Util.getPresignedDownloadUrl(this.s3Client, FILES_BUCKET, fileDto.thumbnailKey, 600)
			: undefined;

		return FileService.fromDto(fileDto, downloadUrl, thumbnailDownloadUrl);
	}

	private async optimizeImage(imageBuffer: Buffer) {
		const optimizedImage = await sharp(imageBuffer)
			.resize({ width: 2160 })
			.jpeg({ quality: 80 })
			.toBuffer();
		return optimizedImage;
	}

	private async generateThumbnail(imageBuffer: Buffer) {
		const optimizedImage = await sharp(imageBuffer).resize(80, 80).toBuffer();
		return optimizedImage;
	}

	private static toDto(file: File, key: string): FileDto {
		return {
			orderUuid: file.orderId,
			fileUuid: file.id,
			type: file.type,
			originalFilename: file.originalFilename,
			key
		};
	}

	private static fromDto(
		fileDto: FileDto,
		downloadUrl?: string,
		thumbnailDownloadUrl?: string
	): File {
		return {
			orderId: fileDto.orderUuid,
			id: fileDto.fileUuid,
			type: fileDto.type as FileType,
			originalFilename: fileDto.originalFilename,
			downloadUrl,
			thumbnailDownloadUrl
		};
	}

	private static classifyMimeType(mimeType: string): FileType {
		if (mimeType.startsWith('image/')) {
			return FileType.PHOTO;
		} else if (mimeType.startsWith('video/')) {
			return FileType.VIDEO;
		} else {
			return FileType.OTHER;
		}
	}

	private static generateStorageKey(file: File, fileName: string) {
		const lastDotIndex = fileName.lastIndexOf('.');
		const extension =
			lastDotIndex === -1 || lastDotIndex === 0 ? '' : fileName.substring(lastDotIndex + 1);
		return `${file.orderId}/${file.type}/${file.id}.${extension.toLowerCase()}`;
	}

	private static getAllFileKeys(fileDto: FileDto): string[] {
		return [fileDto.key, fileDto.optimizedKey, fileDto.thumbnailKey].filter((key) => key != null);
	}
}
