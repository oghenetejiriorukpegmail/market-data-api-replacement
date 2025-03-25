const MarketDataService = require('../services/marketDataService');

/**
 * Market Data Controller
 * Handles API requests and responses for market data
 */
class MarketDataController {
  constructor() {
    this.marketDataService = new MarketDataService();
  }

  /**
   * Get stock quote
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getQuote(req, res) {
    try {
      const { symbol, provider } = req.query;
      
      if (!symbol) {
        return res.status(400).json({
          message: 'Symbol parameter is required'
        });
      }
      
      const quote = await this.marketDataService.getQuote(symbol, provider);
      
      res.status(200).json(quote);
    } catch (error) {
      console.error('Error in getQuote controller:', error);
      res.status(500).json({
        message: 'Failed to fetch quote data',
        error: error.message
      });
    }
  }

  /**
   * Get company profile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getCompanyProfile(req, res) {
    try {
      const { symbol, provider } = req.query;
      
      if (!symbol) {
        return res.status(400).json({
          message: 'Symbol parameter is required'
        });
      }
      
      const profile = await this.marketDataService.getCompanyProfile(symbol, provider);
      
      res.status(200).json(profile);
    } catch (error) {
      console.error('Error in getCompanyProfile controller:', error);
      res.status(500).json({
        message: 'Failed to fetch company profile',
        error: error.message
      });
    }
  }

  /**
   * Get historical data
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getHistoricalData(req, res) {
    try {
      const { symbol, interval, from, to, provider } = req.query;
      
      if (!symbol) {
        return res.status(400).json({
          message: 'Symbol parameter is required'
        });
      }
      
      if (!from || !to) {
        return res.status(400).json({
          message: 'From and to date parameters are required'
        });
      }
      
      const historicalData = await this.marketDataService.getHistoricalData(
        symbol,
        interval || '1d',
        from,
        to,
        provider
      );
      
      res.status(200).json(historicalData);
    } catch (error) {
      console.error('Error in getHistoricalData controller:', error);
      res.status(500).json({
        message: 'Failed to fetch historical data',
        error: error.message
      });
    }
  }

  /**
   * Get options chain
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getOptionsChain(req, res) {
    try {
      const { symbol, provider } = req.query;
      
      if (!symbol) {
        return res.status(400).json({
          message: 'Symbol parameter is required'
        });
      }
      
      const optionsChain = await this.marketDataService.getOptionsChain(symbol, provider);
      
      res.status(200).json(optionsChain);
    } catch (error) {
      console.error('Error in getOptionsChain controller:', error);
      res.status(500).json({
        message: 'Failed to fetch options chain',
        error: error.message
      });
    }
  }

  /**
   * Calculate technical indicators
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async calculateIndicators(req, res) {
    try {
      const { symbol, interval, from, to, provider } = req.query;
      
      if (!symbol) {
        return res.status(400).json({
          message: 'Symbol parameter is required'
        });
      }
      
      if (!from || !to) {
        return res.status(400).json({
          message: 'From and to date parameters are required'
        });
      }
      
      // Get historical data first
      const historicalData = await this.marketDataService.getHistoricalData(
        symbol,
        interval || '1d',
        from,
        to,
        provider
      );
      
      // Calculate indicators based on historical data
      const indicators = this.marketDataService.calculateIndicators(historicalData.data);
      
      res.status(200).json({
        symbol,
        indicators,
        source: historicalData.source
      });
    } catch (error) {
      console.error('Error in calculateIndicators controller:', error);
      res.status(500).json({
        message: 'Failed to calculate indicators',
        error: error.message
      });
    }
  }
}

module.exports = MarketDataController;