import 'reflect-metadata';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { FootballApiAdapterImpl } from '../FootballApiAdapterImpl';
import { MockClock } from '../../../../testing/clock/MockClock';
import { InMemoryCache } from '../../../../testing/cache/InMemoryCache';

vi.mock('axios');
const mockedAxios = vi.mocked(axios);

const ORIGINAL_API_KEY = process.env.API_FOOTBALL_KEY;

function oddsResponseForFixture(id: number, homeWin: string, draw: string, awayWin: string) {
  return {
    data: {
      response: [
        {
          fixture: { id },
          bookmakers: [
            {
              id: 1,
              name: 'Pinnacle',
              bets: [
                {
                  name: 'Match Winner',
                  values: [
                    { value: 'Home', odd: homeWin },
                    { value: 'Draw', odd: draw },
                    { value: 'Away', odd: awayWin },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
  };
}

describe('FootballApiAdapterImpl — odds cache', () => {
  let cache: InMemoryCache;
  let adapter: FootballApiAdapterImpl;

  beforeEach(() => {
    process.env.API_FOOTBALL_KEY = 'test-key';
    cache = new InMemoryCache();
    adapter = new FootballApiAdapterImpl(new MockClock(new Date('2026-05-16T12:00:00.000Z')), cache);
    mockedAxios.get.mockReset();
  });

  afterAll();

  it('serves the second call entirely from cache (zero new API requests)', async () => {
    mockedAxios.get.mockResolvedValueOnce(oddsResponseForFixture(101, '1.80', '3.40', '4.20'));

    const first = await adapter.fetchOddsForMatches([101]);
    expect(first.get(101)?.homeWin).toBe(1.8);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);

    // Second call hits the cache: no axios invocation.
    const second = await adapter.fetchOddsForMatches([101]);
    expect(second.get(101)?.homeWin).toBe(1.8);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });

  it('only fetches the missing match-ids on partial cache hit', async () => {
    mockedAxios.get.mockResolvedValueOnce(oddsResponseForFixture(201, '2.10', '3.10', '3.50'));

    // Prime the cache for match 201.
    await adapter.fetchOddsForMatches([201]);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);

    // 202 is cold; 201 is warm. Only one new API call expected.
    mockedAxios.get.mockResolvedValueOnce(oddsResponseForFixture(202, '1.50', '4.00', '6.00'));
    const result = await adapter.fetchOddsForMatches([201, 202]);

    expect(mockedAxios.get).toHaveBeenCalledTimes(2);
    expect(result.get(201)?.homeWin).toBe(2.1);
    expect(result.get(202)?.homeWin).toBe(1.5);
  });

  it('negatively caches matches without bookmaker coverage (no re-fetch)', async () => {
    mockedAxios.get.mockResolvedValueOnce({ data: { response: [] } });

    const first = await adapter.fetchOddsForMatches([303]);
    expect(first.has(303)).toBe(false);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);

    // Second call within negative-TTL window: still no API hit.
    const second = await adapter.fetchOddsForMatches([303]);
    expect(second.has(303)).toBe(false);
    expect(mockedAxios.get).toHaveBeenCalledTimes(1);
  });
});

// Restore the original env after the suite.
function afterAll() {
  if (ORIGINAL_API_KEY === undefined) delete process.env.API_FOOTBALL_KEY;
  else process.env.API_FOOTBALL_KEY = ORIGINAL_API_KEY;
}
