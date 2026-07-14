import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { CompoundInterestStore } from '../../services/compound-interest.store';
import { CURRENCY_SYMBOLS, SimulationInputs, SimulationRow } from '../../models/simulation.model';

Chart.register(...registerables);

type ChartMode = 'bar' | 'line';

/** Minimum horizontal space each year gets before the chart starts scrolling. */
const MIN_PX_PER_BAR = 56;
const MIN_CHART_WIDTH = 320;

@Component({
  selector: 'app-interest-chart',
  standalone: true,
  templateUrl: './interest-chart.html',
  styleUrl: './interest-chart.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InterestChartComponent implements OnDestroy {
  private readonly store = inject(CompoundInterestStore);
  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('chartCanvas');

  private chart?: Chart;
  private currencySymbol = '€';
  /** Guards against running before the canvas exists in the DOM. */
  private viewReady = false;

  protected readonly chartMode = signal<ChartMode>('bar');

  protected readonly minChartWidth = computed(() =>
    Math.max(this.store.yearlyRows().length * MIN_PX_PER_BAR, MIN_CHART_WIDTH),
  );

  constructor() {
    afterNextRender(() => {
      this.viewReady = true;
      this.renderChart();
    });

    effect(() => {
      this.store.yearlyRows();
      this.store.inputs();
      this.chartMode();
      if (this.viewReady) this.renderChart();
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  protected setChartMode(mode: ChartMode): void {
    this.chartMode.set(mode);
  }

  /**
   * Destroys and rebuilds the chart from scratch on every change instead of
   * calling `.update()` on a long-lived instance. That's what keeps the
   * tooltip/hover math correct: Chart.js always measures the canvas at its
   * final size (after the scroll container's width has already been set),
   * instead of reusing stale measurements from before a resize.
   */
  private renderChart(): void {
    const ctx = this.canvasRef().nativeElement.getContext('2d');
    if (!ctx) return;

    const rows = this.store.yearlyRows();
    const inputs = this.store.inputs();
    this.currencySymbol = CURRENCY_SYMBOLS[inputs.currency];

    this.chart?.destroy();
    this.chart =
      this.chartMode() === 'bar' ? this.buildBarChart(ctx, rows, inputs) : this.buildLineChart(ctx, rows, inputs);
  }

  private palette() {
    const rootStyles = getComputedStyle(document.documentElement);
    return {
      navy: rootStyles.getPropertyValue('--color-navy').trim(),
      navySoft: rootStyles.getPropertyValue('--color-navy-soft').trim(),
      accent: rootStyles.getPropertyValue('--color-accent').trim(),
      line: rootStyles.getPropertyValue('--color-line').trim(),
      inkMuted: rootStyles.getPropertyValue('--color-ink-muted').trim(),
    };
  }

  private formatAmount(value: number): string {
    return `${Number(value).toLocaleString('es-ES')} ${this.currencySymbol}`;
  }

  private buildBarChart(
    ctx: CanvasRenderingContext2D,
    rows: SimulationRow[],
    inputs: SimulationInputs,
  ): Chart {
    const { navy, navySoft, accent, line, inkMuted } = this.palette();

    const config: ChartConfiguration<'bar'> = {
      type: 'bar',
      data: {
        labels: rows.map((row) => `Año ${row.year}`),
        datasets: [
          {
            label: 'Capital inicial',
            data: rows.map(() => Math.round(inputs.initialAmount)),
            backgroundColor: navy,
            borderRadius: 4,
            maxBarThickness: 34,
          },
          {
            label: 'Aportes acumulados',
            data: rows.map((row) => Math.round(row.totalContributions - inputs.initialAmount)),
            backgroundColor: navySoft,
            borderRadius: 4,
            maxBarThickness: 34,
          },
          {
            label: 'Interés acumulado',
            data: rows.map((row) => Math.round(row.interestEarned)),
            backgroundColor: accent,
            borderRadius: 4,
            maxBarThickness: 34,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: { stacked: true, grid: { display: false }, ticks: { color: inkMuted, font: { family: 'Inter' } } },
          y: {
            stacked: true,
            grid: { color: line },
            ticks: {
              color: inkMuted,
              font: { family: 'IBM Plex Mono', size: 11 },
              callback: (value) => this.formatAmount(Number(value)),
            },
          },
        },
        plugins: {
          legend: {
            position: 'bottom',
            align: 'center',
            labels: { color: inkMuted, usePointStyle: true, pointStyle: 'circle', font: { family: 'Inter', size: 12 } },
          },
          tooltip: {
            backgroundColor: '#14171a',
            titleFont: { family: 'Space Grotesk' },
            bodyFont: { family: 'IBM Plex Mono' },
            padding: 10,
            callbacks: {
              label: (item) => `${item.dataset.label}: ${this.formatAmount(Number(item.parsed.y))}`,
            },
          },
        },
      },
    };

    return new Chart(ctx, config);
  }

  private buildLineChart(
    ctx: CanvasRenderingContext2D,
    rows: SimulationRow[],
    inputs: SimulationInputs,
  ): Chart {
    const { navy, accent, line, inkMuted } = this.palette();

    const config: ChartConfiguration<'line'> = {
      type: 'line',
      data: {
        labels: rows.map((row) => `Año ${row.year}`),
        datasets: [
          {
            label: 'Total aportado',
            data: rows.map((row) => Math.round(row.totalContributions)),
            borderColor: navy,
            backgroundColor: navy,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.25,
          },
          {
            label: 'Saldo total',
            data: rows.map((row) => Math.round(row.balance)),
            borderColor: accent,
            backgroundColor: accent,
            pointRadius: 4,
            pointHoverRadius: 6,
            tension: 0.25,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        scales: {
          x: { grid: { display: false }, ticks: { color: inkMuted, font: { family: 'Inter' } } },
          y: {
            grid: { color: line },
            ticks: {
              color: inkMuted,
              font: { family: 'IBM Plex Mono', size: 11 },
              callback: (value) => this.formatAmount(Number(value)),
            },
          },
        },
        plugins: {
          legend: {
            position: 'bottom',
            align: 'center',
            labels: { color: inkMuted, usePointStyle: true, pointStyle: 'circle', font: { family: 'Inter', size: 12 } },
          },
          tooltip: {
            backgroundColor: '#14171a',
            titleFont: { family: 'Space Grotesk' },
            bodyFont: { family: 'IBM Plex Mono' },
            padding: 10,
            callbacks: {
              label: (item) => `${item.dataset.label}: ${this.formatAmount(Number(item.parsed.y))}`,
            },
          },
        },
      },
    };

    return new Chart(ctx, config);
  }
}