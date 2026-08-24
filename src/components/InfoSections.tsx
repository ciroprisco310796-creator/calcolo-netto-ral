import { useState, type ReactNode } from "react";

function Section({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="card-surface overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 sm:px-6"
      >
        <span className="text-base font-semibold">{title}</span>
        <span className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="hidden sm:inline">{open ? "Chiudi" : "Apri"}</span>
          <ChevronDown
            aria-hidden
            className={`size-4 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>
      {open ? (
        <div className="border-t border-border px-5 py-5 text-sm leading-relaxed text-muted-foreground sm:px-6">
          {children}
        </div>
      ) : null}
    </div>
  );
}

const assumptions = [
  "Anno fiscale 2026",
  "Dipendente del settore privato",
  "Contratto a tempo indeterminato",
  "Residenza fiscale a Milano (Lombardia) per l'intero anno",
  "365 giorni di lavoro, anno intero",
  "Nessun altro reddito",
  "Nessun familiare fiscalmente a carico",
  "Nessuna agevolazione fiscale personale",
  "Quota contributiva a carico del dipendente assunta al 9,19% come semplificazione del caso standard. L'aliquota effettiva può variare in base a settore, inquadramento e regime previdenziale.",
  "13 mensilità",
  "Nessun welfare, fringe benefit o premio",
  "Nessun fondo pensione",
  "Nessun trattamento particolare del CCNL",
];

const limitations = [
  "È una stima, non un calcolo payroll ufficiale",
  "Non è un motore di elaborazione paghe",
  "Non modella tutti gli scenari lavorativi italiani",
  "Non gestisce le differenze contributive legate al CCNL",
  "Non gestisce familiari a carico",
  "Non gestisce detrazioni personali",
  "Non modella welfare o fringe benefit",
  "Non modella premi o tassazioni agevolate",
  "Non modella la previdenza complementare",
  "Non modella datori di lavoro multipli o redditi aggiuntivi",
  "Non modella il TFR",
  "Non modella gli effetti di timing del payroll né i conguagli fiscali",
  "Il contributo previdenziale aggiuntivo dell'1% oltre la soglia 2026 di 56.224 € è modellato su base annuale. Nella gestione payroll reale l'applicazione avviene con logiche mensili e relativi conguagli.",
];

const sources = [
  {
    label: "IRPEF 2026 — Legge di Bilancio 2026, Gazzetta Ufficiale",
    href: "https://www.gazzettaufficiale.it/eli/id/2026/01/21/26A00149/SG",
  },
  {
    label:
      "Detrazioni da lavoro dipendente (TUIR, art. 13) — Agenzia delle Entrate, Quadro RC",
    href: "https://infoprecompilata.agenziaentrate.gov.it/portale/quadro-rc",
  },
  {
    label: "Aliquote contributive per lavoratori dipendenti — INPS",
    href: "https://www.inps.it/it/it/inps-comunica/diritti-e-obblighi-in-materia-di-sicurezza-sociale-nell-unione-e/per-le-imprese/aliquote-contributive.html",
  },
  {
    label: "Addizionale regionale all'IRPEF — Regione Lombardia",
    href: "https://www.regione.lombardia.it/bollo-auto-e-tributi-regionali/red-addizionale-regionale-irpef",
  },
  {
    label: "Addizionale comunale all'IRPEF — Comune di Milano",
    href: "https://www.comune.milano.it/aree-tematiche/tributi/addizionale-comunale-irpef",
  },
  {
    label: "Riduzione del cuneo fiscale — Agenzia delle Entrate",
    href: "https://infoprecompilata.agenziaentrate.gov.it/portale/semplificata-mod-lavoro-dipendente-e-pensioni",
  },
];


const flowSteps = [
  "RAL",
  "Contributi previdenziali",
  "Reddito imponibile",
  "IRPEF per scaglioni",
  "Detrazioni",
  "Addizionali regionali e comunali",
  "Netto stimato",
];

export function InfoSections() {
  return (
    <div className="space-y-3">
      <Section title="Come viene calcolato?" defaultOpen>
        <ol className="space-y-1">
          {flowSteps.map((step, i) => (
            <li key={step} className="flex items-center gap-3">
              <span className="tabular w-5 shrink-0 text-xs text-muted-foreground">
                {i + 1}.
              </span>
              <span className="text-foreground">{step}</span>
            </li>
          ))}
        </ol>
        <div className="mt-5 space-y-3">
          <p>
            Partiamo dalla tua RAL e sottraiamo i contributi previdenziali a carico del
            dipendente (9,19%, più un 1% sulla parte di RAL oltre 56.224 €). Quello che
            resta è il <strong className="text-foreground">reddito imponibile</strong>.
          </p>
          <p>
            Sull'imponibile calcoliamo l'IRPEF per scaglioni: 23% fino a 28.000 €, 33%
            da 28.000 a 50.000 €, 43% oltre. Non applichiamo mai un'unica aliquota a
            tutto il reddito.
          </p>
          <p>
            Dall'IRPEF lorda togliamo la detrazione per lavoro dipendente e, dove
            spetta, la detrazione per la riduzione del cuneo fiscale (1.000 €, ridotta
            linearmente tra 32.000 e 40.000 € di imponibile). Sotto i 20.000 € di
            imponibile il cuneo diventa invece una somma esente che non riduce l'IRPEF
            ma si aggiunge al netto.
          </p>
          <p>
            Infine sottraiamo l'addizionale regionale della Lombardia (calcolata per
            scaglioni) e l'addizionale comunale di Milano (0,8%, dovuta solo se
            l'imponibile supera 23.000 €, e in quel caso sull'intero imponibile).
          </p>
          <p>
            Tutti i calcoli avvengono nel tuo browser, con precisione piena: gli
            arrotondamenti sono solo visivi.
          </p>
        </div>
      </Section>

      <Section title="Assunzioni del prototipo">
        <ul className="grid gap-2 sm:grid-cols-2">
          {assumptions.map((a) => (
            <li key={a} className="flex gap-2">
              <span aria-hidden className="text-primary">
                •
              </span>
              <span>{a}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 rounded-lg bg-muted px-4 py-3 text-foreground">
          Queste assunzioni permettono di modellare un caso standard e mantenere il
          prototipo intenzionalmente semplice e verificabile.
        </p>
      </Section>

      <Section title="Limiti del modello">
        <ul className="space-y-2">
          {limitations.map((l) => (
            <li key={l} className="flex gap-2">
              <span aria-hidden className="text-muted-foreground">
                •
              </span>
              <span>{l}</span>
            </li>
          ))}
        </ul>
        <p className="mt-5 rounded-lg border border-border bg-muted px-4 py-3 text-foreground">
          Il trattamento integrativo è stato escluso intenzionalmente dal modello,
          invece di implementarne una versione parziale o potenzialmente fuorviante.
          L'idoneità può dipendere da condizioni fiscali aggiuntive fuori dallo scopo
          semplificato di questo prototipo.
        </p>
      </Section>

      <Section title="Fonti">
        <ul className="space-y-3">
          {sources.map((s) => (
            <li key={s.href}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4 hover:no-underline"
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-5">
          Il modello fiscale è stato costruito a partire da fonti ufficiali e
          istituzionali, non generato arbitrariamente.
        </p>
      </Section>
    </div>
  );
}
