/**
 * Deterministic Italian net salary calculator (2026 simplified model).
 *
 * Scope: private-sector employee, permanent contract, fiscally resident in
 * Milan (Lombardy) for the whole year, single employment income, no dependants.
 * No LLM / external API: pure arithmetic, no intermediate rounding.
 */

// --- Fiscal constants -------------------------------------------------------

export const NUMBER_OF_PAYMENTS = 13;

/** Employee social security */
const BASE_CONTRIBUTION_RATE = 0.0919;
const ADDITIONAL_CONTRIBUTION_THRESHOLD = 56224;
const ADDITIONAL_CONTRIBUTION_RATE = 0.01;

/** IRPEF 2026 brackets */
const IRPEF_BRACKET_1_LIMIT = 28000;
const IRPEF_BRACKET_2_LIMIT = 50000;
const IRPEF_RATE_1 = 0.23;
const IRPEF_RATE_2 = 0.33;
const IRPEF_RATE_3 = 0.43;

/** Employment income deduction (TUIR art. 13, simplified) */
const DEDUCTION_MIN_INCOME = 15000;
const DEDUCTION_FLAT = 1955;
const DEDUCTION_MID_BASE = 1910;
const DEDUCTION_MID_VARIABLE = 1190;
const DEDUCTION_MID_RANGE = 13000;
const DEDUCTION_HIGH_RANGE = 22000;
const DEDUCTION_EXTRA_AMOUNT = 65;
const DEDUCTION_EXTRA_MIN = 25000;
const DEDUCTION_EXTRA_MAX = 35000;

/** Tax wedge benefit */
const WEDGE_CASH_LIMIT_1 = 8500;
const WEDGE_CASH_LIMIT_2 = 15000;
const WEDGE_CASH_LIMIT_3 = 20000;
const WEDGE_CASH_RATE_1 = 0.071;
const WEDGE_CASH_RATE_2 = 0.053;
const WEDGE_CASH_RATE_3 = 0.048;
const WEDGE_DEDUCTION_AMOUNT = 1000;
const WEDGE_DEDUCTION_FULL_LIMIT = 32000;
const WEDGE_DEDUCTION_PHASE_OUT_LIMIT = 40000;

/** Lombardy regional additional tax */
const REGIONAL_RATE_1 = 0.0123;
const REGIONAL_RATE_2 = 0.0158;
const REGIONAL_RATE_3 = 0.0172;
const REGIONAL_RATE_4 = 0.0173;

/** Milan municipal additional tax */
const MUNICIPAL_RATE = 0.008;
const MUNICIPAL_EXEMPTION_THRESHOLD = 23000;

// --- Types ------------------------------------------------------------------

export interface SalaryBreakdown {
  grossSalary: number;
  baseSocialSecurityContributions: number;
  additionalSocialSecurityContribution: number;
  totalSocialSecurityContributions: number;
  taxableIncome: number;
  grossIrpef: number;
  employmentDeduction: number;
  taxWedgeDeduction: number;
  taxWedgeCashBonus: number;
  netIrpef: number;
  regionalTax: number;
  municipalTax: number;
  totalTaxes: number;
  totalDeductions: number;
  annualNetSalary: number;
  averageNetPerPayment: number;
  numberOfPayments: number;
}

// --- Deterministic steps ----------------------------------------------------

export function calculateEmployeeContributions(grossSalary: number) {
  const base = grossSalary * BASE_CONTRIBUTION_RATE;
  // Extra 1% applies only to the portion above the threshold.
  const additional =
    Math.max(0, grossSalary - ADDITIONAL_CONTRIBUTION_THRESHOLD) *
    ADDITIONAL_CONTRIBUTION_RATE;

  return { base, additional, total: base + additional };
}

export function calculateTaxableIncome(
  grossSalary: number,
  totalContributions: number,
): number {
  return grossSalary - totalContributions;
}

