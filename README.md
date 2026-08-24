# Calcolo Netto RAL — Jet HR Product Builder Task

Prototipo di un calcolatore che stima il **netto annuale e il netto medio per mensilità** a partire dalla Retribuzione Annua Lorda (RAL), mostrando in modo trasparente le principali componenti che portano dal lordo al netto.

🌐 **Live prototype:** [calcolo-netto-ral.lovable.app](https://calcolo-netto-ral.lovable.app/)

---

## Obiettivo

Il dominio payroll italiano è ampio e dipende da numerosi fattori personali, contrattuali e fiscali.

L'obiettivo di questo progetto non è replicare un motore paghe completo, ma costruire un prototipo:

* funzionante;
* deterministico;
* trasparente;
* verificabile;
* sufficientemente accurato per un caso standard chiaramente delimitato.

Ho scelto di privilegiare la **comprensibilità della logica** rispetto alla copertura di tutti i possibili scenari.

---

## Scenario modellato

Il prototipo assume:

* anno fiscale **2026**;
* dipendente del settore privato;
* contratto a tempo indeterminato;
* residenza fiscale a **Milano, Lombardia** per l'intero anno;
* 365 giorni di lavoro;
* un'unica fonte di reddito;
* nessun familiare fiscalmente a carico;
* nessuna agevolazione fiscale personale;
* 13 mensilità;
* nessun welfare, fringe benefit o premio;
* nessun fondo pensione;
* nessun trattamento contributivo particolare legato al CCNL.

La quota contributiva a carico del dipendente è assunta al **9,19%** come semplificazione del caso standard. L'aliquota effettiva può variare in base a settore, inquadramento e regime previdenziale.

---

## Come funziona

Il calculation engine segue questa sequenza:

```text
RAL
 ↓
Contributi previdenziali
 ↓
Reddito imponibile
 ↓
IRPEF lorda per scaglioni
 ↓
Detrazioni da lavoro dipendente
 ↓
Riduzione del cuneo fiscale
 ↓
IRPEF netta
 ↓
Addizionale regionale Lombardia
 ↓
Addizionale comunale Milano
 ↓
Netto annuale stimato
 ↓
Netto medio su 13 mensilità
```

Il risultato non viene presentato come un singolo numero: l'interfaccia mostra anche il **breakdown completo del calcolo**, in modo che l'utente possa capire come si arriva dalla RAL al netto.

---

## Architettura del calcolo

La business logic fiscale è separata dalla UI e implementata in:

```text
src/lib/salaryCalculator.ts
```

Il motore utilizza esclusivamente **funzioni deterministiche**.

Non vengono utilizzati:

* LLM per calcolare il risultato;
* salary calculator esterni;
* API payroll di terze parti;
* backend o database per elaborare la RAL.

Questa è stata una scelta intenzionale: il problema è basato su regole deterministiche e quindi il risultato deve essere **riproducibile, spiegabile e testabile**.

Gli strumenti AI sono stati utilizzati come acceleratori nelle fasi di ricerca e sviluppo, mantenendo sotto controllo la logica di dominio.

---

## Regole considerate

Il prototipo modella, nel perimetro definito:

* contributi previdenziali a carico del dipendente;
* contributo previdenziale aggiuntivo dell'1% oltre la soglia prevista per il 2026;
* IRPEF progressiva 2026;
* detrazione per redditi da lavoro dipendente;
* riduzione del cuneo fiscale;
* addizionale regionale IRPEF della Lombardia;
* addizionale comunale IRPEF di Milano.

I calcoli vengono effettuati mantenendo la precisione durante i passaggi intermedi e arrotondati soltanto per la visualizzazione.

---

## Validazione

Il calculation engine è stato verificato attraverso una suite di test deterministici.

### Golden test cases

Sono stati utilizzati cinque casi principali:

|     RAL | Netto annuale stimato | Netto medio / 13 |
| ------: | --------------------: | ---------------: |
| €20.000 |            €17.432,61 |        €1.340,97 |
| €30.000 |            €23.425,52 |        €1.801,96 |
| €40.000 |            €27.960,24 |        €2.150,79 |
| €50.000 |            €32.567,77 |        €2.505,21 |
| €70.000 |            €42.446,61 |        €3.265,12 |

Sono inoltre presenti test sulle principali soglie fiscali e sulla validazione degli input.

**Current test suite: 9/9 passing.**

---

## Esempio di calcolo

Per una RAL di **€40.000**:

| Voce                            |        Importo |
| ------------------------------- | -------------: |
| RAL                             |     €40.000,00 |
| Contributi previdenziali        |    - €3.676,00 |
| Reddito imponibile              |     €36.324,00 |
| IRPEF lorda                     |    - €9.186,92 |
| Detrazione lavoro dipendente    |    + €1.187,33 |
| Riduzione cuneo fiscale         |      + €459,50 |
| IRPEF netta                     |    - €7.540,09 |
| Addizionale regionale Lombardia |      - €533,07 |
| Addizionale comunale Milano     |      - €290,59 |
| **Netto annuale stimato**       | **€27.960,24** |
| **Netto medio su 13 mensilità** |  **€2.150,79** |

---

## Fonti

La logica fiscale è stata verificata principalmente attraverso fonti ufficiali e istituzionali:

* **Gazzetta Ufficiale** — Legge di Bilancio 2026 / aliquote IRPEF;
* **Agenzia delle Entrate** — detrazioni da lavoro dipendente;
* **INPS** — contribuzione previdenziale;
* **Regione Lombardia** — addizionale regionale IRPEF;
* **Comune di Milano** — addizionale comunale IRPEF;
* **Agenzia delle Entrate** — riduzione del cuneo fiscale.

I link alle fonti specifiche utilizzate sono disponibili direttamente nella sezione **Fonti** del prototipo.

---

## Privacy

La RAL è un'informazione finanziaria e viene elaborata esclusivamente **client-side**.

Il prototipo:

* non salva la RAL;
* non utilizza un database;
* non invia il valore a servizi esterni;
* non utilizza API AI per effettuare il calcolo;
* non richiede autenticazione.

---

## Limiti del modello

Il risultato è una **stima**, non un calcolo payroll ufficiale.

Il prototipo non considera, tra gli altri:

* differenze contributive specifiche del CCNL;
* familiari a carico;
* detrazioni personali;
* altri redditi;
* previdenza complementare;
* welfare e fringe benefit;
* premi e tassazioni agevolate;
* TFR;
* più rapporti di lavoro nello stesso anno;
* conguagli payroll;
* distribuzione reale delle trattenute sulle singole mensilità.

Il contributo previdenziale aggiuntivo dell'1% viene modellato su base annuale, mentre nella gestione payroll reale viene applicato con logiche mensili e relativi conguagli.

Il **trattamento integrativo** è stato escluso intenzionalmente invece di implementarne una versione parziale o potenzialmente fuorviante, perché la sua applicabilità può dipendere da ulteriori condizioni fiscali fuori dal perimetro semplificato del prototipo.

---

## Product decisions

Tre principi hanno guidato la costruzione:

### 1. Transparency over complexity

Mostrare il breakdown completo anziché restituire soltanto il netto finale.

### 2. Deterministic over probabilistic

Utilizzare codice deterministico per un problema basato su regole, invece di delegare il calcolo a un LLM.

### 3. Explicit scope over false precision

Delimitare chiaramente un caso standard e dichiararne i limiti, invece di simulare una precisione da payroll engine senza coprire realmente tutti gli scenari.

---

## Possible next iterations

Un'evoluzione del prodotto potrebbe introdurre progressivamente:

* selezione del numero di mensilità;
* regione e comune di residenza;
* differenti regimi contributivi;
* familiari a carico;
* previdenza complementare;
* fringe benefit e welfare;
* altri redditi;
* confronto tra scenari;
* spiegazioni più granulari delle singole componenti.

L'approccio rimarrebbe invariato: **business logic deterministica, trasparente e testabile**.

---

## Run locally

```bash
git clone https://github.com/ciroprisco310796-creator/calcolo-netto-ral.git
cd calcolo-netto-ral
npm install
npm run dev
```

---

Built with **Lovable** as a development accelerator, with the fiscal calculation logic kept deterministic and independently validated.
