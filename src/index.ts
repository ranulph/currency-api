import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { bearerAuth } from 'hono/bearer-auth';
import { token } from "./token";
import { currencyCodeSchema, currencySchema, ratesSchema } from "./schemas";
import { swaggerUI } from '@hono/swagger-ui';
import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';


type Bindings = {
	CURRENCIES: KVNamespace;
	APP_ID: string;
};

const app = new OpenAPIHono<{ Bindings: Bindings }>()

app.get('/ui', swaggerUI({ url: '/doc' }));
app.doc('/doc', {
	info: {
	  title: 'Currencies API',
	  version: 'v1',
	  description: 'Request rates and details for 170 currencies. USD base rate. Updated hourly. Requires Bearer Authentication.'
	},
	openapi: '3.1.0'
});

app.use('*', secureHeaders());
app.use('/*', cors());
app.use('/*', bearerAuth({ token }));


app.openapi(
	createRoute({
		method: 'get',
		path: '/currency/{currencyCode}',
		request: {
			params: currencyCodeSchema,
		},
		responses: {
			200: {
				description: 'Request individual currency details with rate and Base64 encoded SVG country flag. Updated hourly. Supply currency code (USD, AUD). 2KB',
				content: {
					'application/json': {
						schema: currencySchema
					}
				}
			},
			401: {
				description: 'Unauthorized. Requires Bearer Auth.',
				content: {
					'application/json': {
						schema: z.string()
					}
				}
			},
			404: {
				description: 'Currency not found.',
				content: {
					'application/json': {
						schema: z.object({
							error: z.string(),
							ok: z.boolean(),
						})
					}
				}
			}
		}
	}),
	async (c) => {
		const { currencyCode } = c.req.valid('param')
		const kv = await c.env.CURRENCIES.get(currencyCode);
		if (kv) {
			const currency = JSON.parse(kv);
			return c.json(currency)
		}
		const error = { error: 'Currency not found', ok: false };
		return c.newResponse(JSON.stringify(error), 404)
	}
);

app.openapi(
	createRoute({
		method: 'get',
		path: '/currencies',
		responses: {
			200: {
				description: 'Request all currencies, with details, rate and SVG country flag link. Updated hourly. 34KB',
				content: {
					'application/json': {
						schema: z.array(z.object({
							key: z.string(),
							value: currencySchema
						}))
					}
				}
			},
			401: {
				description: 'Unauthorized. Requires Bearer Auth.',
				content: {
					'application/json': {
						schema: z.string()
					}
				}
			},
			500: {
				description: 'Server Error. Unable to retrieve currencies list.',
				content: {
					'application/json': {
						schema: z.object({
							error: z.string(),
							ok: z.boolean(),
						})
					}
				}
			}
		}
	}),
	async (c) => {
		const kv = await c.env.CURRENCIES.get('currencies');
		if (kv) {
			const currencies = JSON.parse(kv);
			return c.json(currencies)
		}
		const error = { error: 'Server Error. Unable to retrieve currencies list.', ok: false };
		return c.newResponse(JSON.stringify(error), 500)
	}
);

app.openapi(
	createRoute({
		method: 'get',
		path: '/rates',
		responses: {
			200: {
				description: 'Request currency rates. Updated hourly. Sourced from openexchangerates.org. 4KB',
				content: {
					'application/json': {
						schema: ratesSchema
					}
				}
			},
			401: {
				description: 'Unauthorized. Requires Bearer Auth.',
				content: {
					'application/json': {
						schema: z.string()
					}
				}
			},
			500: {
				description: 'Server Error. Unable to retrieve rates list.',
				content: {
					'application/json': {
						schema: z.object({
							error: z.string(),
							ok: z.boolean(),
						})
					}
				}
			}
		}
	}),
	async (c) => {
		const kv = await c.env.CURRENCIES.get('rates');
		if (kv) {
			const rates = JSON.parse(kv);
			return c.json(rates)
		}
		const error = { error: 'Server Error. Unable to retrieve rates list.', ok: false };
		return c.newResponse(JSON.stringify(error), 500)
	}
);

app.openapi(
	createRoute({
		method: 'get',
		path: '/update',
		responses: {
			200: {
				description: 'Execute manual rates update.',
				content: {
					'application/json': {
						schema: z.object({ message: z.string(), ok: z.boolean() })
					}
				}
			},
			401: {
				description: 'Unauthorized. Requires Bearer Auth.',
				content: {
					'application/json': {
						schema: z.string()
					}
				}
			},
			500: {
				description: 'Server Error. Unable to update currencies.',
				content: {
					'application/json': {
						schema: z.object({
							error: z.string(),
							ok: z.boolean(),
						})
					}
				}
			}
		}
	}),
	async (c) => {

		try {
			const currencies: z.infer<typeof ratesSchema> = await fetch('https://openexchangerates.org/api/latest.json?app_id=' + c.env.APP_ID).then(res => res.json());
			await c.env.CURRENCIES.put('rates', JSON.stringify(currencies));
			const timestamp = currencies.timestamp;
			const rates = currencies.rates;
			const updatedList = [];
			for (const [currencyCode, rate] of Object.entries(rates)) {
				let currentJSON = await c.env.CURRENCIES.get(currencyCode);
				if (currentJSON) {
					let current: z.infer<typeof currencySchema> = await JSON.parse(currentJSON)
					let updated = {
						...current,
						rateUSD: rate,
						updatedAt: timestamp
					};
					c.env.CURRENCIES.put(currencyCode, JSON.stringify(updated))
					let updatedListItem = {
						key: currencyCode,
						value: {
							...updated,
							flag: "https://images.identify.run/flags/" + updated.countryCode.toLowerCase() + ".svg"
						}
					};
					updatedList.push(updatedListItem);
	
				}
			}
			c.env.CURRENCIES.put('currencies', JSON.stringify(updatedList));
			return c.json({ message: "Currencies updated", ok: true })

		} catch (err) {
			const error = { error: 'Server Error. Unable to update currencies', err: err, ok: false };
			return c.newResponse(JSON.stringify(error), 500)		
		}
	}
);


export default app;