export function calculateGrossIrpef(taxableIncome: number): number {
  if (taxableIncome <= IRPEF_BRACKET_1_LIMIT) {
    return taxableIncome * IRPEF_RATE_1;
  }

  if (taxableIncome <= IRPEF_BRACKET_2_LIMIT) {
    return (
      IRPEF_BRACKET_1_LIMIT * IRPEF_RATE_1 +
      (taxableIncome - IRPEF_BRACKET_1_LIMIT) * IRPEF_RATE_2
    );
  }

  return (
    IRPEF_BRACKET_1_LIMIT * IRPEF_RATE_1 +
    (IRPEF_BRACKET_2_LIMIT - IRPEF_BRACKET_1_LIMIT) * IRPEF_RATE_2 +
    (taxableIncome - IRPEF_BRACKET_2_LIMIT) * IRPEF_RATE_3
  );
}

export function calculateEmploymentDeduction(taxableIncome: number): number {
  let deduction: number;

  if (taxableIncome <= DEDUCTION_MIN_INCOME) {
    deduction = DEDUCTION_FLAT;
  } else if (taxableIncome <= IRPEF_BRACKET_1_LIMIT) {
    deduction =
      DEDUCTION_MID_BASE +
      DEDUCTION_MID_VARIABLE *
        ((IRPEF_BRACKET_1_LIMIT - taxableIncome) / DEDUCTION_MID_RANGE);
  } else if (taxableIncome <= IRPEF_BRACKET_2_LIMIT) {
    deduction =
      DEDUCTION_MID_BASE *
      ((IRPEF_BRACKET_2_LIMIT - taxableIncome) / DEDUCTION_HIGH_RANGE);
  } else {
    deduction = 0;
  }

  // Explicit additional 65 EUR for incomes between 25k and 35k.
  if (taxableIncome > DEDUCTION_EXTRA_MIN && taxableIncome <= DEDUCTION_EXTRA_MAX) {
    deduction += DEDUCTION_EXTRA_AMOUNT;
  }

  return deduction;
}

export function calculateTaxWedgeBenefit(taxableIncome: number): {
  cashBonus: number;
  taxDeduction: number;
} {
  // Case A: tax-free cash benefit, does not reduce IRPEF.
  if (taxableIncome <= WEDGE_CASH_LIMIT_3) {
    let rate = WEDGE_CASH_RATE_3;
    if (taxableIncome <= WEDGE_CASH_LIMIT_1) rate = WEDGE_CASH_RATE_1;
    else if (taxableIncome <= WEDGE_CASH_LIMIT_2) rate = WEDGE_CASH_RATE_2;

    return { cashBonus: taxableIncome * rate, taxDeduction: 0 };
  }

  // Case B: flat 1.000 EUR deduction.
  if (taxableIncome <= WEDGE_DEDUCTION_FULL_LIMIT) {
    return { cashBonus: 0, taxDeduction: WEDGE_DEDUCTION_AMOUNT };
  }

  // Case C: linear phase-out.
  if (taxableIncome <= WEDGE_DEDUCTION_PHASE_OUT_LIMIT) {
    return {
      cashBonus: 0,
      taxDeduction:
        WEDGE_DEDUCTION_AMOUNT *
        ((WEDGE_DEDUCTION_PHASE_OUT_LIMIT - taxableIncome) /
          (WEDGE_DEDUCTION_PHASE_OUT_LIMIT - WEDGE_DEDUCTION_FULL_LIMIT)),
    };
  }

  // Case D: no benefit.
  return { cashBonus: 0, taxDeduction: 0 };
}

export function calculateNetIrpef(
  grossIrpef: number,
  employmentDeduction: number,
  taxWedgeDeduction: number,
): number {
  return Math.max(0, grossIrpef - employmentDeduction - taxWedgeDeduction);
}

