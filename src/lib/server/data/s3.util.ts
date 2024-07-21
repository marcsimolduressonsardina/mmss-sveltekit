import {
	DeleteObjectCommand,
	DeleteObjectsCommand,
	GetObjectCommand,
	PutObjectCommand,
	type S3Client
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

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
}
