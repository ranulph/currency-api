import { Hono } from "hono";
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { bearerAuth } from 'hono/bearer-auth';
import { token } from "./token";

type Bindings = {
	CURRENCIES: KVNamespace;
	APP_ID: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use('*', secureHeaders());
app.use('/*', cors());
app.use('/*', bearerAuth({ token }));

app.get('/currency/:code', async (c) => {

	const code = c.req.param('code');
	const kv = await c.env.CURRENCIES.get(code);
	if (kv) {
		const currency = JSON.parse(kv);
		return c.json(currency)
	}
	const error = { error: 'Currency not found', ok: false };
	return c.newResponse(JSON.stringify(error), 404)
});

app.get('/currencies', async (c) => {

	const kv = await c.env.CURRENCIES.get('currencies');
	if (kv) {
		const currencies = JSON.parse(kv);
		return c.json(currencies)
	}
	const error = { error: 'Incorrect request', ok: false };
	return c.newResponse(JSON.stringify(error), 404)
});

app.get('/rates', async (c) => {

	const kv = await c.env.CURRENCIES.get('rates');
	if (kv) {
		const rates = JSON.parse(kv);
		return c.json(rates)
	}
	const error = { error: 'Incorrect request', ok: false };
	return c.newResponse(JSON.stringify(error), 404)
});

app.get('/update', async (c) => {

	const currencies: currencyRateList = await fetch('https://openexchangerates.org/api/latest.json?app_id=' + c.env.APP_ID).then(res => res.json());
	await c.env.CURRENCIES.put('rates', JSON.stringify(currencies));
	const timestamp = currencies.timestamp;
	const rates = currencies.rates;
	for (const [currency, rate] of Object.entries(rates)) {
		let current = await c.env.CURRENCIES.get(currency);
		if (current) {
			let currentJSON = await JSON.parse(current)
			let updated = {
				...currentJSON,
				rateUSD: rate,
				updatedAt: timestamp
			};
			c.env.CURRENCIES.put(currency, JSON.stringify(updated))
		}
	}
	return c.json({ ok: true })

});


export default app;





type currencyRateList = {
	disclaimer: string;
	license: string;
	timestamp: number;
	base: string;
	rates: object;
};

