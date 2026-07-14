import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CompoundInterestStore } from '../../services/compound-interest.store';
import {
  COMPOUNDING_LABELS,
  CONTRIBUTION_LABELS,
  CURRENCY_LABELS,
  CURRENCY_SYMBOLS,
  CompoundingFrequency,
  ContributionFrequency,
  CurrencyCode,
} from '../../models/simulation.model';

@Component({
  selector: 'app-interest-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './interest-form.html',
  styleUrl: './interest-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InterestFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  protected readonly store = inject(CompoundInterestStore);

  protected readonly compoundingOptions = Object.entries(COMPOUNDING_LABELS) as [
    CompoundingFrequency,
    string,
  ][];
  protected readonly contributionOptions = Object.entries(CONTRIBUTION_LABELS) as [
    ContributionFrequency,
    string,
  ][];
  protected readonly currencyOptions = Object.entries(CURRENCY_LABELS) as [CurrencyCode, string][];

  protected readonly currencySymbol = computed(() => CURRENCY_SYMBOLS[this.store.inputs().currency]);

  protected readonly form = this.fb.nonNullable.group({
    initialAmount: [this.store.inputs().initialAmount, [Validators.required, Validators.min(0)]],
    contributionAmount: [this.store.inputs().contributionAmount, [Validators.min(0)]],
    contributionFrequency: [this.store.inputs().contributionFrequency],
    annualRate: [this.store.inputs().annualRate, [Validators.required, Validators.min(0), Validators.max(100)]],
    compoundingFrequency: [this.store.inputs().compoundingFrequency],
    years: [this.store.inputs().years, [Validators.required, Validators.min(1), Validators.max(60)]],
    currency: [this.store.inputs().currency],
  });

  ngOnInit(): void {
    this.form.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value) => {
      if (this.form.invalid) return;
      this.store.updateInputs({
        initialAmount: value.initialAmount,
        contributionAmount: value.contributionAmount,
        contributionFrequency: value.contributionFrequency,
        annualRate: value.annualRate,
        compoundingFrequency: value.compoundingFrequency,
        years: value.years,
        currency: value.currency,
      });
    });
  }

  protected onReset(): void {
    this.store.reset();
    this.form.reset(this.store.inputs());
  }
}
