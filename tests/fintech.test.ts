import { describe, it, expect } from "vitest";
import {
  portfolios,
  transactions,
  fraudAlerts,
  kycChecks,
  financialReports,
  metrics,
} from "@/lib/demo-data";

describe("Fintech AI Suite", () => {
  describe("Portfolios", () => {
    it("has exactly 4 portfolios", () => {
      expect(portfolios).toHaveLength(4);
    });

    it("each portfolio has valid allocations that sum to 100%", () => {
      for (const p of portfolios) {
        const total = p.allocations.reduce((sum, a) => sum + a.percentage, 0);
        expect(total).toBe(100);
      }
    });

    it("total AUM across all portfolios matches metrics", () => {
      const totalAum = portfolios.reduce((sum, p) => sum + p.aum, 0);
      expect(totalAum).toBe(metrics.totalAum);
    });

    it("each portfolio allocation value matches its percentage of AUM", () => {
      for (const p of portfolios) {
        for (const a of p.allocations) {
          const expectedValue = Math.round(p.aum * (a.percentage / 100));
          // Allow small rounding diff
          expect(Math.abs(a.value - expectedValue)).toBeLessThanOrEqual(1_000);
        }
      }
    });
  });

  describe("Transactions", () => {
    it("has exactly 15 transactions", () => {
      expect(transactions).toHaveLength(15);
    });

    it("has exactly 4 flagged transactions matching metrics", () => {
      const flagged = transactions.filter((t) => t.flagged);
      expect(flagged).toHaveLength(metrics.flaggedTransactions);
    });

    it("every flagged transaction has a flag reason", () => {
      for (const t of transactions.filter((t) => t.flagged)) {
        expect(t.flagReason).toBeTruthy();
        expect(typeof t.flagReason).toBe("string");
        expect(t.flagReason!.length).toBeGreaterThan(0);
      }
    });

    it("all transaction portfolioIds reference existing portfolios", () => {
      const portfolioIds = new Set(portfolios.map((p) => p.id));
      for (const t of transactions) {
        expect(portfolioIds.has(t.portfolioId)).toBe(true);
      }
    });
  });

  describe("Fraud Alerts", () => {
    it("has exactly 8 fraud alerts", () => {
      expect(fraudAlerts).toHaveLength(8);
    });

    it("at least one critical alert exists matching metrics", () => {
      const critical = fraudAlerts.filter((a) => a.severity === "critical");
      expect(critical.length).toBeGreaterThanOrEqual(1);
    });

    it("all risk scores are between 0 and 100", () => {
      for (const a of fraudAlerts) {
        expect(a.riskScore).toBeGreaterThanOrEqual(0);
        expect(a.riskScore).toBeLessThanOrEqual(100);
      }
    });

    it("captures model confidence and false-positive risk for analyst triage", () => {
      for (const a of fraudAlerts) {
        expect(a.modelConfidence).toBeGreaterThanOrEqual(0);
        expect(a.modelConfidence).toBeLessThanOrEqual(100);
        expect(a.falsePositiveRisk).toBeGreaterThanOrEqual(0);
        expect(a.falsePositiveRisk).toBeLessThanOrEqual(100);
        expect(a.recommendedAction.length).toBeGreaterThan(20);
      }
    });

    it("records real-time intervention windows for APP and mule-risk alerts", () => {
      const validActions = new Set([
        "pause_payment",
        "step_up_verification",
        "freeze_mule_route",
        "analyst_review",
      ]);

      for (const a of fraudAlerts) {
        expect(validActions.has(a.interventionAction)).toBe(true);
        expect(a.settlementWindowSeconds).toBeGreaterThanOrEqual(0);
        expect(a.settlementWindowSeconds).toBeLessThanOrEqual(86_400);

        if (["high", "critical"].includes(a.severity)) {
          expect(a.settlementWindowSeconds).toBeLessThanOrEqual(300);
        }
      }
    });

    it("requires customer-authorized scam alerts to pause or verify before settlement", () => {
      const customerAuthorizedAlerts = fraudAlerts.filter(
        (a) => a.customerAuthorized,
      );

      expect(customerAuthorizedAlerts.length).toBeGreaterThanOrEqual(1);

      for (const a of customerAuthorizedAlerts) {
        expect(["pause_payment", "step_up_verification"]).toContain(
          a.interventionAction,
        );
        expect(a.settlementWindowSeconds).toBeLessThanOrEqual(300);
        expect(a.recommendedAction.toLowerCase()).toMatch(
          /hold|pause|verify|authentication|outreach/,
        );
      }
    });

    it("queues customer outreach for authorized payment scams before settlement", () => {
      const validOutreachStates = new Set([
        "not_required",
        "queued",
        "challenge_sent",
        "confirmed_safe",
        "unable_to_reach",
      ]);
      const authorizedPaymentAlerts = fraudAlerts.filter(
        (a) =>
          a.customerAuthorized &&
          ["ach_credit_push", "wire", "instant_payment"].includes(
            a.fundsMovementChannel,
          ),
      );

      expect(authorizedPaymentAlerts.length).toBeGreaterThanOrEqual(1);

      for (const a of fraudAlerts) {
        expect(validOutreachStates.has(a.customerOutreachStatus)).toBe(true);
      }

      for (const a of authorizedPaymentAlerts) {
        expect(a.customerOutreachStatus).not.toBe("not_required");
        expect(["queued", "challenge_sent", "unable_to_reach"]).toContain(
          a.customerOutreachStatus,
        );
        expect(a.settlementWindowSeconds).toBeLessThanOrEqual(300);
      }
    });

    it("routes ACH and instant-payment APP risk through counterparty review", () => {
      const realTimeCreditPushAlerts = fraudAlerts.filter(
        (a) =>
          a.customerAuthorized &&
          ["ach_credit_push", "instant_payment"].includes(
            a.fundsMovementChannel,
          ),
      );

      expect(realTimeCreditPushAlerts.length).toBeGreaterThanOrEqual(1);

      for (const a of realTimeCreditPushAlerts) {
        expect(["receiving_bank_review", "coordinated_review"]).toContain(
          a.counterpartyReviewStatus,
        );
        expect(a.settlementWindowSeconds).toBeLessThanOrEqual(300);
        expect(a.recommendedAction.toLowerCase()).toMatch(
          /hold|pause|verify|authentication|beneficiary|step-up/,
        );
      }
    });

    it("attaches beneficiary-risk evidence to APP and mule-route interventions", () => {
      const validSignals = new Set([
        "new_beneficiary",
        "payee_name_mismatch",
        "high_risk_jurisdiction",
        "mule_network_link",
        "device_handoff",
        "session_anomaly",
      ]);
      const appOrMuleAlerts = fraudAlerts.filter(
        (a) => a.customerAuthorized || a.interventionAction === "freeze_mule_route",
      );

      expect(appOrMuleAlerts.length).toBeGreaterThanOrEqual(1);

      for (const a of fraudAlerts) {
        for (const signal of a.beneficiaryRiskSignals) {
          expect(validSignals.has(signal)).toBe(true);
        }
      }

      for (const a of appOrMuleAlerts) {
        expect(a.beneficiaryRiskSignals.length).toBeGreaterThanOrEqual(1);
      }

      expect(
        fraudAlerts.some(
          (a) =>
            a.interventionAction === "freeze_mule_route" &&
            a.beneficiaryRiskSignals.includes("mule_network_link"),
        ),
      ).toBe(true);
    });

    it("surfaces counterparty intelligence for scam-linked or mule account risk", () => {
      const validStatuses = new Set([
        "clear",
        "manual_verification",
        "scam_watchlist_hit",
        "mule_cluster_match",
      ]);
      const highRiskPaymentAlerts = fraudAlerts.filter(
        (a) =>
          ["high", "critical"].includes(a.severity) &&
          ["ach_credit_push", "wire", "instant_payment"].includes(
            a.fundsMovementChannel,
          ),
      );
      const muleRouteAlerts = fraudAlerts.filter((a) =>
        a.beneficiaryRiskSignals.includes("mule_network_link"),
      );

      expect(highRiskPaymentAlerts.length).toBeGreaterThanOrEqual(1);
      expect(muleRouteAlerts.length).toBeGreaterThanOrEqual(1);

      for (const a of fraudAlerts) {
        expect(validStatuses.has(a.counterpartyIntelligenceStatus)).toBe(true);
      }

      for (const a of highRiskPaymentAlerts) {
        expect(a.counterpartyIntelligenceStatus).not.toBe("clear");
      }

      for (const a of muleRouteAlerts) {
        expect(["mule_cluster_match", "scam_watchlist_hit"]).toContain(
          a.counterpartyIntelligenceStatus,
        );
        expect(a.recommendedAction.toLowerCase()).toMatch(
          /mule|freeze|receiving bank|counterparty|beneficiary/,
        );
      }
    });

    it("does not auto-escalate dismissed alert-fatigue candidates", () => {
      const dismissedAlerts = fraudAlerts.filter((a) => a.status === "dismissed");
      expect(dismissedAlerts.length).toBeGreaterThanOrEqual(1);

      for (const a of dismissedAlerts) {
        expect(a.falsePositiveRisk).toBeGreaterThan(a.riskScore);
        expect(a.severity).toBe("low");
      }
    });
  });

  describe("KYC Checks", () => {
    it("has exactly 9 KYC checks", () => {
      expect(kycChecks).toHaveLength(9);
    });

    it("passed KYC checks have a verifiedAt date", () => {
      const passed = kycChecks.filter((k) => k.status === "passed");
      for (const k of passed) {
        expect(k.verifiedAt).toBeTruthy();
      }
    });

    it("all KYC scores are between 0 and 100", () => {
      for (const k of kycChecks) {
        expect(k.score).toBeGreaterThanOrEqual(0);
        expect(k.score).toBeLessThanOrEqual(100);
      }
    });

    it("every KYC check has a jurisdiction", () => {
      for (const k of kycChecks) {
        expect(k.jurisdiction).toBeTruthy();
        expect(typeof k.jurisdiction).toBe("string");
        expect(k.jurisdiction.length).toBe(2);
      }
    });

    it("high-risk jurisdictions have pending or failed checks", () => {
      const highRiskJdx = new Set(["KY", "AE"]);
      for (const k of kycChecks.filter((k) => highRiskJdx.has(k.jurisdiction))) {
        expect(["pending", "failed"]).toContain(k.status);
      }
    });

    it("pending checks from non-US jurisdictions include jurisdiction-specific notes", () => {
      const pendingNonUS = kycChecks.filter(
        (k) => k.status === "pending" && k.jurisdiction !== "US",
      );
      expect(pendingNonUS.length).toBeGreaterThanOrEqual(1);
      for (const k of pendingNonUS) {
        expect(k.notes).toBeTruthy();
        expect(k.notes!.length).toBeGreaterThan(10);
      }
    });
  });

  describe("Financial Reports", () => {
    it("has at least 1 financial report", () => {
      expect(financialReports.length).toBeGreaterThanOrEqual(1);
    });

    it("every report has at least one section", () => {
      for (const r of financialReports) {
        expect(r.sections.length).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe("Metrics", () => {
    it("metrics are internally consistent with data", () => {
      expect(metrics.totalAum).toBeGreaterThan(0);
      expect(metrics.totalTransactions).toBe(transactions.length);
      expect(metrics.flaggedTransactions).toBe(
        transactions.filter((t) => t.flagged).length,
      );
      expect(metrics.activeFraudAlerts).toBe(fraudAlerts.length);
      expect(metrics.kycPassRate).toBeGreaterThanOrEqual(0);
      expect(metrics.kycPassRate).toBeLessThanOrEqual(100);
    });
  });
});
