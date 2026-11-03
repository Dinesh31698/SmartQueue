const queuePrediction = require('../src/services/queuePrediction');
const aiAssistant = require('../src/services/aiAssistant');

describe('Core Business Services Unit Tests', () => {
  describe('Queue Prediction Algorithm', () => {
    it('should calculate estimated wait time when no counters or tickets ahead are present', async () => {
      const result = await queuePrediction.calculateWaitTime('507f1f77bcf86cd799439011', 0);
      expect(result).toBeDefined();
      expect(result.estimatedMinutes).toBeGreaterThanOrEqual(1);
      expect(result.ticketsAhead).toBe(0);
      expect(result.activeCounters).toBeGreaterThanOrEqual(1);
    });

    it('should scale estimated wait time proportionally with tickets ahead', async () => {
      const zeroAhead = await queuePrediction.calculateWaitTime('507f1f77bcf86cd799439011', 0);
      const fiveAhead = await queuePrediction.calculateWaitTime('507f1f77bcf86cd799439011', 5);
      expect(fiveAhead.estimatedMinutes).toBeGreaterThanOrEqual(zeroAhead.estimatedMinutes);
    });
  });

  describe('AI Shopping Assistant Engine', () => {
    it('should return welcome greeting and helpful tips when query is empty', async () => {
      const response = await aiAssistant.processQuery('', null);
      expect(response).toBeDefined();
      expect(response.intent).toBe('GREETING');
      expect(response.reply).toContain('SmartQueue AI Assistant');
      expect(response.tips.length).toBeGreaterThan(0);
    });

    it('should recognize dietary healthy query intent', async () => {
      const response = await aiAssistant.processQuery('Show me healthy and organic snacks', null);
      expect(response).toBeDefined();
      expect(response.intent).toBe('HEALTHY_RECOMMENDATION');
      expect(response.reply).toContain('healthy');
    });

    it('should recognize aisle navigation query intent', async () => {
      const response = await aiAssistant.processQuery('Where is whole milk located?', null);
      expect(response).toBeDefined();
      expect(response.intent).toBe('AISLE_LOCATION');
    });

    it('should recognize budget optimizer query intent', async () => {
      const response = await aiAssistant.processQuery('Show cheap items under $10', null);
      expect(response).toBeDefined();
      expect(response.intent).toBe('BUDGET_OPTIMIZER');
    });

    it('should recognize recipe query intent', async () => {
      const response = await aiAssistant.processQuery('Recipe ingredients for breakfast', null);
      expect(response).toBeDefined();
      expect(response.intent).toBe('RECIPE_SUGGESTION');
      expect(response.reply).toContain('breakfast');
    });
  });
});
