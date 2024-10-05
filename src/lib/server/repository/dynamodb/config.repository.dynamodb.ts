import { CONFIG_TABLE } from '$env/static/private';
import type { IConfigRepository } from '../config.repository.interface';

import type { ConfigDto, ConfigValue } from '../dto/config.dto';
import { DynamoRepository } from './dynamo.repository';

export class ConfigRepositoryDynamoDb
	extends DynamoRepository<ConfigDto>
	implements IConfigRepository
{
	constructor() {
		super(CONFIG_TABLE, 'storeId', 'id');
	}

	async getConfigValue<T extends ConfigValue>(storeId: string, id: string): Promise<T | null> {
		const valueFromDb = await this.get(storeId, id);
		if (valueFromDb != null) {
			return valueFromDb.value as T;
		}

		return null;
	}

	async storeConfigValue(configDto: ConfigDto) {
		await this.put(configDto);
	}
}
