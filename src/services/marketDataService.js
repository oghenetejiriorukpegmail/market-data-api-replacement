const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

// API Keys from environment variables
const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
const POLYGON_API_KEY = process.env.POLYGON_API_KEY;

/**
 * Market Data Service
 * Provides methods to fetch financial data from various providers
 */
class MarketDataService {
  constructor() {
    // Initialize API clients
    this.finnhubClient = axios.create({
      baseURL: 'https://finnhub.io/api/v1',
      timeout: 10000,
      headers: {
        'X-Finnhub-Token': FINNHUB_API_KEY
      }
    });

    this.alphaVantageClient = axios.create({
      baseURL: 'https://www.alphavantage.co/query',
      timeout: 10000
    });

    this.polygonClient = axios.create({
      baseURL: 'https://api.polygon.io',
      timeout: 10000,
      headers: {
        'Authorization': `Bearer ${POLYGON_API_KEY}`
      }
    });

    // Default provider
    this.defaultProvider = 'finnhub';
  }

  /**
   * Set the default data provider
   * @param {string} provider - Provider name ('finnhub', 'alphavantage', 'polygon')
   */
  setDefaultProvider(provider) {
    if (['finnhub', 'alphavantage', 'polygon'].includes(provider)) {
      this.defaultProvider = provider;
    } else {
      throw new Error('Invalid provider. Choose from: finnhub, alphavantage, polygon');
    }
  }

  /**
   * Get stock quote data
   * @param {string} symbol - Stock symbol
   * @param {string} provider - Data provider (optional)
   * @returns {Promise<Object>} Quote data
   */
  async getQuote(symbol, provider = this.defaultProvider) {
    try {
      switch (provider) {
        case 'finnhub':
          return await this.getQuoteFinnhub(symbol);
        case 'alphavantage':
          return await this.getQuoteAlphaVantage(symbol);
        case 'polygon':
          return await this.getQuotePolygon(symbol);
        default:
          return await this.getQuoteFinnhub(symbol);
      }
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      // Try fallback provider if primary fails
      if (provider === this.defaultProvider) {
        const fallbackProvider = provider === 'finnhub' ? 'alphavantage' : 'finnhub';
        console.log(`Trying fallback provider: ${fallbackProvider}`);
        return this.getQuote(symbol, fallbackProvider);
      }
      throw error;
    }
  }

  /**
   * Get quote data from Finnhub
   * @param {string} symbol - Stock symbol
   * @returns {Promise<Object>} Quote data
   */
  async getQuoteFinnhub(symbol) {
    const response = await this.finnhubClient.get(`/quote`, {
      params: { symbol }
    });
    
    return {
      symbol,
      price: response.data.c,
      change: response.data.d,
      percentChange: response.data.dp,
      high: response.data.h,
      low: response.data.l,
      open: response.data.o,
      previousClose: response.data.pc,
      timestamp: new Date().toISOString(),
      source: 'finnhub'
    };
  }

  /**
   * Get quote data from Alpha Vantage
   * @param {string} symbol - Stock symbol
   * @returns {Promise<Object>} Quote data
   */
  async getQuoteAlphaVantage(symbol) {
    const response = await this.alphaVantageClient.get('', {
      params: {
        function: 'GLOBAL_QUOTE',
        symbol,
        apikey: ALPHA_VANTAGE_API_KEY
      }
    });
    
    const quote = response.data['Global Quote'];
    
    return {
      symbol,
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      percentChange: parseFloat(quote['10. change percent'].replace('%', '')),
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      open: parseFloat(quote['02. open']),
      previousClose: parseFloat(quote['08. previous close']),
      timestamp: new Date().toISOString(),
      source: 'alphavantage'
    };
  }

  /**
   * Get quote data from Polygon.io
   * @param {string} symbol - Stock symbol
   * @returns {Promise<Object>} Quote data
   */
  async getQuotePolygon(symbol) {
    const response = await this.polygonClient.get(`/v2/snapshot/locale/us/markets/stocks/tickers/${symbol}`);
    
    const quote = response.data.ticker;
    
    return {
      symbol,
      price: quote.lastTrade.p,
      change: quote.todaysChange,
      percentChange: quote.todaysChangePerc,
      high: quote.day.h,
      low: quote.day.l,
      open: quote.day.o,
      previousClose: quote.prevDay.c,
      timestamp: new Date().toISOString(),
      source: 'polygon'
    };
  }

  /**
   * Get company profile
   * @param {string} symbol - Stock symbol
   * @param {string} provider - Data provider (optional)
   * @returns {Promise<Object>} Company profile data
   */
  async getCompanyProfile(symbol, provider = this.defaultProvider) {
    try {
      switch (provider) {
        case 'finnhub':
          return await this.getCompanyProfileFinnhub(symbol);
        case 'alphavantage':
          return await this.getCompanyProfileAlphaVantage(symbol);
        case 'polygon':
          return await this.getCompanyProfilePolygon(symbol);
        default:
          return await this.getCompanyProfileFinnhub(symbol);
      }
    } catch (error) {
      console.error(`Error fetching company profile for ${symbol}:`, error);
      // Try fallback provider if primary fails
      if (provider === this.defaultProvider) {
        const fallbackProvider = provider === 'finnhub' ? 'alphavantage' : 'finnhub';
        console.log(`Trying fallback provider: ${fallbackProvider}`);
        return this.getCompanyProfile(symbol, fallbackProvider);
      }
      throw error;
    }
  }

  /**
   * Get company profile from Finnhub
   * @param {string} symbol - Stock symbol
   * @returns {Promise<Object>} Company profile data
   */
  async getCompanyProfileFinnhub(symbol) {
    const response = await this.finnhubClient.get(`/stock/profile2`, {
      params: { symbol }
    });
    
    return {
      symbol,
      name: response.data.name,
      exchange: response.data.exchange,
      industry: response.data.finnhubIndustry,
      marketCap: response.data.marketCapitalization,
      logo: response.data.logo,
      weburl: response.data.weburl,
      source: 'finnhub'
    };
  }

  /**
   * Get company profile from Alpha Vantage
   * @param {string} symbol - Stock symbol
   * @returns {Promise<Object>} Company profile data
   */
  async getCompanyProfileAlphaVantage(symbol) {
    const response = await this.alphaVantageClient.get('', {
      params: {
        function: 'OVERVIEW',
        symbol,
        apikey: ALPHA_VANTAGE_API_KEY
      }
    });
    
    return {
      symbol,
      name: response.data.Name,
      exchange: response.data.Exchange,
      industry: response.data.Industry,
      marketCap: parseFloat(response.data.MarketCapitalization),
      weburl: null, // Not provided by Alpha Vantage
      source: 'alphavantage'
    };
  }

  /**
   * Get company profile from Polygon.io
   * @param {string} symbol - Stock symbol
   * @returns {Promise<Object>} Company profile data
   */
  async getCompanyProfilePolygon(symbol) {
    const response = await this.polygonClient.get(`/v3/reference/tickers/${symbol}`);
    
    const data = response.data.results;
    
    return {
      symbol,
      name: data.name,
      exchange: data.primary_exchange,
      industry: data.sic_description,
      marketCap: data.market_cap,
      logo: null, // Not directly provided by Polygon
      weburl: data.homepage_url,
      source: 'polygon'
    };
  }

  /**
   * Get historical price data
   * @param {string} symbol - Stock symbol
   * @param {string} interval - Time interval ('1d', '1h', etc.)
   * @param {string} from - Start date (YYYY-MM-DD)
   * @param {string} to - End date (YYYY-MM-DD)
   * @param {string} provider - Data provider (optional)
   * @returns {Promise<Object>} Historical price data
   */
  async getHistoricalData(symbol, interval = '1d', from, to, provider = this.defaultProvider) {
    try {
      // Convert dates to timestamps if they're not already
      const fromTimestamp = new Date(from).getTime() / 1000;
      const toTimestamp = new Date(to).getTime() / 1000;
      
      switch (provider) {
        case 'finnhub':
          return await this.getHistoricalDataFinnhub(symbol, interval, fromTimestamp, toTimestamp);
        case 'alphavantage':
          return await this.getHistoricalDataAlphaVantage(symbol, interval, from, to);
        case 'polygon':
          return await this.getHistoricalDataPolygon(symbol, interval, from, to);
        default:
          return await this.getHistoricalDataFinnhub(symbol, interval, fromTimestamp, toTimestamp);
      }
    } catch (error) {
      console.error(`Error fetching historical data for ${symbol}:`, error);
      // Try fallback provider if primary fails
      if (provider === this.defaultProvider) {
        const fallbackProvider = provider === 'finnhub' ? 'alphavantage' : 'finnhub';
        console.log(`Trying fallback provider: ${fallbackProvider}`);
        return this.getHistoricalData(symbol, interval, from, to, fallbackProvider);
      }
      throw error;
    }
  }

