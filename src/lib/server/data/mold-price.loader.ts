import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
	MOLD_PRICES_BUCKET,
	AWS_REGION,
	AWS_ACCESS_KEY_ID,
	AWS_SECRET_ACCESS_KEY
} from '$env/static/private';
import { v4 as uuidv4 } from 'uuid';
import { read } from 'xlsx';

import { PricingFormula, PricingType } from '$lib/type/pricing.type';
import { PricingService } from '../service/pricing.service';
import type { ListPrice } from '$lib/type/api.type';

export class MoldPriceLoader {
	private service: PricingService;
	private s3Client: S3Client;
	constructor() {
		this.service = new PricingService();
		this.s3Client = new S3Client({
			region: AWS_REGION,
			credentials: {
				accessKeyId: AWS_ACCESS_KEY_ID,
				secretAccessKey: AWS_SECRET_ACCESS_KEY
			}
		});
	}

	public async generateFileUploadUrl(): Promise<{ filename: string; url: string }> {
		const filename = `${uuidv4()}.xlsx`;
		const params = {
			Bucket: MOLD_PRICES_BUCKET,
			Key: filename,
			ContentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
		};

		const url = await getSignedUrl(this.s3Client, new PutObjectCommand(params), {
			expiresIn: 350
		});
		return { filename, url };
	}

	public async loadMoldPrices(fileName: string): Promise<void> {
		const [currentPrices, newPrices] = await Promise.all([
			this.service.getPricingList(PricingType.MOLD),
			this.getPricesFromExcel(fileName)
		]);
		const toDeleteIds = currentPrices.filter((p) => !newPrices.has(p.id)).map((p) => p.id);
		await Promise.all([
			this.service.batchStoreListPrices(Array.from(newPrices.values())),
			this.service.deleteListPrices(PricingType.MOLD, toDeleteIds)
		]);
	}

	private async getPricesFromExcel(fileName: string): Promise<Map<string, ListPrice>> {
		const buffer = await this.getExcelFromS3(fileName);
		const file = read(buffer, { type: 'buffer' });
		const sheet = file.Sheets['TODAS'];
		if (sheet == null) throw Error('Sheet not found');

		const end = sheet['!ref']!.split(':')[1];
		const maxrow = parseInt(end!.split(/([A-Z])/)[2]!, 10);

		let count = 2;
		const prices = new Map<string, ListPrice>();
		while (count < maxrow) {
			const internalId = sheet[`A${count}`];
			const externalId = sheet[`B${count}`];
			const price = sheet[`H${count}`];

			if (internalId && externalId && price) {
				const id = `${internalId.v}_${externalId.v}`;
				if (Number.isNaN(Number(price.v))) {
					const cleanPrice = price.v.toString().replace(' ', '').replace(',', '.');
					if (!Number.isNaN(Number(cleanPrice))) {
						const calcPrice = Math.ceil(Number(cleanPrice) * 100) / 100;
						prices.set(id, MoldPriceLoader.createPricing(id, calcPrice));
					}
				} else {
					prices.set(id, MoldPriceLoader.createPricing(id, Math.ceil(Number(price.v) * 100) / 100));
				}
			}
			count += 1;
		}

		return prices;
	}

	private static createPricing(id: string, price: number): ListPrice {
		return {
			id,
			internalId: uuidv4(),
			price,
			description: 'Marco-Moldura',
			type: PricingType.MOLD,
			formula: PricingFormula.NONE,
			areas: []
		};
	}

	private async getExcelFromS3(fileName: string): Promise<ArrayBuffer> {
		const params = {
			Bucket: MOLD_PRICES_BUCKET,
			Key: fileName
		};

		const url = await getSignedUrl(this.s3Client, new GetObjectCommand(params), {
			expiresIn: 3600
		});

		try {
			// Using fetch instead of S3Client since it does not work on Cloudflare Pages
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error('Failed to retrieve file from S3.');
			}

			const arrayBuffer = await response.arrayBuffer();
			return arrayBuffer;
		} catch (error) {
			throw new Error(`Failed to retrieve file from S3: ${error}`);
		}
	}
}
