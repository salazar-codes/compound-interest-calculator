import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CompoundInterestStore } from '../../services/compound-interest.store';
import { SimulationRow } from '../../models/simulation.model';
import { MoneyPipe } from '../../pipes/money.pipe';

type ViewMode = 'monthly' | 'yearly';

@Component({
  selector: 'app-interest-table',
  standalone: true,
  imports: [MoneyPipe],
  templateUrl: './interest-table.html',
  styleUrl: './interest-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InterestTableComponent {
  protected readonly store = inject(CompoundInterestStore);

  protected readonly viewMode = signal<ViewMode>('yearly');

  /** Year 0: the starting point, before any interest or contribution has been applied. */
  private readonly yearlyRowsWithStart = computed<SimulationRow[]>(() => {
    const startingRow: SimulationRow = {
      month: 0,
      year: 0,
      contribution: 0,
      totalContributions: this.store.inputs().initialAmount,
      interestEarned: 0,
      balance: this.store.inputs().initialAmount,
    };
    return [startingRow, ...this.store.yearlyRows()];
  });

  /**
   * In the yearly view, `contribution` shouldn't be "whatever was deposited
   * in December" (the raw field from the last month of the year) — it
   * should be everything deposited *during* that year, which reads far more
   * clearly next to "Total aportado". We derive it from the running total
   * instead of carrying it through the simulation itself.
   */
  private readonly yearlyRowsWithYearlyContribution = computed<SimulationRow[]>(() => {
    const yearly = this.yearlyRowsWithStart();
    return yearly.map((row, index) => {
      if (index === 0) return row;
      const previous = yearly[index - 1];
      return { ...row, contribution: row.totalContributions - previous.totalContributions };
    });
  });

  protected readonly rows = computed(() =>
    this.viewMode() === 'monthly' ? this.store.monthlyRows() : this.yearlyRowsWithYearlyContribution(),
  );

  protected setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
  }
}