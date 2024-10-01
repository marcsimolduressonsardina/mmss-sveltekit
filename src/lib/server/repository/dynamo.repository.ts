import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } from '$env/static/private';
import { type AttributeValue, DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
	DynamoDBDocument,
	type DynamoDBDocumentClient,
	QueryCommand,
	GetCommand,
	PutCommand,
	BatchWriteCommand,
	type UpdateCommandInput,
	UpdateCommand,
	type QueryCommandInput,
	TransactWriteCommand,
	type TransactWriteCommandInput,
	type NativeAttributeValue
} from '@aws-sdk/lib-dynamodb';
import _ from 'lodash';
import type { ItemDto } from './dto/item.dto';

export interface IPaginatedDtoResult<T> {
	elements: T[];
	endKey?: string | number;
}

export abstract class DynamoRepository<T> {
	protected readonly defaultLimit: number = 25;
	protected readonly table: string;
	protected readonly partitionKey: string;
	protected readonly sortKey?: string;
	protected client: DynamoDBDocumentClient;

	protected constructor(tableName: string, partitionKeyName: string, sortKeyName?: string) {
		if (!tableName || !partitionKeyName) {
			throw new Error(`Invalid table or partition key name ${tableName} / ${partitionKeyName}`);
		}

		this.table = tableName;
		this.partitionKey = partitionKeyName;
		this.sortKey = sortKeyName;

		try {
			this.client = DynamoDBDocument.from(
				new DynamoDBClient({
					region: AWS_REGION,
					credentials: {
						accessKeyId: AWS_ACCESS_KEY_ID,
						secretAccessKey: AWS_SECRET_ACCESS_KEY
					}
				}),
				{
					marshallOptions: { removeUndefinedValues: true }
				}
			);
		} catch (error: unknown) {
			this.logError('constructor', error);
			throw error;
		}
	}

	protected async getByUuid(uuid: string): Promise<T | null> {
		return await this.getBySecondaryIndex('uuid', 'uuid', uuid);
	}

	protected async getByShortId(shortId: string): Promise<T | null> {
		return await this.getBySecondaryIndex('shortId', 'shortId', shortId);
	}

	protected async get(
		partitionKeyValue: string,
		sortKeyValue?: string | number
	): Promise<T | null> {
		const key: { [x: string]: string | number } = {
			[this.partitionKey]: partitionKeyValue
		};

		if (this.sortKey && !sortKeyValue) {
			throw Error("Sort key value can't be null");
		}

		if (this.sortKey && sortKeyValue) {
			key[this.sortKey] = sortKeyValue;
		}

		const params = {
			TableName: this.table,
			Key: key
		};

		try {
			const command = new GetCommand(params);
			const response = await this.client.send(command);
			if (response.Item) {
				return response.Item as T;
			}
		} catch (error: unknown) {
			this.logError('get', error);
			throw error;
		}

		return null;
	}

	protected async getBySortingKeyBetween(
		partitionKeyValue: string,
		sortKeyStartValue: string | number,
		sorKeyEndValue: string | number
	): Promise<T[]> {
		if (this.sortKey == null) {
			return [];
		}

		const params: QueryCommandInput = {
			TableName: this.table,
			KeyConditionExpression: '#pk = :pkv AND #sk BETWEEN :sksv AND :skev',
			ExpressionAttributeNames: {
				'#pk': this.partitionKey,
				'#sk': this.sortKey
			},
			ExpressionAttributeValues: {
				':pkv': partitionKeyValue,
				':sksv': sortKeyStartValue,
				':skev': sorKeyEndValue
			}
		};

		try {
			return this.executeQueryCommandWithoutPagination(params);
		} catch (error: unknown) {
			this.logError('getBySortingKeyBetween', error);
			throw error;
		}
	}

