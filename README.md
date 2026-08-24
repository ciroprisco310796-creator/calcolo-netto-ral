# Product Builder - Jet HR Task

Build a deterministic Italian Net Salary Calculator prototype

I am building this prototype as part of a Product / AI Builder exercise.

The goal is not to create a complete Italian payroll engine. The goal is to build a clear, reliable and explainable prototype that handles one deliberately simplified employee scenario.

A critical requirement is that the calculation logic must remain fully deterministic, transparent and under my control.

Do not use an LLM, external salary calculator, third-party payroll API or any probabilistic system to calculate the output.

All calculations must be performed locally in deterministic TypeScript/JavaScript functions using exactly the rules described below.

1. Product goal

Build a responsive single-page web application where a user can enter an annual gross salary (RAL, Retribuzione Annua Lorda) and click a button to calculate:

estimated annual net salary;

estimated average net salary per monthly payment;

employee social security contributions;

taxable income;

gross IRPEF;

employee tax deduction;

additional tax wedge deduction / bonus where applicable;

net IRPEF;

Lombardy regional additional tax;

Milan municipal additional tax;

total taxes;

total deductions from gross salary.

The application must also clearly explain:

the assumptions used;

how the calculation works;

what is included;

what is intentionally excluded;

the sources behind the model.

The result must always be described as an estimate, not as an official payroll calculation.

2. Prototype scope and assumptions

The calculator models the following standard case:

Italian fiscal year: 2026;

private-sector employee;

permanent employment contract;

employee fiscally resident in Milan, Lombardy for the entire year;

employee works for the full year;

365 days relevant for employee deductions;

only one employment income;

no other sources of income;

no dependent children or other dependent family members;

no disability-related benefits;

no special tax regimes;

no personal deductions beyond the standard employment deductions explicitly described below;

no welfare benefits;

no fringe benefits;

no bonuses or performance-related special taxation;

no stock options;

no pension fund contribution;

no company car;

no relocation benefits;

no supplementary pension deductions;

no treatment of severance pay (TFR);

no tax adjustment from previous employers;

no other personal tax credits.

Use 13 salary payments as the default assumption.

The displayed monthly figure must therefore be described as:

Estimated average net per salary payment — based on 13 payments

Do not describe it as the exact value of each monthly payslip because taxes and adjustments may not be distributed evenly across actual payroll periods.

3. User input

For version 1 there must be only one primary input:

Annual Gross Salary — RAL

Currency: EUR.

Examples:

€20,000

€30,000

€40,000

€50,000

€70,000

Input requirements:

accept positive numeric values;

support typing values naturally;

format the value in euro style when appropriate;

reject negative values;

reject zero;

reject invalid/non-numeric values;

show a clear validation message;

do not calculate if the input is invalid.

Suggested label:

Retribuzione Annua Lorda (RAL)

Suggested helper text:

Inserisci la tua retribuzione annua lorda.

Suggested placeholder:

Es. 40.000 €

Primary CTA:

Calcola il netto

The application language should be Italian.

4. Calculation architecture

Keep the calculation engine separate from the UI.

Create a dedicated module/file for the calculation logic, for example:

src/lib/salaryCalculator.ts

Do not put all formulas directly inside React UI components.

Create small named deterministic functions.

Preferred structure:

calculateEmployeeContributions()
calculateTaxableIncome()
calculateGrossIrpef()
calculateEmploymentDeduction()
calculateTaxWedgeBenefit()
calculateNetIrpef()
calculateLombardyRegionalTax()
calculateMilanMunicipalTax()
calculateNetSalary()


Create one top-level function such as:

calculateSalary(annualGrossSalary)


that returns a structured result object.

Example structure:

{
  grossSalary,
  baseSocialSecurityContributions,
  additionalSocialSecurityContribution,
  totalSocialSecurityContributions,
  taxableIncome,
  grossIrpef,
  employmentDeduction,
  taxWedgeDeduction,
  taxWedgeCashBonus,
  netIrpef,
  regionalTax,
  municipalTax,
  totalTaxes,
  totalDeductions,
  annualNetSalary,
  averageNetPerPayment,
  numberOfPayments
}


Use clear English variable/function names in the code even though the UI is Italian.

5. Precision and rounding

This is important.

Do not round intermediate calculations.

Perform calculations using full JavaScript numeric precision throughout the calculation chain.

Only round numbers for visual presentation.

For display:

show monetary amounts with two decimal places when used in detailed breakdowns;

