# Calculadora de Interés Compuesto

Proyecto de práctica pensado para portafolio/CV: un dashboard frontend en **Angular 21**
que simula la evolución de una inversión con aportes periódicos e interés compuesto.

## Stack y decisiones técnicas

- **Standalone components** en toda la app (sin `NgModule`).
- **Signals** para todo el estado: un único `CompoundInterestStore` guarda los inputs
  (`signal`) y deriva la simulación, el resumen y las filas mensuales/anuales con
  `computed()`. Ningún componente calcula nada por su cuenta; solo leen del store.
- **Lógica de negocio aislada**: `CompoundInterestService` es una clase sin estado ni
  dependencias de Angular más allá de `@Injectable`, así que se puede testear con
  unit tests puros (ver `compound-interest.service.spec.ts`).
- **Reactive Forms tipados** para el formulario de configuración, con `valueChanges`
  empujando al store (patrón "smart store / dumb form").
- **Chart.js** para la gráfica de barras apiladas (capital inicial, aportes e
  interés como series separadas), usando las APIs modernas de Angular:
  `viewChild.required`, `effect()` y `afterNextRender()`.
- **Multi-moneda visual**: un `MoneyPipe` propio (no el `CurrencyPipe` de
  Angular) formatea los montos con el símbolo y separador de miles correcto
  para USD, EUR, PEN, MXN, COP, CLP, ARS y BRL. No afecta el cálculo, solo la
  presentación.
- **Responsive sin perder legibilidad**: por debajo de 640px la tabla deja de
  ser una tabla y se convierte en una lista de tarjetas (una por fila, con
  cada valor junto a su etiqueta) en vez de forzar scroll horizontal oculto.
  La gráfica sí mantiene scroll horizontal (con una pista visual "Desliza
  para ver todos los años"), porque en un gráfico de barras es preferible
  ver las barras a tamaño legible que aplastarlas todas en pantalla.
- **Zoneless** (`provideZonelessChangeDetection`) + `ChangeDetectionStrategy.OnPush`
  en todos los componentes.

## Estructura

```
src/app/
├── models/simulation.model.ts        # Tipos: inputs, filas, resumen, monedas
├── services/
│   ├── compound-interest.service.ts  # Cálculo puro (testeado)
│   └── compound-interest.store.ts    # Estado con signals
├── pipes/money.pipe.ts               # Formato de moneda propio (símbolo + locale por país)
└── components/
    ├── interest-form/                # Formulario de configuración
    ├── summary-panel/                # Saldo final + donut de composición
    ├── interest-chart/               # Gráfica de barras (Chart.js), scrollable en mobile
    └── interest-table/               # Tabla mes a mes / año a año
```

## Cómo correrlo

Requiere Node.js 20+ y npm.

```bash
npm install
npm start
```

Esto levanta el servidor de desarrollo en `http://localhost:4200`.

Para correr los tests unitarios del servicio de cálculo:

```bash
npm test
```

## Posibles mejoras futuras

- Exportar la tabla a CSV/Excel.
- Guardar escenarios (localStorage) para comparar más de una simulación.
- Modo oscuro.