	protected async getByPartitionKey(
		partitionKeyValue: string,
		ascendent: boolean = true
	): Promise<T[]> {
		const params: QueryCommandInput = {
			TableName: this.table,
			KeyConditionExpression: '#pk = :pkv',
			ExpressionAttributeNames: {
				'#pk': this.partitionKey
			},
			ExpressionAttributeValues: {
				':pkv': partitionKeyValue
			},
			ScanIndexForward: ascendent
		};

		try {
			return this.executeQueryCommandWithoutPagination(params);
		} catch (error: unknown) {
			this.logError('getByPartitionKey', error);
			throw error;
		}
	}

	protected async getByPartitionKeyPaginated(
		partitionKeyValue: string,
		ascendent: boolean = true,
		startKey?: string | number,
		limit?: number
	): Promise<IPaginatedDtoResult<T>> {
		const params: QueryCommandInput = {
			Limit: limit ?? this.defaultLimit,
			TableName: this.table,
			KeyConditionExpression: '#pk = :pkv',
			ExpressionAttributeNames: {
				'#pk': this.partitionKey
			},
			ExpressionAttributeValues: {
				':pkv': partitionKeyValue
			},
			ScanIndexForward: ascendent
		};

		try {
			return this.executeQueryCommandWithPagination(params, partitionKeyValue, startKey);
		} catch (error: unknown) {
			this.logError('getByPartitionKeyPaginated', error);
			throw error;
		}
	}

	protected async searchInNestedFields(
		partitionKeyValue: string,
		query: string,
		nestedAttributesMap: Map<string, string>,
		ascendent: boolean = true,
		indexName?: string,
		partitionKeyName?: string
	): Promise<T[]> {
		if (indexName != null && partitionKeyName == null) {
			throw Error('partitionKeyName is missing');
		}

		const pkExpression = { '#pk': indexName ? partitionKeyName! : this.partitionKey };
		const nestedAttributes = { ...pkExpression, ...Object.fromEntries(nestedAttributesMap) };
		const nestedQuery = `contains(${[...nestedAttributesMap.keys()].join('.')}, :query)`;

		const params: QueryCommandInput = {
			IndexName: indexName,
			TableName: this.table,
			KeyConditionExpression: '#pk = :pkv',
			FilterExpression: nestedQuery,
			ExpressionAttributeNames: nestedAttributes,
			ExpressionAttributeValues: {
				':pkv': partitionKeyValue,
				':query': query
			},
			ScanIndexForward: ascendent
		};

		try {
			return this.executeQueryCommandWithoutPagination(params);
		} catch (error: unknown) {
			this.logError('nested search', error);
			throw error;
		}
	}

	protected async search(
		partitionKeyValue: string,
		query: string,
		queryField: string,
		ascendent: boolean = true,
		indexName?: string,
		partitionKeyName?: string
	): Promise<T[]> {
		if (indexName != null && partitionKeyName == null) {
			throw Error('partitionKeyName is missing');
		}

		const params: QueryCommandInput = {
			IndexName: indexName,
			TableName: this.table,
			KeyConditionExpression: '#pk = :pkv',
			FilterExpression: 'contains(#attribute, :query)',
			ExpressionAttributeNames: {
				'#pk': indexName ? partitionKeyName! : this.partitionKey,
				'#attribute': queryField
			},
			ExpressionAttributeValues: {
				':pkv': partitionKeyValue,
				':query': query
			},
			ScanIndexForward: ascendent
		};

		try {
			return this.executeQueryCommandWithoutPagination(params);
		} catch (error: unknown) {
			this.logError('search', error);
			throw error;
		}
	}

	protected async updateField(
		partitionKeyValue: string,
		fieldName: string,
		value: string | number | ItemDto | boolean | undefined,
		sortKeyValue?: string | number
	) {
		const key: { [x: string]: string | number } = {
			[this.partitionKey]: partitionKeyValue
		};

		if (fieldName === this.partitionKey || fieldName === this.sortKey) {
			throw Error('PK or SK can not be modified');
		}

		if (this.sortKey && !sortKeyValue) {
			throw Error("Sort key value can't be null");
		}

		if (this.sortKey && sortKeyValue) {
			key[this.sortKey] = sortKeyValue;
		}

		const params: UpdateCommandInput = {
			TableName: this.table,
			Key: key,
			UpdateExpression: 'set #field = :value',
			ExpressionAttributeNames: {
				'#field': fieldName
			},
			ExpressionAttributeValues: {
				':value': value
			}
		};

		try {
			await this.client.send(new UpdateCommand(params));
		} catch (error: unknown) {
			this.logError('updateField', error);
			throw error;
		}
	}

