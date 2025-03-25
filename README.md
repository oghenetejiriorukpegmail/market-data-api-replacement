# Market Data API Replacement

A modern, reliable replacement for the deprecated Yahoo Finance API. This project provides a unified interface to access financial market data from multiple providers including Finnhub, Alpha Vantage, and Polygon.io.

## Features

- **Multiple Data Providers**: Access data from Finnhub, Alpha Vantage, and Polygon.io through a single API
- **Automatic Fallback**: If one provider fails, the API automatically tries another provider
- **Comprehensive Data**: Get quotes, company profiles, historical data, options chains, and technical indicators
- **Easy Integration**: Simple REST API that can be used with any frontend or backend

## API Endpoints

### Stock Quote

```
GET /api/market-data/quote?symbol=AAPL&provider=finnhub
```

Parameters:
- `symbol` (required): Stock symbol
- `provider` (optional): Data provider (finnhub, alphavantage, polygon)

### Company Profile

```
GET /api/market-data/profile?symbol=AAPL&provider=finnhub
```

Parameters:
- `symbol` (required): Stock symbol
- `provider` (optional): Data provider (finnhub, alphavantage, polygon)

### Historical Data

```
GET /api/market-data/historical?symbol=AAPL&interval=1d&from=2023-01-01&to=2023-12-31&provider=finnhub
```

Parameters:
- `symbol` (required): Stock symbol
- `interval` (optional): Time interval (1m, 5m, 15m, 30m, 1h, 1d, 1w, 1M)
- `from` (required): Start date (YYYY-MM-DD)
- `to` (required): End date (YYYY-MM-DD)
- `provider` (optional): Data provider (finnhub, alphavantage, polygon)

### Options Chain

```
GET /api/market-data/options?symbol=AAPL&provider=finnhub
```

Parameters:
- `symbol` (required): Stock symbol
- `provider` (optional): Data provider (finnhub, polygon)

### Technical Indicators

```
GET /api/market-data/indicators?symbol=AAPL&interval=1d&from=2023-01-01&to=2023-12-31&provider=finnhub
```

Parameters:
- `symbol` (required): Stock symbol
- `interval` (optional): Time interval (1d, 1w, 1M)
- `from` (required): Start date (YYYY-MM-DD)
- `to` (required): End date (YYYY-MM-DD)
- `provider` (optional): Data provider (finnhub, alphavantage, polygon)

### Available Providers

```
GET /api/market-data/providers
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- API keys for at least one of the supported data providers:
  - [Finnhub](https://finnhub.io/)
  - [Alpha Vantage](https://www.alphavantage.co/)
  - [Polygon.io](https://polygon.io/)

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/market-data-api-replacement.git
cd market-data-api-replacement
```

2. Install dependencies
```
npm install
```

3. Create a `.env` file based on `.env.example` and add your API keys
```
cp .env.example .env
```

4. Start the server
```
npm start
```

The server will start on port 3001 by default. You can change this in the `.env` file.

## Development

For development with auto-restart:
```
npm run dev
```

## Integration with Existing Projects

To integrate this API with your existing projects, simply update your API calls to point to this new service instead of Yahoo Finance.

Example:
```javascript
// Before (Yahoo Finance)
const response = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/AAPL');

// After (Market Data API Replacement)
const response = await fetch('http://localhost:3001/api/market-data/quote?symbol=AAPL');
```

## License

This project is licensed under the ISC License.