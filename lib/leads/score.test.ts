import {describe, expect, it} from 'vitest';
import {categoriseLead} from './score';

describe('categoriseLead — precedence + edge cases', () => {
  it('residencyGoal === golden-visa-priority wins regardless of other fields', () => {
    expect(
      categoriseLead({
        residencyGoal: 'golden-visa-priority',
        investmentObjective: 'yield',
        servicesNeeded: ['company-formation', 'secondary']
      })
    ).toBe('residency-led');
  });

  it('business services (company-formation/banking/tax) outrank yield triggers', () => {
    expect(
      categoriseLead({
        residencyGoal: 'none',
        investmentObjective: 'yield',
        servicesNeeded: ['banking', 'off-plan']
      })
    ).toBe('business-setup-led');
  });

  it('explicit yield objective routes when no residency or business signal', () => {
    expect(
      categoriseLead({
        residencyGoal: 'none',
        investmentObjective: 'yield',
        servicesNeeded: []
      })
    ).toBe('yield-led');
  });

  it('secondary / off-plan services route as yield-led without an explicit objective', () => {
    expect(
      categoriseLead({
        residencyGoal: 'eventual',
        investmentObjective: 'lifestyle',
        servicesNeeded: ['secondary']
      })
    ).toBe('yield-led');
  });

  it('falls back to exploratory when nothing matches', () => {
    expect(categoriseLead({})).toBe('exploratory');
    expect(
      categoriseLead({
        residencyGoal: 'none',
        investmentObjective: 'lifestyle',
        servicesNeeded: []
      })
    ).toBe('exploratory');
  });
});
