import type { AppUser, CustomSession, StaticUser } from '$lib/type/api.type';

export class AuthService {
	public static generateUserFromAuth(session?: CustomSession): AppUser | undefined {
		if (
			session == null ||
			session.user == null ||
			session.userMetadata == null ||
			session.userMetadata.storeId == null
		) {
			return undefined;
		}

		return {
			id: session.user.id!,
			name: session.user.name!,
			storeId: session.userMetadata.storeId,
			priceManager: session.userMetadata.priceManager ?? false
		};
	}

	public static generateStaticUser(id: string, name: string, storeId: string): StaticUser {
		return {
			id,
			storeId,
			name
		};
	}
}
