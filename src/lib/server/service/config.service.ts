import type { AppUser } from '$lib/type/api.type';
import { ConfigRepository } from '../repository/config.repository';
import type { ConfigDto } from '../repository/dto/config.dto';
import { LOCATIONS_CONFIG_ID, type LocationsConfigType } from './constants/config.constants';

export class ConfigService {
	private readonly storeId: string;
	private repository: ConfigRepository;

	constructor(user: AppUser) {
		this.storeId = user.storeId;
		this.repository = new ConfigRepository();
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