large headline figures may optionally be rounded to the nearest euro, but detailed values must preserve cents.

Use Italian euro formatting, e.g.:

€ 27.960,24

or:

27.960,24 €

Use one convention consistently.

6. Employee social security contributions

For this simplified model assume a base employee contribution rate of:

9.19% of RAL

Formula:

baseContribution = grossSalary * 0.0919


Additionally, for 2026 model an extra employee social security contribution of:

1% on the portion of gross annual salary exceeding €56,224

Formula:

additionalContribution =
  Math.max(0, grossSalary - 56224) * 0.01


Total:

totalSocialSecurityContributions =
  baseContribution + additionalContribution


Important:

The extra 1% is applied only to the salary amount above €56,224, not to the entire salary.

7. Taxable income

For this prototype use:

taxableIncome =
  grossSalary - totalSocialSecurityContributions


This value is the basis for:

IRPEF;

employment deduction;

tax wedge rules described below;

Lombardy regional additional tax;

Milan municipal additional tax.

8. Gross IRPEF — 2026 brackets

Apply IRPEF progressively.

Use the following 2026 brackets:

up to €28,000 → 23%

from €28,000 to €50,000 → 33%

over €50,000 → 43%

Do not apply a single marginal rate to the entire income.

Implementation:

function calculateGrossIrpef(taxableIncome: number): number {
  if (taxableIncome <= 28000) {
    return taxableIncome * 0.23;
  }

  if (taxableIncome <= 50000) {
    return (
      28000 * 0.23 +
      (taxableIncome - 28000) * 0.33
    );
  }

  return (
    28000 * 0.23 +
    22000 * 0.33 +
    (taxableIncome - 50000) * 0.43
  );
}


For clarity:

First bracket maximum tax:
28,000 × 23% = 6,440

Second bracket maximum additional tax:
22,000 × 33% = 7,260


9. Standard employment income deduction

Use taxableIncome as the employee's total income because the simplified scenario assumes no other income.

For taxable income up to €15,000:

employmentDeduction = 1955


For taxable income above €15,000 and up to €28,000:

employmentDeduction =
  1910 +
  1190 * ((28000 - taxableIncome) / 13000)


For taxable income above €28,000 and up to €50,000:

employmentDeduction =
  1910 * ((50000 - taxableIncome) / 22000)


For taxable income above €50,000:

employmentDeduction = 0


Additionally:

If taxable income is:

> €25,000
and
<= €35,000


add:

employmentDeduction += 65


Make this additional €65 rule explicit in code rather than hiding it in a combined formula.

For example:

if (taxableIncome > 25000 && taxableIncome <= 35000) {
  deduction += 65;
}


10. Tax wedge benefit

Model the structural employee tax wedge benefit using two different mechanisms.

They must remain separate because one is a cash/tax-free amount while the other reduces IRPEF.

Case A — taxable income up to €20,000

Calculate a tax-free cash benefit.

Up to €8,500

cashBonus = taxableIncome * 0.071


Above €8,500 and up to €15,000

cashBonus = taxableIncome * 0.053


Above €15,000 and up to €20,000

cashBonus = taxableIncome * 0.048


This amount must not reduce taxable income.

It must not be subtracted directly from gross IRPEF.

It must be added later when calculating net annual salary.

Case B — taxable income above €20,000 and up to €32,000

Additional tax deduction:

taxWedgeDeduction = 1000


This amount reduces IRPEF.

Case C — taxable income above €32,000 and up to €40,000

The €1,000 deduction decreases linearly:

taxWedgeDeduction =
  1000 * ((40000 - taxableIncome) / 8000)


Case D — taxable income above €40,000

taxWedgeDeduction = 0
cashBonus = 0


Return both values independently:

{
  cashBonus,
  taxDeduction
}


Do not combine them into a generic variable because their fiscal treatment is different.

11. Net IRPEF

Calculate net IRPEF as:

netIrpef = Math.max(
  0,
  grossIrpef -
  employmentDeduction -
  taxWedgeDeduction
)


The tax-free cash bonus for incomes up to €20,000 is not included in this formula.

The Math.max(0, ...) safeguard is required because deductions cannot create negative IRPEF in this simplified model.

12. Lombardy regional additional tax

Apply the Lombardy regional tax progressively using these brackets:

up to €15,000 → 1.23%

from €15,000 to €28,000 → 1.58%

from €28,000 to €50,000 → 1.72%

