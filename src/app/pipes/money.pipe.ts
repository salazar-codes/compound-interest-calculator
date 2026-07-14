import { Pipe, PipeTransform } from '@angular/core';
import { CURRENCY_LOCALES, CURRENCY_SYMBOLS, CurrencyCode } from '../models/simulation.model';

/**
 * Formats a number as money using our own symbol table (see
 * simulation.model.ts) instead of Angular's built-in CurrencyPipe, so the
 * exact symbol shown for each regional currency is always what we intend
 * (e.g. "S/." for soles) rather than whatever CLDR's default happens to be.
 */
@Pipe({ name: 'money', standalone: true })
export class MoneyPipe implements PipeTransform {
  transform(value: number | null | undefined, currency: CurrencyCode, fractionDigits = 0): string {
    if (value === null || value === undefined || Number.isNaN(value)) return '';

    const locale = CURRENCY_LOCALES[currency];
    const symbol = CURRENCY_SYMBOLS[currency];
    const formattedNumber = new Intl.NumberFormat(locale, {
      minimumFractionDigits: fractionDigits,
      maximumFractionDigits: fractionDigits,
    }).format(value);

    return `${symbol} ${formattedNumber}`;
  }
}