export function calculateLombardyRegionalTax(taxableIncome: number): number {
  let tax = 0;

  tax += Math.min(taxableIncome, 15000) * REGIONAL_RATE_1;

  if (taxableIncome > 15000) {
    tax += Math.min(taxableIncome - 15000, 13000) * REGIONAL_RATE_2;
  }

  if (taxableIncome > 28000) {
    tax += Math.min(taxableIncome - 28000, 22000) * REGIONAL_RATE_3;
  }

  if (taxableIncome > 50000) {
    tax += (taxableIncome - 50000) * REGIONAL_RATE_4;
  }

  return tax;
}

export function calculateMilanMunicipalTax(taxableIncome: number): number {
  // The threshold is an exemption, not a franchise: above it the whole
  // taxable income is taxed.
  if (taxableIncome <= MUNICIPAL_EXEMPTION_THRESHOLD) return 0;
  return taxableIncome * MUNICIPAL_RATE;
}

export function calculateNetSalary(params: {
  grossSalary: number;
  totalSocialSecurityContributions: number;
  netIrpef: number;
  regionalTax: number;
  municipalTax: number;
  taxWedgeCashBonus: number;
}): number {
  return (
    params.grossSalary -
    params.totalSocialSecurityContributions -
    params.netIrpef -
    params.regionalTax -
    params.municipalTax +
    params.taxWedgeCashBonus
  );
}

// --- Top level --------------------------------------------------------------

export function calculateSalary(annualGrossSalary: number): SalaryBreakdown {
  const grossSalary = annualGrossSalary;

  const contributions = calculateEmployeeContributions(grossSalary);
  const taxableIncome = calculateTaxableIncome(grossSalary, contributions.total);

  const grossIrpef = calculateGrossIrpef(taxableIncome);
  const employmentDeduction = calculateEmploymentDeduction(taxableIncome);
  const wedge = calculateTaxWedgeBenefit(taxableIncome);

  const netIrpef = calculateNetIrpef(
    grossIrpef,
    employmentDeduction,
    wedge.taxDeduction,
  );

  const regionalTax = calculateLombardyRegionalTax(taxableIncome);
  const municipalTax = calculateMilanMunicipalTax(taxableIncome);

  const totalTaxes = netIrpef + regionalTax + municipalTax;
  const totalDeductions = contributions.total + totalTaxes;

  const annualNetSalary = calculateNetSalary({
    grossSalary,
    totalSocialSecurityContributions: contributions.total,
    netIrpef,
    regionalTax,
    municipalTax,
    taxWedgeCashBonus: wedge.cashBonus,
  });

  return {
    grossSalary,
    baseSocialSecurityContributions: contributions.base,
    additionalSocialSecurityContribution: contributions.additional,
    totalSocialSecurityContributions: contributions.total,
    taxableIncome,
    grossIrpef,
    employmentDeduction,
    taxWedgeDeduction: wedge.taxDeduction,
    taxWedgeCashBonus: wedge.cashBonus,
    netIrpef,
    regionalTax,
    municipalTax,
    totalTaxes,
    totalDeductions,
    annualNetSalary,
    averageNetPerPayment: annualNetSalary / NUMBER_OF_PAYMENTS,
    numberOfPayments: NUMBER_OF_PAYMENTS,
  };
}

// --- Formatting helpers (presentation only) ---------------------------------

export function formatEuro(value: number, decimals = 2): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** Parses Italian-style numeric input ("40.000,50", "40000", "40.000 €"). */
export function parseRalInput(raw: string): number | null {
  const cleaned = raw.replace(/[€\s]/g, "");
  if (cleaned === "") return null;
  if (!/^\d{1,3}(\.\d{3})*(,\d+)?$|^\d+([.,]\d+)?$/.test(cleaned)) return null;

  let normalized = cleaned;
  if (cleaned.includes(",")) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    normalized = cleaned.replace(/\./g, "");
  }

  const value = Number(normalized);
  if (!Number.isFinite(value)) return null;
  return value;
}