above €50,000 → 1.73%

It must be implemented progressively.

Do not apply the final marginal percentage to the entire taxable income.

Suggested implementation:

function calculateLombardyRegionalTax(
  taxableIncome: number
): number {
  let tax = 0;

  tax += Math.min(taxableIncome, 15000) * 0.0123;

  if (taxableIncome > 15000) {
    tax +=
      Math.min(taxableIncome - 15000, 13000) *
      0.0158;
  }

  if (taxableIncome > 28000) {
    tax +=
      Math.min(taxableIncome - 28000, 22000) *
      0.0172;
  }

  if (taxableIncome > 50000) {
    tax +=
      (taxableIncome - 50000) *
      0.0173;
  }

  return tax;
}


13. Milan municipal additional tax

For this prototype:

Milan municipal additional tax rate:

0.8%

Exemption threshold:

€23,000 taxable income

Rules:

If:

taxableIncome <= 23000


then:

municipalTax = 0


If:

taxableIncome > 23000


then:

municipalTax = taxableIncome * 0.008


Important:

The €23,000 threshold is not a tax-free allowance/franchise.

For example:

If taxable income is €24,000:

CORRECT:

24,000 × 0.8%


INCORRECT:

(24,000 - 23,000) × 0.8%


14. Annual net salary

Use:

annualNetSalary =
  grossSalary
  - totalSocialSecurityContributions
  - netIrpef
  - regionalTax
  - municipalTax
  + taxWedgeCashBonus


15. Average net per salary payment

Default number of payments:

numberOfPayments = 13


Calculate:

averageNetPerPayment =
  annualNetSalary / numberOfPayments


In the UI call this:

Netto medio stimato per mensilità

Sub-label:

Basato su 13 mensilità

Do not imply that every real payslip will have exactly this value.

16. Total taxes and total deductions

Return useful aggregate values.

Suggested:

totalTaxes =
  netIrpef +
  regionalTax +
  municipalTax


and:

totalDeductions =
  totalSocialSecurityContributions +
  totalTaxes


The cash tax wedge bonus is not a deduction and therefore must not reduce totalDeductions.

17. Main UI hierarchy

Create a clean, modern HR/SaaS interface.

Do not make it visually overdesigned.

Prioritize:

clarity;

trust;

readability;

explainability;

product quality.

Use generous whitespace, clear typography and restrained UI components.

Desktop and mobile must both work well.

18. Hero section

Suggested structure:

Heading

Calcola il tuo netto dalla RAL

Supporting copy

Una stima semplice e trasparente del netto annuale e mensile per un dipendente residente a Milano.

Small contextual badge:

Regole fiscali 2026

Input and CTA should be immediately visible without scrolling on a normal laptop display.

19. Results summary

After calculation, display a prominent summary section.

The two most important result cards:

Netto annuale stimato

Example:

€27.960,24

Netto medio per mensilità

Example:

€2.150,79

Supporting label:

su 13 mensilità

Also show a small statement such as:

Stima basata sulle assunzioni del prototipo. Non sostituisce un calcolo payroll professionale.

20. Breakdown section

Below the main outcome show a clear breakdown.

Suggested structure:

Dalla RAL al netto

Rows:

RAL
€40.000,00

Contributi previdenziali
− €3.676,00

Reddito imponibile
€36.324,00

IRPEF lorda
− €9.186,92

Detrazione lavoro dipendente
+ €1.187,33

Riduzione cuneo fiscale
+ €459,50

IRPEF netta
− €7.540,09

Addizionale regionale Lombardia
− €533,07

Addizionale comunale Milano
− €290,59

Netto annuale stimato
€27.960,24

If a cash tax wedge bonus exists, show it as a separate positive row.

For example:

Beneficio fiscale esente
+ €871,78

Do not show zero-value bonus rows unless doing so improves understanding.

21. Explainability

I want the user to understand why the result was produced.

Create an expandable section such as:

Come viene calcolato?

Explain the sequence:

RAL
↓
Contributi previdenziali
↓
Reddito imponibile
↓
IRPEF per scaglioni
↓
Detrazioni
↓
Addizionali regionali e comunali
↓
Netto stimato


Use plain Italian.

Avoid overly legal language.

Do not hide formulas, but do not overload the default view.

An accordion or expandable detail is appropriate.

22. Assumptions section

Create a section titled:

Assunzioni del prototipo

Clearly list:

anno fiscale 2026;

dipendente privato;

