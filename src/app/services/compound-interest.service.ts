import { Injectable } from '@angular/core';
import { CompoundingFrequency, SimulationInputs, SimulationRow } from '../models/simulation.model';

const PERIODS_PER_YEAR: Record<CompoundingFrequency, number> = {
  annual: 1,
  semiannual: 2,
  quarterly: 4,
  monthly: 12,
  daily: 365,
};

/**
 * Turns a set of user inputs into a month-by-month projection.
 *
 * Kept free of Angular state (no signals, no DI beyond @Injectable) on
 * purpose: this is the part of the app with actual business logic, so it's
 * the part worth unit testing in isolation.
 */
@Injectable({ providedIn: 'root' })
export class CompoundInterestService {
  calculate(inputs: SimulationInputs): SimulationRow[] {
    const totalMonths = Math.max(1, Math.round(inputs.years * 12));
    const monthlyRate = this.toMonthlyRate(inputs.annualRate, inputs.compoundingFrequency);

    const rows: SimulationRow[] = [];
    let balance = inputs.initialAmount;
    let totalContributions = inputs.initialAmount;

    for (let month = 1; month <= totalMonths; month++) {
      const contribution = this.contributionForMonth(inputs, month);

      balance = balance * (1 + monthlyRate) + contribution;
      totalContributions += contribution;

      rows.push({
        month,
        year: Math.ceil(month / 12),
        contribution,
        totalContributions,
        interestEarned: balance - totalContributions,
        balance,
      });
    }

    return rows;
  }

  /** Converts a nominal annual rate compounded at `frequency` into an equivalent monthly rate. */
  private toMonthlyRate(annualRatePercent: number, frequency: CompoundingFrequency): number {
    const periodsPerYear = PERIODS_PER_YEAR[frequency];
    const nominalRate = annualRatePercent / 100;
    const effectiveAnnualRate = Math.pow(1 + nominalRate / periodsPerYear, periodsPerYear) - 1;
    return Math.pow(1 + effectiveAnnualRate, 1 / 12) - 1;
  }

  private contributionForMonth(inputs: SimulationInputs, month: number): number {
    if (inputs.contributionAmount <= 0) return 0;
    if (inputs.contributionFrequency === 'monthly') return inputs.contributionAmount;
    // Annual contributions land on the last month of each year.
    return month % 12 === 0 ? inputs.contributionAmount : 0;
  }
}
