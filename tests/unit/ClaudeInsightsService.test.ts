// Unit test for ClaudeInsightsService using mocked Anthropic client

jest.mock('@anthropic-ai/sdk', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      messages: {
        create: jest.fn(),
      },
    })),
  };
});

import Anthropic from '@anthropic-ai/sdk';
import { ClaudeInsightsService } from '../../src/adapters/services/ClaudeInsightsService';

const mockCreate = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (Anthropic as unknown as jest.Mock).mockImplementation(() => ({
    messages: { create: mockCreate },
  }));
});

const mockInsightResponse = {
  summary: 'You spent more on dining this month.',
  recommendations: [
    { title: 'Reduce dining', description: 'Try cooking at home more', priority: 'high' },
  ],
  topCategories: { Dining: 450.00, Groceries: 200.00 },
  anomalies: null,
};

describe('ClaudeInsightsService', () => {
  describe('generateMonthlySummary', () => {
    it('calls Claude with the transaction data and returns parsed result', async () => {
      mockCreate.mockResolvedValueOnce({
        content: [{ type: 'text', text: JSON.stringify(mockInsightResponse) }],
      });

      const service = new ClaudeInsightsService();
      const result = await service.generateMonthlySummary(
        '2026-03-01',
        '2026-03-31',
        {
          totalIncome: 3000,
          totalExpenses: 1800,
          netBalance: 1200,
          byCategory: [
            { categoryId: 'cat-1', type: 'expense', total: 450, count: 12 },
          ],
        },
        { 'cat-1': 'Dining' }
      );

      expect(result.summary).toBe(mockInsightResponse.summary);
      expect(result.recommendations).toHaveLength(1);
      expect(result.modelUsed).toBe('claude-sonnet-4-6');
      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    it('includes modelUsed in the returned result', async () => {
      mockCreate.mockResolvedValueOnce({
        content: [{ type: 'text', text: JSON.stringify(mockInsightResponse) }],
      });

      const service = new ClaudeInsightsService();
      const result = await service.generateMonthlySummary('2026-03-01', '2026-03-31', {
        totalIncome: 0, totalExpenses: 0, netBalance: 0, byCategory: [],
      }, {});

      expect(result.modelUsed).toBe('claude-sonnet-4-6');
    });
  });

  describe('askQuestion', () => {
    it('returns Claude text response', async () => {
      mockCreate.mockResolvedValueOnce({
        content: [{ type: 'text', text: 'You spent $450 on dining.' }],
      });

      const service = new ClaudeInsightsService();
      const answer = await service.askQuestion('How much on dining?', {
        recentTransactions: [],
        totalIncome: 3000,
        totalExpenses: 1800,
        netBalance: 1200,
      });

      expect(answer).toBe('You spent $450 on dining.');
      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({ model: 'claude-sonnet-4-6' })
      );
    });
  });
});
