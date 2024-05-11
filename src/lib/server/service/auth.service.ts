import type { AppUser, CustomSession, StaticUser } from '$lib/type/api.type';

export class AuthService {
	public static generateUserFromAuth(session?: CustomSession): AppUser | undefined {
		if (session == null) return undefined;
		const user = session.user;
		if (user == null || session.userMetadata.storeId == null) return undefined;
		return {
			id: user.id!,
			name: user.name!,
			storeId: session.userMetadata.storeId,
			priceManager: session.userMetadata.priceManager ?? false
		};
	}

	public static generateStaticUser(id: string, name: string, storeId: string): StaticUser {
		return {
			id,
			storeId,
			name,
			priceManager: false
		};
	}
}
