import { ChangeDetectionStrategy, Component } from '@angular/core';
import { InterestFormComponent } from './components/interest-form/interest-form';
import { SummaryPanelComponent } from './components/summary-panel/summary-panel';
import { InterestChartComponent } from './components/interest-chart/interest-chart';
import { InterestTableComponent } from './components/interest-table/interest-table';
import { GuideCardComponent } from './components/guide-card/guide-card';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    InterestFormComponent,
    SummaryPanelComponent,
    InterestChartComponent,
    InterestTableComponent,
    GuideCardComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {}