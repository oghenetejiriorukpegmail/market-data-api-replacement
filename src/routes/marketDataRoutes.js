const express = require('express');
const MarketDataController = require('../controllers/marketDataController');

const router = express.Router();
const marketDataController = new MarketDataController();

/**
 * @route GET /api/market-data/quote
 * @desc Get stock quote data
 * @param {string} symbol - Stock symbol
 * @param {string} provider - Data provider (optional)
 */
router.get('/quote', (req, res) => marketDataController.getQuote(req, res));

/**
 * @route GET /api/market-data/profile
 * @desc Get company profile data
 * @param {string} symbol - Stock symbol
 * @param {string} provider - Data provider (optional)
 */
router.get('/profile', (req, res) => marketDataController.getCompanyProfile(req, res));

/**
 * @route GET /api/market-data/historical
 * @desc Get historical price data
 * @param {string} symbol - Stock symbol
 * @param {string} interval - Time interval (optional, default: '1d')
 * @param {string} from - Start date (YYYY-MM-DD)
 * @param {string} to - End date (YYYY-MM-DD)
 * @param {string} provider - Data provider (optional)
 */
router.get('/historical', (req, res) => marketDataController.getHistoricalData(req, res));

/**
 * @route GET /api/market-data/options
 * @desc Get options chain data
 * @param {string} symbol - Stock symbol
 * @param {string} provider - Data provider (optional)
 */
router.get('/options', (req, res) => marketDataController.getOptionsChain(req, res));

/**
 * @route GET /api/market-data/indicators
 * @desc Calculate technical indicators
 * @param {string} symbol - Stock symbol
 * @param {string} interval - Time interval (optional, default: '1d')
 * @param {string} from - Start date (YYYY-MM-DD)
 * @param {string} to - End date (YYYY-MM-DD)
 * @param {string} provider - Data provider (optional)
 */
router.get('/indicators', (req, res) => marketDataController.calculateIndicators(req, res));

/**
 * @route GET /api/market-data/providers
 * @desc Get available data providers
 */
router.get('/providers', (req, res) => {
  res.status(200).json({
    providers: [
      {
        id: 'finnhub',
        name: 'Finnhub',
        description: 'Real-time RESTful APIs for global market data',
        website: 'https://finnhub.io/',
        features: ['Stock quotes', 'Company profiles', 'Historical data', 'Options chain']
      },
      {
        id: 'alphavantage',
        name: 'Alpha Vantage',
        description: 'Free APIs for realtime and historical stock data',
        website: 'https://www.alphavantage.co/',
        features: ['Stock quotes', 'Company profiles', 'Historical data']
      },
      {
        id: 'polygon',
        name: 'Polygon.io',
        description: 'Financial market data platform',
        website: 'https://polygon.io/',
        features: ['Stock quotes', 'Company profiles', 'Historical data', 'Options chain']
      }
    ]
  });
});

module.exports = router;