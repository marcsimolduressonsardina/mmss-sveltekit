export interface IPaginatedDtoResult<T> {
	elements: T[];
	endKey?: string | number;
}
