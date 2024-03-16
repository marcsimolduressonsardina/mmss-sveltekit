import type { AppUser } from '$lib/type/api.type';
import type { User } from '@auth/sveltekit';

export class AuthService {
	public static generateUserFromAuth(user?: User): AppUser | undefined {
		if (!user) return undefined;
		return AuthService.generateUserFromId(user.email!);
	}

	public static generateUserFromId(id: string): AppUser | undefined {
		const idParts = id.split('_');
		if (idParts.length !== 2) {
			return undefined;
		}

		const [storeId, name] = idParts;

		if (storeId == null || name == null) {
			return undefined;
		}

		return {
			id,
			storeId,
			name
		};
	}

	public static generateUsersFromIds(ids: Set<string>): Map<string, AppUser> {
		const users = new Map<string, AppUser>();
		Array.from(ids).forEach((id) => {
			const user = AuthService.generateUserFromId(id);
			if (user) {
				users.set(id, user);
			}
		});
		return users;
	}
}
