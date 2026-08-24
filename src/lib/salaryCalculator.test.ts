import { describe, expect, it } from "vitest";
import { calculateSalary, parseRalInput } from "./salaryCalculator";

const close = (a: number, b: number) => expect(a).toBeCloseTo(b, 2);

describe("golden acceptance tests", () => {
  it("RAL 20.000", () => {
    const r = calculateSalary(20000);
    close(r.totalSocialSecurityContributions, 1838);
    close(r.taxableIncome, 18162);
    close(r.grossIrpef, 4177.26);
    close(r.employmentDeduction, 2810.56);
    close(r.taxWedgeDeduction, 0);
    close(r.taxWedgeCashBonus, 871.78);
    close(r.netIrpef, 1366.7);
    close(r.regionalTax, 234.46);
    close(r.municipalTax, 0);
    close(r.annualNetSalary, 17432.61);
    close(r.averageNetPerPayment, 1340.97);
  });

  it("RAL 30.000", () => {
    const r = calculateSalary(30000);
    close(r.totalSocialSecurityContributions, 2757);
    close(r.taxableIncome, 27243);
    close(r.grossIrpef, 6265.89);
    close(r.employmentDeduction, 2044.29);
    close(r.taxWedgeDeduction, 1000);
    close(r.taxWedgeCashBonus, 0);
    close(r.netIrpef, 3221.6);
    close(r.regionalTax, 377.94);
    close(r.municipalTax, 217.94);
    close(r.annualNetSalary, 23425.52);
    close(r.averageNetPerPayment, 1801.96);
  });

  it("RAL 40.000", () => {
    const r = calculateSalary(40000);
    close(r.totalSocialSecurityContributions, 3676);
    close(r.taxableIncome, 36324);
    close(r.grossIrpef, 9186.92);
    close(r.employmentDeduction, 1187.33);
    close(r.taxWedgeDeduction, 459.5);
    close(r.netIrpef, 7540.09);
    close(r.regionalTax, 533.07);
    close(r.municipalTax, 290.59);
    close(r.annualNetSalary, 27960.24);
    close(r.averageNetPerPayment, 2150.79);
  });

  it("RAL 50.000", () => {
    const r = calculateSalary(50000);
    close(r.totalSocialSecurityContributions, 4595);
    close(r.taxableIncome, 45405);
    close(r.grossIrpef, 12183.65);
    close(r.employmentDeduction, 398.93);
    close(r.taxWedgeDeduction, 0);
    close(r.netIrpef, 11784.72);
    close(r.regionalTax, 689.27);
    close(r.municipalTax, 363.24);
    close(r.annualNetSalary, 32567.77);
    close(r.averageNetPerPayment, 2505.21);
  });

  it("RAL 70.000", () => {
    const r = calculateSalary(70000);
    close(r.baseSocialSecurityContributions, 6433);
    close(r.additionalSocialSecurityContribution, 137.76);
    close(r.totalSocialSecurityContributions, 6570.76);
    close(r.taxableIncome, 63429.24);
    close(r.grossIrpef, 19474.57);
    close(r.employmentDeduction, 0);
    close(r.netIrpef, 19474.57);
    close(r.regionalTax, 1000.63);
    close(r.municipalTax, 507.43);
    close(r.annualNetSalary, 42446.61);
    close(r.averageNetPerPayment, 3265.12);
  });
});

describe("boundaries", () => {
  it("no NaN/Infinity across a wide range", () => {
    for (let ral = 1; ral <= 300000; ral += 137) {
      const r = calculateSalary(ral);
      expect(Number.isFinite(r.annualNetSalary)).toBe(true);
      expect(r.netIrpef).toBeGreaterThanOrEqual(0);
    }
  });

  it("municipal tax threshold is an exemption, not a franchise", () => {
    expect(calculateSalary(23000 / (1 - 0.0919)).municipalTax).toBeCloseTo(0, 2);
  });

  it("1% extra contribution starts above 56.224", () => {
    expect(calculateSalary(56224).additionalSocialSecurityContribution).toBe(0);
    expect(
      calculateSalary(57224).additionalSocialSecurityContribution,
    ).toBeCloseTo(10, 2);
  });
});

describe("input parsing", () => {
  it("parses italian formats", () => {
    expect(parseRalInput("40.000")).toBe(40000);
    expect(parseRalInput("40000")).toBe(40000);
    expect(parseRalInput("40.000,50")).toBe(40000.5);
    expect(parseRalInput("40 000 €")).toBe(40000);
    expect(parseRalInput("-5000")).toBe(null);
    expect(parseRalInput("abc")).toBe(null);
    expect(parseRalInput("")).toBe(null);
  });
});