  /**
   * Get historical data from Finnhub
   * @param {string} symbol - Stock symbol
   * @param {string} interval - Time interval
   * @param {number} from - Start timestamp
   * @param {number} to - End timestamp
   * @returns {Promise<Object>} Historical price data
   */
  async getHistoricalDataFinnhub(symbol, interval, from, to) {
    // Map interval to Finnhub resolution
    const resolutionMap = {
      '1m': '1',
      '5m': '5',
      '15m': '15',
      '30m': '30',
      '1h': '60',
      '1d': 'D',
      '1w': 'W',
      '1M': 'M'
    };
    
    const resolution = resolutionMap[interval] || 'D';
    
    const response = await this.finnhubClient.get(`/stock/candle`, {
      params: {
        symbol,
        resolution,
        from,
        to
      }
    });
    
    // Format the response
    const data = [];
    for (let i = 0; i < response.data.t.length; i++) {
      data.push({
        timestamp: new Date(response.data.t[i] * 1000).toISOString(),
        open: response.data.o[i],
        high: response.data.h[i],
        low: response.data.l[i],
        close: response.data.c[i],
        volume: response.data.v[i]
      });
    }
    
    return {
      symbol,
      interval,
      data,
      source: 'finnhub'
    };
  }

  /**
   * Get historical data from Alpha Vantage
   * @param {string} symbol - Stock symbol
   * @param {string} interval - Time interval
   * @param {string} from - Start date
   * @param {string} to - End date
   * @returns {Promise<Object>} Historical price data
   */
  async getHistoricalDataAlphaVantage(symbol, interval, from, to) {
    // Map interval to Alpha Vantage function and interval
    let functionName = 'TIME_SERIES_DAILY';
    let outputSize = 'full';
    let dataKey = 'Time Series (Daily)';
    
    if (interval === '1m' || interval === '5m' || interval === '15m' || interval === '30m') {
      functionName = 'TIME_SERIES_INTRADAY';
      dataKey = `Time Series (${interval.replace('m', ' min')})`;
    } else if (interval === '1h') {
      functionName = 'TIME_SERIES_INTRADAY';
      dataKey = 'Time Series (60 min)';
    } else if (interval === '1w') {
      functionName = 'TIME_SERIES_WEEKLY';
      dataKey = 'Weekly Time Series';
    } else if (interval === '1M') {
      functionName = 'TIME_SERIES_MONTHLY';
      dataKey = 'Monthly Time Series';
    }
    
    const response = await this.alphaVantageClient.get('', {
      params: {
        function: functionName,
        symbol,
        interval: interval.replace('m', 'min').replace('1h', '60min'),
        outputsize: outputSize,
        apikey: ALPHA_VANTAGE_API_KEY
      }
    });
    
    const timeSeriesData = response.data[dataKey];
    const fromDate = new Date(from);
    const toDate = new Date(to);
    
    // Format the response
    const data = [];
    for (const date in timeSeriesData) {
      const currentDate = new Date(date);
      if (currentDate >= fromDate && currentDate <= toDate) {
        data.push({
          timestamp: currentDate.toISOString(),
          open: parseFloat(timeSeriesData[date]['1. open']),
          high: parseFloat(timeSeriesData[date]['2. high']),
          low: parseFloat(timeSeriesData[date]['3. low']),
          close: parseFloat(timeSeriesData[date]['4. close']),
          volume: parseInt(timeSeriesData[date]['5. volume'])
        });
      }
    }
    
    // Sort by date ascending
    data.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    return {
      symbol,
      interval,
      data,
      source: 'alphavantage'
    };
  }