	protected async updateNestedField(
		partitionKeyValue: string,
		nestedAttributesMap: Map<string, string>,
		value: string | number | ItemDto | boolean | undefined,
		sortKeyValue?: string | number
	) {
		const key: { [x: string]: string | number } = {
			[this.partitionKey]: partitionKeyValue
		};

		if (this.sortKey && !sortKeyValue) {
			throw Error("Sort key value can't be null");
		}

		if (this.sortKey && sortKeyValue) {
			key[this.sortKey] = sortKeyValue;
		}

		const updateExpresion = `set ${[...nestedAttributesMap.keys()].join('.')} = :value)`;

		const params: UpdateCommandInput = {
			TableName: this.table,
			Key: key,
			UpdateExpression: updateExpresion,
			ExpressionAttributeNames: Object.fromEntries(nestedAttributesMap),
			ExpressionAttributeValues: {
				':value': value
			}
		};

		try {
			await this.client.send(new UpdateCommand(params));
		} catch (error: unknown) {
			this.logError('updateField', error);
			throw error;
		}
	}

	protected async put(dto: T) {
		const input = {
			TableName: this.table,
			Item: dto as Record<string, AttributeValue>
		};

		try {
			await this.client.send(new PutCommand(input));
		} catch (error: unknown) {
			this.logError('put', error);
			throw error;
		}
	}

	// Will remove the object and crate a new one
	// to be used when PK or SK are modified
	protected async updateFullObject(oldDto: T, newDto: T) {
		const deleteParams = {
			TableName: this.table,
			Key: this.extractKeyFromDto(oldDto)
		};

		const putParams = {
			TableName: this.table,
			Item: newDto as Record<string, AttributeValue>
		};

		const params: TransactWriteCommandInput = {
			TransactItems: [
				{
					Delete: deleteParams
				},
				{
					Put: putParams
				}
			]
		};

		try {
			await this.client.send(new TransactWriteCommand(params));
		} catch (error) {
			this.logError('full update', error);
			throw error;
		}
	}

	protected async batchPut(dtoList: T[]) {
		const putRequests = dtoList.map((dto) => ({
			PutRequest: {
				Item: dto as Record<string, AttributeValue>
			}
		}));

		const chunkedRequests = _.chunk(putRequests, 25);
		const batchPromises = chunkedRequests.map((requests) => this.batchWrite(requests));

		try {
			await Promise.all(batchPromises);
		} catch (error: unknown) {
			this.logError('batchPut', error);
			throw error;
		}
	}

	protected async batchDelete(values: { partitionKey: string; sortKey?: string | number }[]) {
		const deleteRequests = values.map((value) => {
			const key: {
				[x: string]: string | number;
			} = {
				[this.partitionKey]: value.partitionKey
			};

			if (this.sortKey && value.sortKey) {
				key[this.sortKey] = value.sortKey;
			}

			return {
				DeleteRequest: {
					Key: key
				}
			};
		});

		const chunkedRequests = _.chunk(deleteRequests, 25);
		const batchPromises = chunkedRequests.map((requests) => this.batchWrite(requests));
		try {
			await Promise.all(batchPromises);
		} catch (error: unknown) {
			this.logError('batchDelete', error);
			throw error;
		}
	}

