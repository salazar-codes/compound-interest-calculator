export type ContributionFrequency = 'monthly' | 'annual';

export type CompoundingFrequency = 'annual' | 'semiannual' | 'quarterly' | 'monthly' | 'daily';

export type CurrencyCode = 'USD' | 'EUR' | 'PEN' | 'MXN' | 'COP' | 'CLP' | 'ARS' | 'BRL';

export interface SimulationInputs {
  /** Capital aportado al inicio, en la moneda que sea. */
  initialAmount: number;
  /** Monto que se aporta de forma periódica. */
  contributionAmount: number;
  /** Cada cuánto se realiza el aporte periódico. */
  contributionFrequency: ContributionFrequency;
  /** Tasa de interés anual nominal, en porcentaje (ej. 7 = 7%). */
  annualRate: number;
  /** Con qué frecuencia se capitaliza el interés. */
  compoundingFrequency: CompoundingFrequency;
  /** Horizonte de la inversión, en años. */
  years: number;
  /** Moneda usada solo para efectos visuales (símbolos y formato). */
  currency: CurrencyCode;
}

export interface SimulationRow {
  /** Mes absoluto desde el inicio (1, 2, 3...). */
  month: number;
  /** Año al que pertenece este mes (1, 2, 3...). */
  year: number;
  /** Aporte realizado ese mes (0 si no corresponde). */
  contribution: number;
  /** Suma de capital inicial + todos los aportes hasta este mes. */
  totalContributions: number;
  /** Interés acumulado hasta este mes. */
  interestEarned: number;
  /** Saldo total al cierre de este mes. */
  balance: number;
}

export interface SimulationSummary {
  initialAmount: number;
  totalContributed: number;
  totalInterest: number;
  finalBalance: number;
}

export const COMPOUNDING_LABELS: Record<CompoundingFrequency, string> = {
  annual: 'Anual',
  semiannual: 'Semestral',
  quarterly: 'Trimestral',
  monthly: 'Mensual',
  daily: 'Diaria',
};

export const CONTRIBUTION_LABELS: Record<ContributionFrequency, string> = {
  monthly: 'Mensual',
  annual: 'Anual',
};

export const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  USD: 'Dólar estadounidense (USD)',
  EUR: 'Euro (EUR)',
  PEN: 'Sol peruano (PEN)',
  MXN: 'Peso mexicano (MXN)',
  COP: 'Peso colombiano (COP)',
  CLP: 'Peso chileno (CLP)',
  ARS: 'Peso argentino (ARS)',
  BRL: 'Real brasileño (BRL)',
};

/**
 * Symbols are defined by hand instead of relying on Angular's built-in
 * currency data: it keeps exact regional conventions under our control
 * (e.g. "S/." for soles) instead of whatever the CLDR default happens to be.
 */
export const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  USD: '$',
  EUR: '€',
  PEN: 'S/.',
  MXN: 'MX$',
  COP: 'COL$',
  CLP: 'CLP$',
  ARS: 'AR$',
  BRL: 'R$',
};

/** Locale used only to get correct thousands/decimal separators per region. */
export const CURRENCY_LOCALES: Record<CurrencyCode, string> = {
  USD: 'en-US',
  EUR: 'es-ES',
  PEN: 'es-PE',
  MXN: 'es-MX',
  COP: 'es-CO',
  CLP: 'es-CL',
  ARS: 'es-AR',
  BRL: 'pt-BR',
};
