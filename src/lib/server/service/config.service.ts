import type { AppUser } from '$lib/type/api.type';
import { ConfigRepositoryDynamoDb } from '../repository/dynamodb/config.repository.dynamodb';
import type { ConfigDto } from '../repository/dto/config.dto';
import { LOCATIONS_CONFIG_ID, type LocationsConfigType } from './constants/config.constants';
import type { IConfigRepository } from '../repository/config.repository.interface';

export class ConfigService {
	private readonly storeId: string;
	private repository: IConfigRepository;

	constructor(user: AppUser) {
		this.storeId = user.storeId;
		this.repository = new ConfigRepositoryDynamoDb();
	}

	public async getLocationsList(): Promise<LocationsConfigType> {
		const locations = await this.repository.getConfigValue<LocationsConfigType>(
			this.storeId,
			LOCATIONS_CONFIG_ID
		);

		if (locations == null) {
			return [];
		}

		return locations;
	}

	public async storeLocationsList(locations: LocationsConfigType) {
		const locationsDto: ConfigDto = {
			storeId: this.storeId,
			id: LOCATIONS_CONFIG_ID,
			value: locations
		};

		await this.repository.storeConfigValue(locationsDto);
	}
}
