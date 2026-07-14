import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CompoundInterestStore } from '../../services/compound-interest.store';
import { COMPOUNDING_LABELS } from '../../models/simulation.model';
import { MoneyPipe } from '../../pipes/money.pipe';

@Component({
  selector: 'app-guide-card',
  standalone: true,
  imports: [MoneyPipe],
  templateUrl: './guide-card.html',
  styleUrl: './guide-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuideCardComponent {
  protected readonly store = inject(CompoundInterestStore);

  protected readonly contributionFrequencyPhrase = computed(() =>
    this.store.inputs().contributionFrequency === 'monthly' ? 'cada mes' : 'una vez al año',
  );

  protected readonly compoundingLabel = computed(() => COMPOUNDING_LABELS[this.store.inputs().compoundingFrequency]);

  protected readonly interestPercentOfBalance = computed(() => {
    const summary = this.store.summary();
    const total = summary.finalBalance || 1;
    return Math.round((summary.totalInterest / total) * 100);
  });
}