contratto a tempo indeterminato;

residenza fiscale a Milano per l'intero anno;

365 giorni di lavoro;

nessun altro reddito;

nessun familiare fiscalmente a carico;

nessuna agevolazione fiscale personale;

aliquota contributiva standardizzata secondo il modello;

13 mensilità;

nessun welfare, fringe benefit o premio;

nessun fondo pensione;

nessun trattamento particolare del CCNL.

Add a visible statement:

Queste assunzioni permettono di modellare un caso standard e mantenere il prototipo intenzionalmente semplice e verificabile.

23. Limitations section

Create a section titled:

Limiti del modello

Explain clearly that the calculator:

is an estimate;

is not a payroll engine;

does not model every possible Italian employment scenario;

does not handle CCNL-specific contribution differences;

does not handle dependants;

does not handle personal deductions;

does not model welfare or fringe benefits;

does not model bonuses or special taxation;

does not model pension contributions;

does not model multiple employers or additional income;

does not model TFR;

does not model payroll timing effects and tax adjustments;

intentionally excludes the Italian trattamento integrativo because eligibility can depend on additional tax conditions outside the simplified scope.

Explicitly state:

Il trattamento integrativo è stato escluso intenzionalmente dal modello, invece di implementarne una versione parziale o potenzialmente fuorviante.

This limitation is important and must remain visible in the project.

24. Sources

Create a final section titled:

Fonti

Use official/institutional sources where possible.

The page should make clear that the fiscal model was researched rather than generated arbitrarily.

Include these source categories:

IRPEF 2026

Italian Ministry of Labour / 2026 Budget Law information.

Source:
https://www.lavoro.gov.it/notizie/pagine/legge-di-bilancio-2026-le-principali-misure-lavoratori-imprese-e-famiglie

Employee deductions

Italian TUIR, Article 13 / official legal documentation.

Source:
https://def.giustiziatributaria.gov.it/

Social security contributions

INPS official documentation.

Source:
https://www.inps.it/

Lombardy regional additional tax

Regione Lombardia official documentation.

Source:
https://www.regione.lombardia.it/

Milan municipal additional tax

Comune di Milano official documentation.

Source:
https://www.comune.milano.it/aree-tematiche/tributi/addizionale-comunale-irpef

Tax wedge benefit

Agenzia delle Entrate official documentation.

Source:
https://infoprecompilata.agenziaentrate.gov.it/

External source links should open in a new tab.

Do not invent additional fiscal sources or rules without asking me first.

25. Golden acceptance tests

The following are mandatory acceptance tests.

The implementation is considered correct only if it reproduces these results, allowing differences of no more than approximately €0.01 due solely to floating-point/display rounding.

Do not modify formulas to make tests pass artificially.

Test A — RAL €20,000

Expected:

Gross salary: €20,000.00
Base contributions: €1,838.00
Additional contribution: €0.00
Total contributions: €1,838.00
Taxable income: €18,162.00
Gross IRPEF: €4,177.26
Employment deduction: €2,810.56
Tax wedge deduction: €0.00
Tax wedge cash bonus: €871.78
Net IRPEF: €1,366.70
Lombardy regional tax: €234.46
Milan municipal tax: €0.00
Annual net salary: €17,432.61
Average net / 13: €1,340.97


Test B — RAL €30,000

Expected:

Gross salary: €30,000.00
Total contributions: €2,757.00
Taxable income: €27,243.00
Gross IRPEF: €6,265.89
Employment deduction: €2,044.29
Tax wedge deduction: €1,000.00
Tax wedge cash bonus: €0.00
Net IRPEF: €3,221.60
Lombardy regional tax: €377.94
Milan municipal tax: €217.94
Annual net salary: €23,425.52
Average net / 13: €1,801.96


Test C — RAL €40,000

Expected:

Gross salary: €40,000.00
Total contributions: €3,676.00
Taxable income: €36,324.00
Gross IRPEF: €9,186.92
Employment deduction: €1,187.33
Tax wedge deduction: €459.50
Tax wedge cash bonus: €0.00
Net IRPEF: €7,540.09
Lombardy regional tax: €533.07
Milan municipal tax: €290.59
Annual net salary: €27,960.24
Average net / 13: €2,150.79


Test D — RAL €50,000

Expected:

