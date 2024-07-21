import mime from 'mime-types';
import { v4 as uuidv4 } from 'uuid';
import { S3Client } from '@aws-sdk/client-s3';
import { FileRepository } from '../repository/file.repository';

import {
	FILES_BUCKET,
	AWS_REGION,
	AWS_ACCESS_KEY_ID,
	AWS_SECRET_ACCESS_KEY
} from '$env/static/private';
import { FileType, type File } from '$lib/type/api.type';
import type { FileDto } from '../repository/dto/file.dto';
import { S3Util } from '../data/s3.util';

export class FileService {
	private repository: FileRepository;
	private s3Client: S3Client;

	constructor() {
		this.repository = new FileRepository();
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
		await this.repository.createFile(fileDto);
		return file;
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
			await this.repository.deleteFile(orderId, id),
			await S3Util.deleteFile(this.s3Client, FILES_BUCKET, dto.key)
		]);
	}

	public async deleteAllOrderFiles(orderId: string) {
		const dtos = await this.repository.getFilesByOrder(orderId);
		if (dtos.length === 0) return;
		await Promise.all([
			await this.repository.deleteFiles(dtos),
			await S3Util.batchDeleteFiles(
				this.s3Client,
				FILES_BUCKET,
				dtos.map((d) => d.key)
			)
		]);
	}

	private async processFileToDownload(fileDto: FileDto): Promise<File> {
		const downloadUrl = await S3Util.getPresignedDownloadUrl(
			this.s3Client,
			FILES_BUCKET,
			fileDto.key,
			600
		);
		return FileService.fromDto(fileDto, downloadUrl);
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

	private static fromDto(fileDto: FileDto, downloadUrl?: string): File {
		return {
			orderId: fileDto.orderUuid,
			id: fileDto.fileUuid,
			type: fileDto.type as FileType,
			originalFilename: fileDto.originalFilename,
			downloadUrl
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
}