  /**
   * Get historical data from Polygon.io
   * @param {string} symbol - Stock symbol
   * @param {string} interval - Time interval
   * @param {string} from - Start date
   * @param {string} to - End date
   * @returns {Promise<Object>} Historical price data
   */
  async getHistoricalDataPolygon(symbol, interval, from, to) {
    // Map interval to Polygon.io multiplier and timespan
    let multiplier = 1;
    let timespan = 'day';
    
    if (interval === '1m') {
      multiplier = 1;
      timespan = 'minute';
    } else if (interval === '5m') {
      multiplier = 5;
      timespan = 'minute';
    } else if (interval === '15m') {
      multiplier = 15;
      timespan = 'minute';
    } else if (interval === '30m') {
      multiplier = 30;
      timespan = 'minute';
    } else if (interval === '1h') {
      multiplier = 1;
      timespan = 'hour';
    } else if (interval === '1d') {
      multiplier = 1;
      timespan = 'day';
    } else if (interval === '1w') {
      multiplier = 1;
      timespan = 'week';
    } else if (interval === '1M') {
      multiplier = 1;
      timespan = 'month';
    }
    
    const response = await this.polygonClient.get(`/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${from}/${to}`);
    
    // Format the response
    const data = response.data.results.map(item => ({
      timestamp: new Date(item.t).toISOString(),
      open: item.o,
      high: item.h,
      low: item.l,
      close: item.c,
      volume: item.v
    }));
    
    return {
      symbol,
      interval,
      data,
      source: 'polygon'
    };
  }

  /**
   * Get options chain data
   * @param {string} symbol - Stock symbol
   * @param {string} provider - Data provider (optional)
   * @returns {Promise<Object>} Options chain data
   */
  async getOptionsChain(symbol, provider = this.defaultProvider) {
    try {
      switch (provider) {
        case 'finnhub':
          return await this.getOptionsChainFinnhub(symbol);
        case 'polygon':
          return await this.getOptionsChainPolygon(symbol);
        default:
          return await this.getOptionsChainFinnhub(symbol);
      }
    } catch (error) {
      console.error(`Error fetching options chain for ${symbol}:`, error);
      // Try fallback provider if primary fails
      if (provider === this.defaultProvider && provider !== 'polygon') {
        console.log(`Trying fallback provider: polygon`);
        return this.getOptionsChain(symbol, 'polygon');
      }
      throw error;
    }
  }

  /**
   * Get options chain from Finnhub
   * @param {string} symbol - Stock symbol
   * @returns {Promise<Object>} Options chain data
   */
  async getOptionsChainFinnhub(symbol) {
    const response = await this.finnhubClient.get(`/stock/option-chain`, {
      params: { symbol }
    });
    
    return {
      symbol,
      expirationDates: response.data.data.map(item => item.expirationDate),
      options: response.data.data.flatMap(expiry => {
        return [
          ...expiry.options.CALL.map(call => ({
            type: 'call',
            symbol: call.contractName,
            strike: call.strike,
            expiration: expiry.expirationDate,
            lastPrice: call.lastPrice,
            change: call.change,
            volume: call.volume,
            openInterest: call.openInterest,
            impliedVolatility: call.impliedVolatility
          })),
          ...expiry.options.PUT.map(put => ({
            type: 'put',
            symbol: put.contractName,
            strike: put.strike,
            expiration: expiry.expirationDate,
            lastPrice: put.lastPrice,
            change: put.change,
            volume: put.volume,
            openInterest: put.openInterest,
            impliedVolatility: put.impliedVolatility
          }))
        ];
      }),
      source: 'finnhub'
    };
  }