Gross salary: €50,000.00
Total contributions: €4,595.00
Taxable income: €45,405.00
Gross IRPEF: €12,183.65
Employment deduction: €398.93
Tax wedge deduction: €0.00
Tax wedge cash bonus: €0.00
Net IRPEF: €11,784.72
Lombardy regional tax: €689.27
Milan municipal tax: €363.24
Annual net salary: €32,567.77
Average net / 13: €2,505.21


Test E — RAL €70,000

Expected:

Gross salary: €70,000.00
Base contributions: €6,433.00
Additional 1% contribution: €137.76
Total contributions: €6,570.76
Taxable income: €63,429.24
Gross IRPEF: €19,474.57
Employment deduction: €0.00
Tax wedge deduction: €0.00
Tax wedge cash bonus: €0.00
Net IRPEF: €19,474.57
Lombardy regional tax: €1,000.63
Milan municipal tax: €507.43
Annual net salary: €42,446.61
Average net / 13: €3,265.12


26. Boundary and validation tests

Also make sure the calculation functions behave correctly around relevant boundaries.

Pay particular attention to:

€15,000 taxable income
€20,000 taxable income
€23,000 taxable income
€25,000 taxable income
€28,000 taxable income
€32,000 taxable income
€35,000 taxable income
€40,000 taxable income
€50,000 taxable income
€56,224 gross salary


Be careful with <, <=, > and >=.

These are intentional fiscal boundaries.

Also test:

zero salary;

negative salary;

empty input;

non-numeric input;

very high salary.

Do not allow NaN, Infinity or broken UI states to appear.

27. Testing

If the current project stack supports tests cleanly, create unit tests for the calculation module.

At minimum test:

RAL 20,000
RAL 30,000
RAL 40,000
RAL 50,000
RAL 70,000


Tests should assert the main expected outputs from the golden test cases.

Keep the calculation engine pure so it can easily be tested without rendering UI components.

If adding a testing library would unnecessarily complicate the prototype, prioritize a clean calculation module and create a simple internal test file or validation routine instead.

Do not change the architecture merely for testing aesthetics.

28. Code quality requirements

Important:

avoid one huge calculation function;

avoid duplicated magic numbers;

define fiscal thresholds/rates as named constants where useful;

use descriptive variable names;

add short comments where the fiscal intent would otherwise be unclear;

keep UI and business logic separate;

do not over-engineer;

do not add a backend unless technically necessary;

do not add authentication;

do not add a database;

do not store user salaries remotely;

do not add analytics at this stage;

do not add AI API calls;

do not add unnecessary dependencies.

The entire calculator should be able to run client-side.

29. Privacy

RAL is financial information.

For this prototype:

process it only client-side;

do not persist it;

do not write it to a database;

do not send it to external APIs;

do not log it to external services intentionally.

No login is needed.

30. UX details

After the user clicks Calculate:

smoothly show the results below the input;

maintain the entered RAL so it can easily be edited;

recalculation should work without refreshing the page;

use subtle transitions only;

results must remain readable on mobile;

avoid charts that add visual complexity without useful information.

A simple visual showing the relationship between:

Net salary
Taxes
Social security contributions


is optional only if it improves comprehension.

Do not let a chart replace the numeric breakdown.

31. Visual direction

Style:

modern;

professional;

trustworthy;

lightweight;

HR-tech/SaaS;

minimal;

high information clarity.

Avoid:

overly playful illustrations;

gradients everywhere;

excessive animations;

glassmorphism;

dashboard clutter;

overly dark interfaces;

generic “AI-generated landing page” aesthetics.

The calculator itself is the product.

The user should understand what to do within a few seconds.

32. Important implementation principle

Do not reinterpret or "improve" the fiscal logic unless I explicitly ask for it.

If you identify something that appears inconsistent in the specification:

keep the requested implementation unchanged;

tell me what you believe may be inconsistent;

ask me before changing the fiscal rule.

The calculation specification is the source of truth.

33. Final deliverable

At the end I need a polished, publicly usable prototype suitable for sharing with a hiring team.

Before considering the implementation complete, verify:

the calculator works from a fresh page load;

all five golden tests pass;

mobile layout works;

validation works;

assumptions are visible;

limitations are visible;

sources are visible;

no authentication is required;

no external AI/API is used for calculations;

no salary information is persisted;

the live page can be opened by someone who does not have a Lovable account.

Start by implementing the deterministic calculation engine and validating the five golden test cases.

Only after the engine is working correctly, build or refine the UI around it.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://calcolo-netto-ral.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8e90a973-8934-4852-9bdf-d2e4bc1adaca).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
