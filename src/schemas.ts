import { z } from '@hono/zod-openapi';


export const currencyCodeSchema = z.object({
	currencyCode: z
		.string()
		.openapi({
			param: {
				name: 'currencyCode',
				in: 'path',
			},
			example: 'USD',
		})
});

export const currencySchema = z.object({
	code: z.string(),
	name: z.string(),
	country: z.string(),
	countryCode: z.string(),
	symbol: z.string(),
	symbol_native: z.string(),
	rateUSD: z.number(),
	updatedAt: z.number(),
	flag: z.string(),
}).openapi('Currency');

export const ratesSchema = z.object({
	disclaimer: z.string(),
	license: z.string(),
	timestamp: z.number(),
	base: z.string(),
	rates: z.object({}),
}).openapi('Rates');