	protected async getBySecondaryIndex(
		indexName: string,
		partitionKeyName: string,
		partitionKeyValue: string | number
	): Promise<T | null> {
		const params = {
			TableName: this.table,
			IndexName: indexName,
			KeyConditionExpression: '#in = :iv',
			ExpressionAttributeNames: {
				'#in': partitionKeyName
			},
			ExpressionAttributeValues: {
				':iv': partitionKeyValue
			}
		};

		try {
			const command = new QueryCommand(params);
			const response = await this.client.send(command);
			if (response.Items && response.Items.length > 0) {
				return response.Items[0] as T;
			}
		} catch (error: unknown) {
			this.logError('get by secondary index', error);
			throw error;
		}

		return null;
	}

	protected async getBySecondaryIndexWithSortKey(
		indexName: string,
		partitionKeyName: string,
		partitionKeyValue: string | number,
		ascendent: boolean
	): Promise<T[]> {
		const params: QueryCommandInput = {
			TableName: this.table,
			IndexName: indexName,
			KeyConditionExpression: '#in = :iv',
			ExpressionAttributeNames: {
				'#in': partitionKeyName
			},
			ExpressionAttributeValues: {
				':iv': partitionKeyValue
			},
			ScanIndexForward: ascendent
		};

		try {
			return this.executeQueryCommandWithoutPagination(params);
		} catch (error: unknown) {
			this.logError('get by secondary index', error);
			throw error;
		}
	}

	private async executeQueryCommandWithoutPagination(params: QueryCommandInput): Promise<T[]> {
		const results: T[] = [];
		let lastEvaluatedKey: Record<string, NativeAttributeValue> | undefined;

		try {
			do {
				if (lastEvaluatedKey) {
					params.ExclusiveStartKey = lastEvaluatedKey;
				}

				const command = new QueryCommand(params);
				const response = await this.client.send(command);

				if (response.Items) {
					results.push(...(response.Items as T[]));
				}

				lastEvaluatedKey = response.LastEvaluatedKey;
			} while (lastEvaluatedKey);
		} catch (error: unknown) {
			this.logError('execute query command', error);
			throw error;
		}

		return results;
	}

	private async executeQueryCommandWithPagination(
		params: QueryCommandInput,
		partitionKeyValue: string | number,
		startKey?: string | number
	): Promise<IPaginatedDtoResult<T>> {
		try {
			const paginationKey =
				startKey && this.sortKey
					? { [this.partitionKey]: partitionKeyValue, [this.sortKey]: startKey }
					: undefined;

			params.ExclusiveStartKey = paginationKey;
			const command = new QueryCommand(params);
			const response = await this.client.send(command);

			const endKey =
				this.sortKey && response.LastEvaluatedKey
					? (response.LastEvaluatedKey[this.sortKey] as string | number | undefined)
					: undefined;

			return { elements: response.Items as T[], endKey };
		} catch (error: unknown) {
			this.logError('execute paginated query command', error);
			throw error;
		}
	}

	private async batchWrite(
		requests:
			| { PutRequest: { Item: Record<string, AttributeValue> } }[]
			| { DeleteRequest: { Key: { [x: string]: string | number } } }[]
	) {
		const params = {
			RequestItems: {
				[this.table]: requests
			}
		};

		try {
			await this.client.send(new BatchWriteCommand(params));
		} catch (error: unknown) {
			this.logError('batchWrite', error);
			throw error;
		}
	}

	private logError(functionName: string, error: unknown, otherInfo?: object) {
		console.error(
			`Error repo ${this.table}, partitionKey ${this.partitionKey}, sortkey ${
				this.sortKey
			}, and function ${functionName}: ${(error as Error).toString()}`
		);

		if (otherInfo) {
			console.error(JSON.stringify(otherInfo));
		}
	}

	private extractKeyFromDto(dto: T): { [x: string]: string | number } {
		const key = {
			[this.partitionKey]: (dto as { [key: string]: string | number })[this.partitionKey] as
				| string
				| number
		};

		if (this.sortKey) {
			key[this.sortKey] = (dto as { [key: string]: string | number })[this.sortKey] as
				| string
				| number;

			if (key[this.sortKey] == null) {
				throw Error('Sort key not found');
			}
		}

		return key;
	}
}