  /**
   * Get options chain from Polygon.io
   * @param {string} symbol - Stock symbol
   * @returns {Promise<Object>} Options chain data
   */
  async getOptionsChainPolygon(symbol) {
    // Get current date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    const response = await this.polygonClient.get(`/v3/reference/options/contracts`, {
      params: {
        underlying_ticker: symbol,
        as_of: today,
        limit: 1000
      }
    });
    
    // Extract unique expiration dates
    const expirationDates = [...new Set(response.data.results.map(item => item.expiration_date))];
    
    // Format the options data
    const options = response.data.results.map(item => ({
      type: item.contract_type.toLowerCase(),
      symbol: item.ticker,
      strike: item.strike_price,
      expiration: item.expiration_date,
      lastPrice: null, // Not included in reference endpoint
      change: null, // Not included in reference endpoint
      volume: null, // Not included in reference endpoint
      openInterest: null, // Not included in reference endpoint
      impliedVolatility: null // Not included in reference endpoint
    }));
    
    return {
      symbol,
      expirationDates,
      options,
      source: 'polygon'
    };
  }

  /**
   * Calculate technical indicators
   * @param {Array} prices - Array of price data
   * @returns {Object} Technical indicators
   */
  calculateIndicators(prices) {
    if (!prices || prices.length === 0) {
      return {};
    }

    // Extract close prices
    const closePrices = prices.map(price => price.close);
    
    // Calculate RSI (Relative Strength Index)
    const rsi = this.calculateRSI(closePrices, 14);
    
    // Calculate EMAs (Exponential Moving Averages)
    const emaShort = this.calculateEMA(closePrices, 12);
    const emaLong = this.calculateEMA(closePrices, 26);
    
    // Calculate MACD (Moving Average Convergence Divergence)
    const macd = this.calculateMACD(closePrices);
    
    return {
      rsi,
      emaShort,
      emaLong,
      macd
    };
  }

  /**
   * Calculate RSI (Relative Strength Index)
   * @param {Array} prices - Array of price data
   * @param {number} period - Period for calculation
   * @returns {number} RSI value
   */
  calculateRSI(prices, period = 14) {
    if (prices.length < period + 1) {
      return null;
    }

    // Calculate price changes
    const changes = [];
    for (let i = 1; i < prices.length; i++) {
      changes.push(prices[i] - prices[i - 1]);
    }

    // Calculate gains and losses
    const gains = changes.map(change => change > 0 ? change : 0);
    const losses = changes.map(change => change < 0 ? Math.abs(change) : 0);

    // Calculate average gain and average loss
    let avgGain = gains.slice(0, period).reduce((sum, gain) => sum + gain, 0) / period;
    let avgLoss = losses.slice(0, period).reduce((sum, loss) => sum + loss, 0) / period;

    // Calculate RS and RSI for the first period
    let rs = avgGain / (avgLoss === 0 ? 0.001 : avgLoss); // Avoid division by zero
    let rsiValues = [100 - (100 / (1 + rs))];

    // Calculate RSI for the remaining periods
    for (let i = period; i < changes.length; i++) {
      avgGain = ((avgGain * (period - 1)) + (changes[i] > 0 ? changes[i] : 0)) / period;
      avgLoss = ((avgLoss * (period - 1)) + (changes[i] < 0 ? Math.abs(changes[i]) : 0)) / period;
      
      rs = avgGain / (avgLoss === 0 ? 0.001 : avgLoss);
      rsiValues.push(100 - (100 / (1 + rs)));
    }

    return rsiValues[rsiValues.length - 1];
  }

  /**
   * Calculate EMA (Exponential Moving Average)
   * @param {Array} prices - Array of price data
   * @param {number} period - Period for calculation
   * @returns {number} EMA value
   */
  calculateEMA(prices, period = 12) {
    if (prices.length < period) {
      return null;
    }

    // Calculate SMA (Simple Moving Average) for the initial EMA value
    const sma = prices.slice(0, period).reduce((sum, price) => sum + price, 0) / period;
    
    // Calculate multiplier
    const multiplier = 2 / (period + 1);
    
    // Calculate EMA
    let ema = sma;
    for (let i = period; i < prices.length; i++) {
      ema = (prices[i] - ema) * multiplier + ema;
    }
    
    return ema;
  }

  /**
   * Calculate MACD (Moving Average Convergence Divergence)
   * @param {Array} prices - Array of price data
   * @returns {Object} MACD values
   */
  calculateMACD(prices) {
    // Calculate 12-day EMA
    const ema12 = this.calculateEMA(prices, 12);
    
    // Calculate 26-day EMA
    const ema26 = this.calculateEMA(prices, 26);
    
    // Calculate MACD line
    const macdLine = ema12 - ema26;
    
    // Calculate signal line (9-day EMA of MACD line)
    // For simplicity, we'll just return the MACD line value
    
    return {
      macdLine,
      signalLine: null, // Would require historical MACD values to calculate
      histogram: null // Would require signal line to calculate
    };
  }
}

module.exports = MarketDataService;