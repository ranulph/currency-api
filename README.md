
## Currency API  
\
See https://api.currencies.worlddata.run/ui for OpenAPI/Swagger documentation web interface.  
Currency rates auto update every hour. ~170 currencies.  
Uses Cloudflare Workers, Cloudflare KVStore, openexchangerates.org for rates, Hono, Hono OpenAPI plugin.  
\
Provides a SVG flag, encoded in a Base64 string. Can be placed directly into a HTML img tag src=.  
\
Email ranulph@mailfence.com if you would like a Bearer Auth token.  
\
\ 
\ 
An example API response (2KB) to GET 'https://api.currencies.worlddata.run/currency/GBP':  
\ 
{  
  "code": "GBP",  
  "name": "Pound Sterling",  
  "country": "United Kingdom",  
  "countryCode": "GB",  
  "symbol": "£",  
  "symbol_native": "£",  
  "rateUSD": 0.802762,  
  "updatedAt": 1700359217,  
  "flag": 
"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMjAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDYwIDMwIj48Y2xpcFBhdGggaWQ9ImEiPjxwYXRoIGQ9Ik0wIDB2MzBoNjBWMHoiLz48L2NsaXBQYXRoPjxjbGlwUGF0aCBpZD0iYiI+PHBhdGggZD0iTTMwIDE1aDMwdjE1enYxNUgwekgwVjB6VjBoMzB6Ii8+PC9jbGlwUGF0aD48ZyBjbGlwLXBhdGg9InVybCgjYSkiPjxwYXRoIGZpbGw9IiMwMTIxNjkiIGQ9Ik0wIDB2MzBoNjBWMHoiLz48cGF0aCBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iNiIgZD0ibTAgMCA2MCAzMG0wLTMwTDAgMzAiLz48cGF0aCBzdHJva2U9IiNDODEwMkUiIHN0cm9rZS13aWR0aD0iNCIgZD0ibTAgMCA2MCAzMG0wLTMwTDAgMzAiIGNsaXAtcGF0aD0idXJsKCNiKSIvPjxwYXRoIHN0cm9rZT0iI2ZmZiIgc3Ryb2tlLXdpZHRoPSIxMCIgZD0iTTMwIDB2MzBNMCAxNWg2MCIvPjxwYXRoIHN0cm9rZT0iI0M4MTAyRSIgc3Ryb2tlLXdpZHRoPSI2IiBkPSJNMzAgMHYzME0wIDE1aDYwIi8+PC9nPjwvc3ZnPg=="  
}  
