import { Injectable, computed, inject, signal } from '@angular/core';
import { CompoundInterestService } from './compound-interest.service';
import { SimulationInputs, SimulationRow, SimulationSummary } from '../models/simulation.model';

const DEFAULT_INPUTS: SimulationInputs = {
  initialAmount: 10000,
  contributionAmount: 200,
  contributionFrequency: 'monthly',
  annualRate: 7,
  compoundingFrequency: 'annual',
  years: 10,
  currency: 'USD',
};

/**
 * Single source of truth for the calculator. The form writes to `inputs`;
 * every other component only reads the computed signals below, so the
 * chart and the table are always in sync with zero manual wiring.
 */
@Injectable({ providedIn: 'root' })
export class CompoundInterestStore {
  private readonly calculator = inject(CompoundInterestService);

  private readonly _inputs = signal<SimulationInputs>(DEFAULT_INPUTS);
  readonly inputs = this._inputs.asReadonly();

  readonly monthlyRows = computed<SimulationRow[]>(() => this.calculator.calculate(this._inputs()));

  readonly yearlyRows = computed<SimulationRow[]>(() => {
    const rows = this.monthlyRows();
    const lastRowOfEachYear = new Map<number, SimulationRow>();
    for (const row of rows) {
      lastRowOfEachYear.set(row.year, row);
    }
    return Array.from(lastRowOfEachYear.values());
  });

  readonly summary = computed<SimulationSummary>(() => {
    const rows = this.monthlyRows();
    const last = rows[rows.length - 1];
    return {
      initialAmount: this._inputs().initialAmount,
      totalContributed: last.totalContributions - this._inputs().initialAmount,
      totalInterest: last.interestEarned,
      finalBalance: last.balance,
    };
  });

  updateInputs(partial: Partial<SimulationInputs>): void {
    this._inputs.update((current) => ({ ...current, ...partial }));
  }

  reset(): void {
    this._inputs.set(DEFAULT_INPUTS);
  }
}
