import { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } from '$env/static/private';
import {
	type AttributeValue,
	DynamoDBClient,
	type KeysAndAttributes
} from '@aws-sdk/client-dynamodb';
import {
	DynamoDBDocument,
	type DynamoDBDocumentClient,
	QueryCommand,
	GetCommand,
	PutCommand,
	type BatchGetCommandInput,
	BatchGetCommand,
	BatchWriteCommand,
	type UpdateCommandInput,
	UpdateCommand
} from '@aws-sdk/lib-dynamodb';
import _ from 'lodash';
import type { ItemDto } from './dto/item.dto';

export abstract class DynamoRepository<T> {
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
		return await this.getBySecondaryIndex('uuid', uuid);
	}

	protected async getByShortId(shortId: string): Promise<T | null> {
		return await this.getBySecondaryIndex('shortId', shortId);
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

		const params = {
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
			const command = new QueryCommand(params);
			const response = await this.client.send(command);
			if (response.Items) {
				return response.Items as T[];
			}
		} catch (error: unknown) {
			this.logError('getBySortingKeyBetween', error);
			throw error;
		}

		return [];
	}

	protected async getByPartitionKey(partitionKeyValue: string): Promise<T[]> {
		const params = {
			TableName: this.table,
			KeyConditionExpression: '#pk = :pkv',
			ExpressionAttributeNames: {
				'#pk': this.partitionKey
			},
			ExpressionAttributeValues: {
				':pkv': partitionKeyValue
			}
		};

		try {
			const command = new QueryCommand(params);
			const response = await this.client.send(command);
			if (response.Items) {
				return response.Items as T[];
			}
		} catch (error: unknown) {
			this.logError('getByPartitionKey', error);
			throw error;
		}

		return [];
	}

	protected async getByPartitionKeys(partitionKeyValues: string[]): Promise<T[]> {
		const requestItems: { [key: string]: KeysAndAttributes } = {};
		requestItems[this.table] = {
			Keys: partitionKeyValues.map((keyValue) => ({ [this.partitionKey]: { S: keyValue } }))
		};

		const params: BatchGetCommandInput = {
			RequestItems: requestItems
		};

		try {
			const command = new BatchGetCommand(params);
			const response = await this.client.send(command);
			if (response.Responses) {
				return response.Responses[this.table] as T[];
			}
		} catch (error: unknown) {
			this.logError('getByPartitionKeys', error);
			throw error;
		}

		return [];
	}

	protected async updateField(
		partitionKeyValue: string,
		fieldName: string,
		value: string | number | ItemDto | boolean,
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

	private async getBySecondaryIndex(
		indexName: string,
		indexValue: string | number
	): Promise<T | null> {
		const params = {
			TableName: this.table,
			IndexName: indexName,
			KeyConditionExpression: '#in = :iv',
			ExpressionAttributeNames: {
				'#in': indexName
			},
			ExpressionAttributeValues: {
				':iv': indexValue
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
}
