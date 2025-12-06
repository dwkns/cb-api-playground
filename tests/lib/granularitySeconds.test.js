import { describe, expect, it } from 'vitest';
import { granularitySeconds } from '../../app/lib/granularitySeconds.js';

describe('granularitySeconds', () => {
  it('contains expected durations', () => {
    expect(granularitySeconds).toMatchObject({
      ONE_MINUTE: 60,
      FIVE_MINUTE: 300,
      FIFTEEN_MINUTE: 900,
      THIRTY_MINUTE: 1800,
      ONE_HOUR: 3600,
      TWO_HOUR: 7200,
      FOUR_HOUR: 14400,
      SIX_HOUR: 21600,
      ONE_DAY: 86400,
    });
  });
});
