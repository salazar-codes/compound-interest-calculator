import { CompoundInterestService } from './compound-interest.service';
import { SimulationInputs } from '../models/simulation.model';

describe('CompoundInterestService', () => {
  let service: CompoundInterestService;

  beforeEach(() => {
    service = new CompoundInterestService();
  });

  it('returns one row per month for the requested horizon', () => {
    const inputs: SimulationInputs = {
      initialAmount: 10000,
      contributionAmount: 0,
      contributionFrequency: 'monthly',
      annualRate: 10,
      compoundingFrequency: 'annual',
      years: 10,
      currency: 'EUR',
    };

    const rows = service.calculate(inputs);

    expect(rows.length).toBe(120);
    expect(rows[0].month).toBe(1);
    expect(rows[119].year).toBe(10);
  });

  it('grows the balance with no contributions purely from interest', () => {
    const inputs: SimulationInputs = {
      initialAmount: 10000,
      contributionAmount: 0,
      contributionFrequency: 'monthly',
      annualRate: 10,
      compoundingFrequency: 'annual',
      years: 1,
      currency: 'EUR',
    };

    const rows = service.calculate(inputs);
    const last = rows[rows.length - 1];

    expect(last.totalContributions).toBe(10000);
    // 10% annual compounding, 1 year: balance should land close to 11,000.
    expect(last.balance).toBeCloseTo(11000, 0);
    expect(last.interestEarned).toBeCloseTo(1000, 0);
  });

  it('adds monthly contributions on top of the growing balance', () => {
    const inputs: SimulationInputs = {
      initialAmount: 0,
      contributionAmount: 100,
      contributionFrequency: 'monthly',
      annualRate: 0,
      compoundingFrequency: 'monthly',
      years: 1,
      currency: 'EUR',
    };

    const rows = service.calculate(inputs);
    const last = rows[rows.length - 1];

    expect(last.totalContributions).toBeCloseTo(1200, 5);
    expect(last.balance).toBeCloseTo(1200, 5);
  });

  it('only applies annual contributions on the last month of each year', () => {
    const inputs: SimulationInputs = {
      initialAmount: 0,
      contributionAmount: 1000,
      contributionFrequency: 'annual',
      annualRate: 0,
      compoundingFrequency: 'annual',
      years: 2,
      currency: 'EUR',
    };

    const rows = service.calculate(inputs);

    expect(rows[10].contribution).toBe(0); // month 11
    expect(rows[11].contribution).toBe(1000); // month 12
    expect(rows[23].contribution).toBe(1000); // month 24
    expect(rows[23].totalContributions).toBe(2000);
  });
});
