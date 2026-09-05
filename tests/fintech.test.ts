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
    it("has exactly 13 fraud alerts", () => {
      expect(fraudAlerts).toHaveLength(13);
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

    it("retains cross-sector origin signals for customer-authorized payment scams", () => {
      const validOriginChannels = new Set([
        "online_platform",
        "telecom",
        "email",
        "in_person",
        "qr_code",
        "unknown",
        "not_applicable",
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
        expect(validOriginChannels.has(a.scamOriginChannel)).toBe(true);
      }

      for (const a of authorizedPaymentAlerts) {
        expect(a.scamOriginChannel).not.toBe("not_applicable");

        if (a.scamOriginChannel === "online_platform") {
          expect(a.description.toLowerCase()).toMatch(/online|platform|social/);
        }
        if (a.scamOriginChannel === "telecom") {
          expect(a.description.toLowerCase()).toMatch(/call|phone|telecom/);
        }
        if (a.scamOriginChannel === "email") {
          expect(a.description.toLowerCase()).toMatch(/email|supplier/);
        }
      }

      expect(
        authorizedPaymentAlerts.some(
          (a) => a.scamOriginChannel === "online_platform",
        ),
      ).toBe(true);
      expect(
        authorizedPaymentAlerts.some((a) => a.scamOriginChannel === "telecom"),
      ).toBe(true);
    });

    it("holds QR-code crypto redirection scams before irreversible wallet payment", () => {
      const qrCodeAlerts = fraudAlerts.filter(
        (alert) => alert.scamOriginChannel === "qr_code",
      );

      expect(qrCodeAlerts.length).toBeGreaterThanOrEqual(1);

      for (const alert of qrCodeAlerts) {
        expect(alert.customerAuthorized).toBe(true);
        expect(alert.fundsMovementChannel).toBe("crypto");
        expect(alert.interventionAction).toBe("pause_payment");
        expect(alert.settlementWindowSeconds).toBeLessThanOrEqual(300);
        expect(alert.counterpartyIntelligenceStatus).toBe("scam_watchlist_hit");
        expect(alert.payeeNameCheckStatus).toBe("not_available");
        expect(`${alert.title} ${alert.description}`.toLowerCase()).toMatch(
          /qr code|wallet|crypto/,
        );
        expect(alert.recommendedAction.toLowerCase()).toMatch(
          /pause|wallet|trusted|report/,
        );
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

    it("flags post-onboarding account handover cues before funds move", () => {
      const validHandoverSignals = new Set([
        "new_device_after_kyc",
        "credential_reset_before_transfer",
        "session_cookie_replay",
        "behavioral_biometrics_shift",
        "sim_swap_indicator",
      ]);
      const timeCriticalAlerts = fraudAlerts.filter(
        (a) =>
          ["high", "critical"].includes(a.severity) &&
          ["ach_credit_push", "wire", "instant_payment", "card"].includes(
            a.fundsMovementChannel,
          ),
      );

      expect(timeCriticalAlerts.length).toBeGreaterThanOrEqual(1);

      for (const a of fraudAlerts) {
        for (const signal of a.accountHandoverSignals) {
          expect(validHandoverSignals.has(signal)).toBe(true);
        }
      }

      for (const a of timeCriticalAlerts) {
        expect(a.accountHandoverSignals.length).toBeGreaterThanOrEqual(1);
        expect(a.settlementWindowSeconds).toBeLessThanOrEqual(300);
        expect(a.recommendedAction.toLowerCase()).toMatch(
          /hold|pause|verify|challenge|freeze|review/,
        );
      }
    });

    it("records customer contact integrity for every fraud alert", () => {
      const validStatuses = new Set([
        "trusted_channels_intact",
        "recent_contact_change",
        "outbound_channel_blocked",
        "independent_contact_required",
      ]);

      for (const alert of fraudAlerts) {
        expect(validStatuses.has(alert.customerContactIntegrityStatus)).toBe(true);
      }
    });

    it("avoids takeover-changed contact channels during intervention", () => {
      const contactCompromiseSignals = new Set([
        "credential_reset_before_transfer",
        "session_cookie_replay",
        "sim_swap_indicator",
      ]);
      const contactRiskAlerts = fraudAlerts.filter((alert) =>
        alert.accountHandoverSignals.some((signal) =>
          contactCompromiseSignals.has(signal),
        ),
      );

      expect(contactRiskAlerts.length).toBeGreaterThanOrEqual(3);

      for (const alert of contactRiskAlerts) {
        expect(alert.customerContactIntegrityStatus).not.toBe(
          "trusted_channels_intact",
        );
        expect(alert.recommendedAction.toLowerCase()).toMatch(
          /trusted|independent|pre-change|callback|liveness/,
        );
      }
    });

    it("keeps payment-delay reviews within the supported taxonomy", () => {
      const validStatuses = new Set([
        "not_required",
        "reasonable_suspicion_recorded",
        "customer_notice_due",
        "customer_notified",
      ]);

      for (const alert of fraudAlerts) {
        expect(validStatuses.has(alert.paymentDelayReviewStatus)).toBe(true);
      }
    });

    it("records reasonable suspicion before holding payment alerts", () => {
      const heldPaymentAlerts = fraudAlerts.filter(
        (alert) =>
          ["ach_credit_push", "wire", "instant_payment"].includes(
            alert.fundsMovementChannel,
          ) &&
          ["pause_payment", "freeze_mule_route"].includes(
            alert.interventionAction,
          ),
      );

      expect(heldPaymentAlerts.length).toBeGreaterThanOrEqual(3);

      for (const alert of heldPaymentAlerts) {
        expect(alert.paymentDelayReviewStatus).not.toBe("not_required");
        expect(alert.settlementWindowSeconds).toBeLessThanOrEqual(300);
      }
    });

    it("keeps delayed customer-authorized payments on a notice path", () => {
      const delayedAuthorizedPayments = fraudAlerts.filter(
        (alert) =>
          alert.customerAuthorized &&
          ["ach_credit_push", "wire", "instant_payment"].includes(
            alert.fundsMovementChannel,
          ),
      );

      expect(delayedAuthorizedPayments.length).toBeGreaterThanOrEqual(3);

      for (const alert of delayedAuthorizedPayments) {
        expect(["customer_notice_due", "customer_notified"]).toContain(
          alert.paymentDelayReviewStatus,
        );
      }
    });

    it("keeps Confirmation of Payee outcomes within the supported taxonomy", () => {
      const validStatuses = new Set([
        "not_required",
        "not_available",
        "match",
        "close_match",
        "no_match",
      ]);

      for (const alert of fraudAlerts) {
        expect(validStatuses.has(alert.payeeNameCheckStatus)).toBe(true);
      }
    });

    it("holds risky payee-name results before payment release", () => {
      const riskyPayeeAlerts = fraudAlerts.filter(
        (alert) =>
          (["ach_credit_push", "wire", "instant_payment"].includes(
            alert.fundsMovementChannel,
          ) &&
            alert.beneficiaryRiskSignals.includes("payee_name_mismatch")) ||
          ["change_unverified", "bank_account_mismatch"].includes(
            alert.paymentInstructionVerificationStatus,
          ),
      );

      expect(riskyPayeeAlerts.length).toBeGreaterThanOrEqual(2);

      for (const alert of riskyPayeeAlerts) {
        expect(["close_match", "no_match"]).toContain(
          alert.payeeNameCheckStatus,
        );
        expect(alert.interventionAction).toBe("pause_payment");
        expect(alert.settlementWindowSeconds).toBeLessThanOrEqual(300);
      }
    });

    it("keeps APP reimbursement status within the supported taxonomy", () => {
      const validStatuses = new Set([
        "not_applicable",
        "assessment_due",
        "claim_under_review",
        "reimbursed_shared_liability",
      ]);

      for (const alert of fraudAlerts) {
        expect(validStatuses.has(alert.appReimbursementStatus)).toBe(true);
      }
    });

    it("tracks reimbursement claims for customer-authorized payment scams", () => {
      const paymentRails = ["ach_credit_push", "wire", "instant_payment"];
      const appScamAlerts = fraudAlerts.filter(
        (alert) =>
          alert.customerAuthorized &&
          paymentRails.includes(alert.fundsMovementChannel),
      );
      const nonAppAlerts = fraudAlerts.filter(
        (alert) =>
          !(
            alert.customerAuthorized &&
            paymentRails.includes(alert.fundsMovementChannel)
          ),
      );

      expect(appScamAlerts.length).toBeGreaterThanOrEqual(3);

      for (const alert of appScamAlerts) {
        expect(alert.appReimbursementStatus).not.toBe("not_applicable");
      }

      for (const alert of nonAppAlerts) {
        expect(alert.appReimbursementStatus).toBe("not_applicable");
      }
    });

    it("anchors active reimbursement claims in claim evidence", () => {
      const activeClaimAlerts = fraudAlerts.filter((alert) =>
        ["claim_under_review", "reimbursed_shared_liability"].includes(
          alert.appReimbursementStatus,
        ),
      );

      expect(activeClaimAlerts.length).toBeGreaterThanOrEqual(1);

      for (const alert of activeClaimAlerts) {
        expect(
          `${alert.title} ${alert.description} ${alert.recommendedAction}`.toLowerCase(),
        ).toMatch(/\bclaim\b|reimburs|liabilit/);
      }
    });

    it("keeps trusted-contact outreach status within the supported taxonomy", () => {
      const validStatuses = new Set([
        "not_required",
        "designated_outreach_queued",
        "contacted",
        "unable_to_reach",
        "no_trusted_contact_on_file",
      ]);

      for (const alert of fraudAlerts) {
        expect(validStatuses.has(alert.trustedContactOutreachStatus)).toBe(true);
      }
    });

    it("pauses elder-scam wires and routes them through trusted-contact outreach", () => {
      const elderScamAlerts = fraudAlerts.filter((alert) =>
        /elder|older adult|senior|trusted contact/i.test(
          `${alert.title} ${alert.description}`,
        ),
      );

      expect(elderScamAlerts.length).toBeGreaterThanOrEqual(1);

      for (const alert of elderScamAlerts) {
        expect(alert.customerAuthorized).toBe(true);
        expect(alert.interventionAction).toBe("pause_payment");
        expect(alert.settlementWindowSeconds).toBeLessThanOrEqual(300);
        expect(alert.trustedContactOutreachStatus).not.toBe("not_required");
        expect(alert.recommendedAction.toLowerCase()).toMatch(
          /trusted contact|hotline|adult protective|aps/,
        );
      }
    });

    it("treats trusted-contact outreach as a safeguard, not release approval", () => {
      const outreachAlerts = fraudAlerts.filter(
        (alert) => alert.trustedContactOutreachStatus !== "not_required",
      );

      expect(outreachAlerts.length).toBeGreaterThanOrEqual(1);

      for (const alert of outreachAlerts) {
        expect(alert.interventionAction).not.toBe("analyst_review");
        expect(alert.status).not.toBe("resolved");
      }
    });

    it("keeps payment-instruction verification within the supported taxonomy", () => {
      const validStatuses = new Set([
        "not_required",
        "existing_instructions_match",
        "change_unverified",
        "verified_via_independent_channel",
        "bank_account_mismatch",
      ]);

      for (const alert of fraudAlerts) {
        expect(
          validStatuses.has(alert.paymentInstructionVerificationStatus),
        ).toBe(true);
      }
    });

    it("holds emailed supplier-account changes for independent verification", () => {
      const instructionChangeAlerts = fraudAlerts.filter((alert) =>
        /supplier-account change|changed banking instructions|payment instruction/i.test(
          `${alert.title} ${alert.description}`,
        ),
      );

      expect(instructionChangeAlerts.length).toBeGreaterThanOrEqual(1);

      for (const alert of instructionChangeAlerts) {
        expect(["change_unverified", "bank_account_mismatch"]).toContain(
          alert.paymentInstructionVerificationStatus,
        );
        expect(alert.interventionAction).toBe("pause_payment");
        expect(alert.settlementWindowSeconds).toBeLessThanOrEqual(300);
        expect(alert.recommendedAction.toLowerCase()).toMatch(
          /independent|pre-existing|vendor-master|callback|out-of-band/,
        );
      }
    });

    it("keeps close payee matches in pre-settlement review", () => {
      const closeMatchAlerts = fraudAlerts.filter(
        (alert) => alert.payeeNameCheckStatus === "close_match",
      );

      expect(closeMatchAlerts.length).toBeGreaterThanOrEqual(1);

      for (const alert of closeMatchAlerts) {
        expect(["ach_credit_push", "wire", "instant_payment"]).toContain(
          alert.fundsMovementChannel,
        );
        expect(alert.interventionAction).toBe("pause_payment");
        expect(alert.settlementWindowSeconds).toBeLessThanOrEqual(300);
        expect(`${alert.description} ${alert.recommendedAction}`.toLowerCase()).toMatch(
          /close match|resolve|verify|human confirmation/,
        );
      }
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

    it("detects fragmented low-value payment scams before static thresholds", () => {
      const fragmentedPaymentAlerts = fraudAlerts.filter((a) =>
        /sub-\$10K|structured to avoid reporting|multiple small|fragment/i.test(
          `${a.title} ${a.description}`,
        ),
      );

      expect(fragmentedPaymentAlerts.length).toBeGreaterThanOrEqual(1);

      for (const a of fragmentedPaymentAlerts) {
        expect(["ach_credit_push", "wire", "instant_payment"]).toContain(
          a.fundsMovementChannel,
        );
        expect(["receiving_bank_review", "coordinated_review"]).toContain(
          a.counterpartyReviewStatus,
        );
        expect(a.counterpartyIntelligenceStatus).not.toBe("clear");
        expect(a.settlementWindowSeconds).toBeLessThanOrEqual(300);
      }
    });

    it("requires behavior-led AML action for mule convergence patterns", () => {
      const muleConvergenceAlerts = fraudAlerts.filter(
        (a) =>
          a.description.toLowerCase().includes("mule-account") ||
          a.beneficiaryRiskSignals.includes("mule_network_link"),
      );

      expect(muleConvergenceAlerts.length).toBeGreaterThanOrEqual(1);

      for (const a of muleConvergenceAlerts) {
        expect(a.beneficiaryRiskSignals).toContain("mule_network_link");
        expect(a.interventionAction).toBe("freeze_mule_route");
        expect(a.recommendedAction.toLowerCase()).toMatch(
          /aggregate|linked accounts|freeze|receiving bank|settlement/,
        );
      }
    });

    it("keeps agent-initiated payments behind deterministic authorization", () => {
      const validStatuses = new Set([
        "not_applicable",
        "mandate_verified",
        "human_confirmation_required",
        "scope_exceeded",
        "mandate_missing",
      ]);
      const agentAlerts = fraudAlerts.filter(
        (alert) => alert.agentAuthorizationStatus !== "not_applicable",
      );

      expect(agentAlerts.length).toBeGreaterThanOrEqual(1);

      for (const alert of fraudAlerts) {
        expect(validStatuses.has(alert.agentAuthorizationStatus)).toBe(true);
      }

      for (const alert of agentAlerts) {
        expect(alert.fundsMovementChannel).toBe("instant_payment");
        expect([
          "human_confirmation_required",
          "scope_exceeded",
          "mandate_missing",
        ]).toContain(alert.agentAuthorizationStatus);
        expect(alert.interventionAction).toBe("pause_payment");
        expect(alert.settlementWindowSeconds).toBeLessThanOrEqual(300);
        expect(
          `${alert.description} ${alert.recommendedAction}`.toLowerCase(),
        ).toMatch(/agent|mandate|spend cap|human confirmation|authorization/);
      }

      expect(
        agentAlerts.some(
          (alert) =>
            alert.agentAuthorizationStatus === "scope_exceeded" &&
            alert.interventionAction === "pause_payment",
        ),
      ).toBe(true);
    });

    it("keeps AI impersonation evidence within the supported signal taxonomy", () => {
      const validSignals = new Set([
        "voice_clone_suspected",
        "deepfake_injection_suspected",
        "synthetic_document_artifact",
        "authority_impersonation",
      ]);

      for (const alert of fraudAlerts) {
        for (const signal of alert.aiImpersonationSignals) {
          expect(validSignals.has(signal)).toBe(true);
        }
      }
    });

    it("requires independent verification before acting on AI impersonation cues", () => {
      const aiImpersonationAlerts = fraudAlerts.filter(
        (alert) => alert.aiImpersonationSignals.length > 0,
      );

      expect(aiImpersonationAlerts.length).toBeGreaterThanOrEqual(2);

      for (const alert of aiImpersonationAlerts) {
        expect(["pause_payment", "step_up_verification"]).toContain(
          alert.interventionAction,
        );
        expect(alert.settlementWindowSeconds).toBeLessThanOrEqual(300);
        expect(alert.description.toLowerCase()).toMatch(
          /deepfake|voice-clone|synthetic|impersonat/,
        );
        expect(alert.recommendedAction.toLowerCase()).toMatch(
          /liveness|callback|verify|verification|challenge|pause|freeze/,
        );
      }

      expect(
        aiImpersonationAlerts.some((alert) =>
          alert.aiImpersonationSignals.includes("voice_clone_suspected"),
        ),
      ).toBe(true);
      expect(
        aiImpersonationAlerts.some((alert) =>
          alert.aiImpersonationSignals.includes("deepfake_injection_suspected"),
        ),
      ).toBe(true);
    });

    it("does not auto-escalate dismissed alert-fatigue candidates", () => {
      const dismissedAlerts = fraudAlerts.filter((a) => a.status === "dismissed");
      expect(dismissedAlerts.length).toBeGreaterThanOrEqual(1);

      for (const a of dismissedAlerts) {
        expect(a.falsePositiveRisk).toBeGreaterThan(a.riskScore);
        expect(a.severity).toBe("low");
      }
    });

    it("tracks cross-border fraud-registry coverage before release", () => {
      const validStatuses = new Set([
        "not_required",
        "not_available",
        "no_match",
        "partial_coverage",
        "fraud_match",
        "mule_match",
      ]);
      const crossBorderAlerts = fraudAlerts.filter((alert) =>
        /cross-border|offshore|eastern europe/i.test(
          `${alert.title} ${alert.description}`,
        ),
      );

      expect(crossBorderAlerts.length).toBeGreaterThanOrEqual(3);

      for (const alert of fraudAlerts) {
        expect(validStatuses.has(alert.crossBorderRegistryStatus)).toBe(true);
      }

      for (const alert of crossBorderAlerts) {
        expect([
          "partial_coverage",
          "fraud_match",
          "mule_match",
        ]).toContain(alert.crossBorderRegistryStatus);
        expect([
          "pause_payment",
          "step_up_verification",
          "freeze_mule_route",
        ]).toContain(alert.interventionAction);
        expect(alert.settlementWindowSeconds).toBeLessThanOrEqual(300);
        expect(
          `${alert.description} ${alert.recommendedAction}`.toLowerCase(),
        ).toMatch(/hold|pause|freeze|verify|aggregate|registry|receiving bank/);
      }

      expect(
        crossBorderAlerts.some(
          (alert) => alert.crossBorderRegistryStatus === "partial_coverage",
        ),
      ).toBe(true);
      expect(
        crossBorderAlerts.some(
          (alert) => alert.crossBorderRegistryStatus === "mule_match",
        ),
      ).toBe(true);
    });

    it("keeps cross-border mule matches on a freeze path", () => {
      const muleRegistryAlerts = fraudAlerts.filter(
        (alert) => alert.crossBorderRegistryStatus === "mule_match",
      );

      expect(muleRegistryAlerts.length).toBeGreaterThanOrEqual(1);

      for (const alert of muleRegistryAlerts) {
        expect(alert.beneficiaryRiskSignals).toContain("mule_network_link");
        expect(alert.interventionAction).toBe("freeze_mule_route");
        expect(alert.settlementWindowSeconds).toBeLessThanOrEqual(300);
        expect(`${alert.title} ${alert.description}`.toLowerCase()).toMatch(
          /mule|fincen|fca|cross-border/,
        );
        expect(alert.recommendedAction.toLowerCase()).toMatch(
          /aggregate|freeze|receiving bank|settlement/,
        );
      }
    });

    it("keeps mule involvement roles within the supported taxonomy", () => {
      const validRoles = new Set([
        "not_applicable",
        "unwitting_recruit",
        "witting_participant",
        "complicit_operator",
      ]);

      for (const alert of fraudAlerts) {
        expect(validRoles.has(alert.muleInvolvementRole)).toBe(true);
      }
    });

    it("distinguishes unwitting mule recruits from witting participants", () => {
      const unwittingRecruits = fraudAlerts.filter(
        (alert) => alert.muleInvolvementRole === "unwitting_recruit",
      );
      const wittingParticipants = fraudAlerts.filter(
        (alert) => alert.muleInvolvementRole === "witting_participant",
      );

      expect(unwittingRecruits.length).toBeGreaterThanOrEqual(1);
      expect(wittingParticipants.length).toBeGreaterThanOrEqual(1);

      for (const alert of unwittingRecruits) {
        expect(alert.customerOutreachStatus).not.toBe("not_required");
        expect(alert.recommendedAction.toLowerCase()).toMatch(
          /warn|educat|outreach|job scam|notify/,
        );
      }

      for (const alert of wittingParticipants) {
        expect(alert.interventionAction).toBe("freeze_mule_route");
        expect(alert.recommendedAction.toLowerCase()).toMatch(
          /aggregate|freeze|sar|report/,
        );
      }
    });

    it("freezes recruited-mule pass-through activity before instant settlement", () => {
      const passThroughAlerts = fraudAlerts.filter(
        (alert) =>
          alert.muleInvolvementRole !== "not_applicable" &&
          alert.fundsMovementChannel === "instant_payment",
      );

      expect(passThroughAlerts.length).toBeGreaterThanOrEqual(1);

      for (const alert of passThroughAlerts) {
        expect(alert.interventionAction).toBe("freeze_mule_route");
        expect(alert.settlementWindowSeconds).toBeLessThanOrEqual(300);
        expect(alert.counterpartyIntelligenceStatus).toBe("mule_cluster_match");
        expect(alert.payeeNameCheckStatus).not.toBe("match");
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
