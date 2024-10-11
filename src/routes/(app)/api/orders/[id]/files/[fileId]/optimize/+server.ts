import { AuthService } from '$lib/server/service/auth.service';
import type { CustomSession } from '$lib/type/api.type';
import { FileService, OrderService } from '@marcsimolduressonsardina/core';
import sharp from 'sharp';
import { json } from '@sveltejs/kit';

export async function POST({ locals, params }) {
	const session = await locals.auth();
	const appUser = AuthService.generateUserFromAuth(session as CustomSession);
	if (!appUser) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { id, fileId } = params;
	const config = AuthService.generateConfiguration(appUser);
	const fileService = new FileService(config);
	const orderService = new OrderService(config);
	const order = await orderService.getOrderById(id);
	if (order == null) {
		return json({ error: 'Order not found' }, { status: 404 });
	}

	const fileBuffer = await fileService.getImageBufferForOptimization(id, fileId);
	if (fileBuffer != null) {
		const optimizedImage = await sharp(fileBuffer.file)
			.resize(FileService.optimizedImageSize)
			.jpeg(FileService.optimizedImageQuality)
			.toBuffer();

		const thumbnail = await sharp(fileBuffer.file)
			.resize(FileService.thumbnailImageSize)
			.toBuffer();

		await fileService.storeOptimizations(
			id,
			fileId,
			fileBuffer.contentType,
			optimizedImage,
			thumbnail
		);
	}
	return json({ result: 'ok' });
}
