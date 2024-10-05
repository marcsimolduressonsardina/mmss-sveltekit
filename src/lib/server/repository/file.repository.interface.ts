import type { FileDto } from './dto/file.dto';

export interface IFileRepository {
	createFile(file: FileDto): Promise<void>;
	getFile(orderUuid: string, fileUuid: string): Promise<FileDto | null>;
	getFilesByOrder(orderUuid: string): Promise<FileDto[]>;
	deleteFile(orderUuid: string, fileUuid: string): Promise<void>;
	deleteFiles(files: FileDto[]): Promise<void>;
}
