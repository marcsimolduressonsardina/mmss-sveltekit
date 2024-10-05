import type { ConfigDto, ConfigValue } from './dto/config.dto';

export interface IConfigRepository {
	getConfigValue<T extends ConfigValue>(storeId: string, id: string): Promise<T | null>;
	storeConfigValue(configDto: ConfigDto): Promise<void>;
}
