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
- **Chart.js con dos modos** (barras apiladas / líneas), con toggle en vivo. El
  gráfico se reconstruye completo en cada cambio de datos en vez de solo actualizarse,
  para que la posición del tooltip nunca quede desalineada tras un resize.
  Usa las APIs modernas de Angular: `viewChild.required`, `effect()` y `afterNextRender()`.
- **Multi-moneda visual**: un `MoneyPipe` propio (no el `CurrencyPipe` de
  Angular) formatea los montos con el símbolo y separador de miles correcto
  para USD (moneda por defecto), EUR, PEN, MXN, COP, CLP, ARS y BRL. No afecta
  el cálculo, solo la presentación.
- **Tabla con año 0 y aporte anual real**: la vista "Por año" arranca en una fila
  "Inicio" (antes de cualquier interés o aporte) y la columna "Aporte" suma todo
  lo depositado *durante* ese año, no solo el último mes — para que cuadre a
  simple vista con "Total aportado".
- **Card de guía dinámica** (`guide-card`): explica cada campo del formulario y,
  con un ejemplo redactado en vivo a partir de los valores actuales, qué significa
  cada resultado (saldo final, capital, aportes, interés). Cambia cualquier input
  y el texto se reescribe solo.
- **Layout apilado, no de dos columnas**: gráfico y tabla van uno debajo del otro
  (no lado a lado), tanto en desktop como en mobile — más fácil de leer y evita
  el clásico bug de flex/grid donde un hijo con contenido ancho (el scroll
  horizontal del gráfico) se escapa del ancho de su columna.
- **SEO y metadata básicos**: `favicon.svg` + `favicon.ico` + `apple-touch-icon.png`
  generados (un icono de moneda con "%"), `site.webmanifest`, meta `description`,
  `robots`, `canonical`, Open Graph y Twitter Card en `index.html`, y un
  `robots.txt` / `sitemap.xml` mínimos en `public/`.
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
    ├── interest-chart/               # Gráfica barras/líneas (Chart.js), scrollable
    ├── interest-table/               # Tabla mes a mes / año a año, cards en mobile
    └── guide-card/                   # Guía dinámica: cómo configurar y leer resultados

public/
├── favicon.svg / favicon.ico / apple-touch-icon.png / icon-192.png / icon-512.png
├── site.webmanifest
├── robots.txt
└── sitemap.xml
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

## Antes de desplegar

Los siguientes archivos tienen `https://interes-compuesto.jimmysalazar.com/` como
URL de ejemplo — reemplázala por el dominio final una vez decidido:

- `src/index.html` (`canonical`, `og:url`)
- `public/robots.txt` (línea `Sitemap:`)
- `public/sitemap.xml` (`<loc>`)

## Posibles mejoras futuras

- Exportar la tabla a CSV/Excel.
- Guardar escenarios (localStorage) para comparar más de una simulación.
- Modo oscuro.