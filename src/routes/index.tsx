import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";

import { BreakdownRow } from "@/components/BreakdownRow";
import { InfoSections } from "@/components/InfoSections";
import {
  calculateSalary,
  formatEuro,
  parseRalInput,
  type SalaryBreakdown,
} from "@/lib/salaryCalculator";

const title = "Calcolatore netto da RAL 2026 — Milano";
const description =
  "Stima trasparente e deterministica del netto annuale e per mensilità da RAL, per un dipendente privato residente a Milano. Regole fiscali 2026.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const MAX_RAL = 100_000_000;

/** Display-only: groups the integer part with Italian thousand separators. */
function formatRalInput(raw: string): string {
  const cleaned = raw.replace(/[^\d.,-]/g, "");
  const negative = cleaned.startsWith("-");
  const body = negative ? cleaned.slice(1) : cleaned;

  const commaIndex = body.indexOf(",");
  const intPart = (commaIndex === -1 ? body : body.slice(0, commaIndex)).replace(
    /\./g,
    "",
  );
  const decimals = commaIndex === -1 ? null : body.slice(commaIndex + 1).replace(/[.,]/g, "");

  const grouped = intPart === "" ? "" : intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${negative ? "-" : ""}${grouped}${decimals === null ? "" : `,${decimals}`}`;
}

function Index() {
  const [input, setInput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SalaryBreakdown | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const trimmed = input.trim();
    if (trimmed.startsWith("-")) {
      setError("La RAL deve essere un valore positivo maggiore di zero.");
      setResult(null);
      return;
    }

    const value = parseRalInput(trimmed);

    if (value === null) {
      setError("Inserisci un valore numerico valido, ad esempio 40.000.");
      setResult(null);
      return;
    }
    if (value <= 0) {
      setError("La RAL deve essere un valore positivo maggiore di zero.");
      setResult(null);
      return;
    }
    if (value > MAX_RAL) {
      setError("Inserisci una RAL realistica (fino a 100.000.000 €).");
      setResult(null);
      return;
    }

    setError(null);
    setResult(calculateSalary(value));
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-5 py-12 sm:px-6 sm:py-16">
      {/* Hero + input */}
      <header>
        <span className="inline-flex items-center rounded-full border border-border bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
          Regole fiscali 2026
        </span>
        <h1 className="mt-5 text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
          Calcola il tuo netto dalla RAL
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
          Una stima semplice e trasparente del netto annuale e mensile per un
          dipendente residente a Milano.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="card-surface mt-8 p-5 sm:p-6" noValidate>
        <label htmlFor="ral" className="block text-sm font-medium">
          Retribuzione Annua Lorda (RAL)
        </label>
        <p className="mt-1 text-sm text-muted-foreground">
          Inserisci la tua retribuzione annua lorda.
        </p>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <input
              id="ral"
              name="ral"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Es. 40.000 €"
              aria-invalid={error !== null}
              aria-describedby={error ? "ral-error" : undefined}
              className="tabular h-12 w-full rounded-lg border border-input bg-surface px-4 text-base outline-none transition-shadow placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/25"
            />
          </div>
          <button
            type="submit"
            className="h-12 shrink-0 rounded-lg bg-primary px-6 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-ring/40 focus:ring-offset-2"
          >
            Calcola il netto
          </button>
        </div>

        {error ? (
          <p id="ral-error" role="alert" className="mt-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </form>

      {result ? <Results result={result} /> : null}

      <section className="mt-12">
        <InfoSections />
      </section>

      <footer className="mt-10 text-xs leading-relaxed text-muted-foreground">
        Prototipo dimostrativo. I calcoli avvengono interamente nel tuo browser: nessun
        dato viene salvato, inviato o condiviso.
      </footer>
    </main>
  );
}

function Results({ result }: { result: SalaryBreakdown }) {
  const hasCashBonus = result.taxWedgeCashBonus > 0;
  const hasWedgeDeduction = result.taxWedgeDeduction > 0;
  const hasExtraContribution = result.additionalSocialSecurityContribution > 0;

  return (
    <section
      aria-live="polite"
      className="mt-8 animate-in fade-in slide-in-from-bottom-2 duration-500"
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="card-surface p-5 sm:p-6">
          <p className="text-sm text-muted-foreground">Netto annuale stimato</p>
          <p className="tabular mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {formatEuro(result.annualNetSalary)}
          </p>
        </div>
        <div className="card-surface p-5 sm:p-6">
          <p className="text-sm text-muted-foreground">
            Netto medio stimato per mensilità
          </p>
          <p className="tabular mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {formatEuro(result.averageNetPerPayment)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            su {result.numberOfPayments} mensilità
          </p>
        </div>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Stima basata sulle assunzioni del prototipo. Non sostituisce un calcolo payroll
        professionale. Il netto medio non corrisponde necessariamente all'importo esatto
        di ogni busta paga.
      </p>

      <div className="card-surface mt-6 p-5 sm:p-6">
        <h2 className="text-base font-semibold">Dalla RAL al netto</h2>
        <div className="mt-2 divide-y divide-border">
          <BreakdownRow label="RAL" value={result.grossSalary} />
          <BreakdownRow
            label="Contributi previdenziali"
            value={result.totalSocialSecurityContributions}
            sign="minus"
            hint={
              hasExtraContribution
                ? `Di cui 1% oltre 56.224 €: ${formatEuro(result.additionalSocialSecurityContribution)}`
                : undefined
            }
          />
          <BreakdownRow label="Reddito imponibile" value={result.taxableIncome} />
          <BreakdownRow label="IRPEF lorda" value={result.grossIrpef} sign="minus" />
          <BreakdownRow
            label="Detrazione lavoro dipendente"
            value={result.employmentDeduction}
            sign="plus"
          />
          {hasWedgeDeduction ? (
            <BreakdownRow
              label="Riduzione cuneo fiscale"
              value={result.taxWedgeDeduction}
              sign="plus"
            />
          ) : null}
          <BreakdownRow label="IRPEF netta" value={result.netIrpef} sign="minus" />
          <BreakdownRow
            label="Addizionale regionale Lombardia"
            value={result.regionalTax}
            sign="minus"
          />
          <BreakdownRow
            label="Addizionale comunale Milano"
            value={result.municipalTax}
            sign="minus"
          />
          {hasCashBonus ? (
            <BreakdownRow
              label="Beneficio fiscale esente"
              value={result.taxWedgeCashBonus}
              sign="plus"
              hint="Somma esente: non riduce l'IRPEF, si aggiunge al netto."
            />
          ) : null}
        </div>
        <BreakdownRow
          label="Netto annuale stimato"
          value={result.annualNetSalary}
          emphasis
        />
      </div>

      <div className="card-surface mt-3 p-5 sm:p-6">
        <h2 className="text-base font-semibold">Totali</h2>
        <div className="mt-2 divide-y divide-border">
          <BreakdownRow label="Totale imposte" value={result.totalTaxes} />
          <BreakdownRow
            label="Totale trattenute sulla RAL"
            value={result.totalDeductions}
            hint="Contributi previdenziali + imposte"
          />
        </div>
      </div>
    </section>
  );
}
