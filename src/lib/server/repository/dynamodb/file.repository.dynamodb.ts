import type { FileDto } from '../dto/file.dto';
import { DynamoRepository } from './dynamo.repository';
import { FILE_TABLE } from '$env/static/private';
import type { IFileRepository } from '../file.repository.interface';

export class FileRepositoryDynamoDb extends DynamoRepository<FileDto> implements IFileRepository {
	constructor() {
		super(FILE_TABLE, 'orderUuid', 'fileUuid');
	}

	public async createFile(file: FileDto) {
		await this.put(file);
	}

	public async getFile(orderUuid: string, fileUuid: string): Promise<FileDto | null> {
		return this.get(orderUuid, fileUuid);
	}

	public async getFilesByOrder(orderUuid: string): Promise<FileDto[]> {
		return this.getByPartitionKey(orderUuid);
	}

	public async deleteFile(orderUuid: string, fileUuid: string) {
		await this.batchDelete([{ partitionKey: orderUuid, sortKey: fileUuid }]);
	}

	public async deleteFiles(files: FileDto[]) {
		const deleteInfo = files.map((f) => ({ partitionKey: f.orderUuid, sortKey: f.fileUuid }));
		await this.batchDelete(deleteInfo);
	}
}
