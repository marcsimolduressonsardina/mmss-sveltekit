import {
	DeleteObjectCommand,
	DeleteObjectsCommand,
	GetObjectCommand,
	PutObjectCommand,
	type S3Client
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type { Readable } from 'stream';

export class S3Util {
	public static async getPresignedUploadUrl(
		client: S3Client,
		bucket: string,
		key: string,
		mimeType: string,
		expire: number = 60
	): Promise<string> {
		const params = {
			Bucket: bucket,
			Key: key,
			ContentType: mimeType
		};

		return await getSignedUrl(client, new PutObjectCommand(params), {
			expiresIn: expire
		});
	}

	public static async getPresignedDownloadUrl(
		client: S3Client,
		bucket: string,
		key: string,
		expire: number = 60
	): Promise<string> {
		const params = {
			Bucket: bucket,
			Key: key
		};

		return getSignedUrl(client, new GetObjectCommand(params), {
			expiresIn: expire
		});
	}

	public static async deleteFile(client: S3Client, bucket: string, key: string) {
		const deleteParams = {
			Bucket: bucket,
			Key: key
		};

		const command = new DeleteObjectCommand(deleteParams);
		await client.send(command);
	}

	public static async batchDeleteFiles(client: S3Client, bucket: string, keys: string[]) {
		const deleteParams = {
			Bucket: bucket,
			Delete: {
				Objects: keys.map((key) => ({ Key: key })),
				Quiet: true
			}
		};

		const deleteCommand = new DeleteObjectsCommand(deleteParams);
		client.send(deleteCommand);
	}

	public static async getFileFromS3(
		client: S3Client,
		bucket: string,
		key: string
	): Promise<{ file: Buffer; contentType?: string }> {
		const command = new GetObjectCommand({
			Bucket: bucket,
			Key: key
		});

		try {
			const response = await client.send(command);
			return {
				file: await S3Util.streamToBuffer(response.Body as Readable),
				contentType: response.ContentType
			};
		} catch (error) {
			throw new Error(`Failed to get file from S3: ${error}`);
		}
	}

	public static async uploadToS3(
		client: S3Client,
		bucket: string,
		key: string,
		body: Buffer,
		contentType?: string
	) {
		const command = new PutObjectCommand({
			Bucket: bucket,
			Key: key,
			Body: body,
			ContentType: contentType
		});

		try {
			await client.send(command);
		} catch (error) {
			throw new Error(`Failed to upload file to S3: ${error}`);
		}
	}

	private static async streamToBuffer(stream: Readable): Promise<Buffer> {
		return new Promise((resolve, reject) => {
			const chunks: Buffer[] = [];
			stream.on('data', (chunk) => chunks.push(chunk));
			stream.on('error', reject);
			stream.on('end', () => resolve(Buffer.concat(chunks)));
		});
	}
}
