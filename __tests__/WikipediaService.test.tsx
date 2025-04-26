import { searchMedicalWikipedia } from '../src/services/WikipediaService';

// Mock für fetch
global.fetch = jest.fn();

describe('WikipediaService', () => {
  beforeEach(() => {
    // Reset fetch mock
    (global.fetch as jest.Mock).mockClear();
  });

  it('returns search results for valid medical terms', async () => {
    const mockResponse = {
      query: {
        search: [
          {
            pageid: 123,
            title: 'Diabetes mellitus',
            snippet: 'Diabetes mellitus ist eine Stoffwechselerkrankung...',
          },
        ],
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse),
    });

    const results = await searchMedicalWikipedia('Diabetes', 'de', 1);
    
    expect(results).toHaveLength(1);
    expect(results[0].title).toBe('Diabetes mellitus');
    expect(results[0].snippet).toContain('Stoffwechselerkrankung');
  });

  it('handles empty search results', async () => {
    const mockResponse = {
      query: {
        search: [],
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse),
    });

    const results = await searchMedicalWikipedia('nonexistentterm', 'de', 1);
    expect(results).toHaveLength(0);
  });

  it('handles API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    await expect(searchMedicalWikipedia('error', 'de', 1)).rejects.toThrow('API Error');
  });

  it('respects the limit parameter', async () => {
    const mockResponse = {
      query: {
        search: [
          { pageid: 1, title: 'Result 1', snippet: 'Snippet 1' },
          { pageid: 2, title: 'Result 2', snippet: 'Snippet 2' },
          { pageid: 3, title: 'Result 3', snippet: 'Snippet 3' },
        ],
      },
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      json: () => Promise.resolve(mockResponse),
    });

    const results = await searchMedicalWikipedia('test', 'de', 2);
    expect(results).toHaveLength(2);
  });
}); 