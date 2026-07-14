import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { CompoundInterestStore } from '../../services/compound-interest.store';
import { MoneyPipe } from '../../pipes/money.pipe';

@Component({
  selector: 'app-summary-panel',
  standalone: true,
  imports: [MoneyPipe, DecimalPipe],
  templateUrl: './summary-panel.html',
  styleUrl: './summary-panel.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryPanelComponent {
  protected readonly store = inject(CompoundInterestStore);

  /** conic-gradient stops for the donut: initial capital, contributions, interest. */
  protected readonly donutStyle = computed(() => {
    const summary = this.store.summary();
    const total = summary.finalBalance || 1;

    const initialPct = (summary.initialAmount / total) * 100;
    const contributedPct = (summary.totalContributed / total) * 100;

    const p1 = initialPct;
    const p2 = initialPct + contributedPct;

    return {
      background: `conic-gradient(
        var(--color-navy) 0% ${p1}%,
        var(--color-accent-soft) ${p1}% ${p2}%,
        var(--color-accent) ${p2}% 100%
      )`,
    };
  });
}
