import type {
  Portfolio,
  Transaction,
  FraudAlert,
  KYCCheck,
  FinancialReport,
  FintechMetrics,
} from "./types";

export const portfolios: Portfolio[] = [
  {
    id: "p-001",
    name: "Global Growth Fund",
    client: "Apex Capital Partners",
    aum: 47_200_000,
    returnYtd: 12.4,
    return1y: 18.7,
    riskScore: 7,
    allocations: [
      { asset: "US Large Cap", ticker: "VOO", percentage: 35, value: 16_520_000, color: "#5b5bd6" },
      { asset: "International Equity", ticker: "VXUS", percentage: 25, value: 11_800_000, color: "#22c55e" },
      { asset: "Corporate Bonds", ticker: "LQD", percentage: 20, value: 9_440_000, color: "#f59e0b" },
      { asset: "Real Estate", ticker: "VNQ", percentage: 12, value: 5_664_000, color: "#ef4444" },
      { asset: "Cash", ticker: "BIL", percentage: 8, value: 3_776_000, color: "#94a3b8" },
    ],
  },
  {
    id: "p-002",
    name: "Income & Yield Strategy",
    client: "Meridian Trust",
    aum: 28_500_000,
    returnYtd: 6.2,
    return1y: 9.1,
    riskScore: 3,
    allocations: [
      { asset: "Treasury Bonds", ticker: "TLT", percentage: 40, value: 11_400_000, color: "#5b5bd6" },
      { asset: "Dividend Stocks", ticker: "SCHD", percentage: 30, value: 8_550_000, color: "#22c55e" },
      { asset: "Corporate Bonds", ticker: "LQD", percentage: 20, value: 5_700_000, color: "#f59e0b" },
      { asset: "REITs", ticker: "O", percentage: 10, value: 2_850_000, color: "#ef4444" },
    ],
  },
  {
    id: "p-003",
    name: "Aggressive Tech Portfolio",
    client: "Phoenix Ventures",
    aum: 15_800_000,
    returnYtd: 28.3,
    return1y: 42.6,
    riskScore: 9,
    allocations: [
      { asset: "Tech Growth", ticker: "QQQ", percentage: 45, value: 7_110_000, color: "#5b5bd6" },
      { asset: "Semiconductors", ticker: "SMH", percentage: 25, value: 3_950_000, color: "#22c55e" },
      { asset: "AI & Robotics", ticker: "BOTZ", percentage: 15, value: 2_370_000, color: "#f59e0b" },
      { asset: "Crypto Equities", ticker: "BITQ", percentage: 10, value: 1_580_000, color: "#ef4444" },
      { asset: "Cash", ticker: "BIL", percentage: 5, value: 790_000, color: "#94a3b8" },
    ],
  },
  {
    id: "p-004",
    name: "Balanced ESG Mandate",
    client: "Greenfield Advisors",
    aum: 22_300_000,
    returnYtd: 9.8,
    return1y: 14.2,
    riskScore: 5,
    allocations: [
      { asset: "ESG Leaders", ticker: "ESGU", percentage: 40, value: 8_920_000, color: "#5b5bd6" },
      { asset: "Green Bonds", ticker: "BGRN", percentage: 25, value: 5_575_000, color: "#22c55e" },
      { asset: "Clean Energy", ticker: "ICLN", percentage: 20, value: 4_460_000, color: "#f59e0b" },
      { asset: "Sustainable RE", ticker: "SRVR", percentage: 10, value: 2_230_000, color: "#ef4444" },
      { asset: "Cash", ticker: "BIL", percentage: 5, value: 1_115_000, color: "#94a3b8" },
    ],
  },
];

export const transactions: Transaction[] = [
  { id: "tx-001", portfolioId: "p-001", type: "buy", asset: "US Large Cap", ticker: "VOO", amount: 1200, price: 548.32, total: 657_984, timestamp: "2026-06-09T14:22:00Z", flagged: false },
  { id: "tx-002", portfolioId: "p-003", type: "buy", asset: "Semiconductors", ticker: "SMH", amount: 800, price: 264.15, total: 211_320, timestamp: "2026-06-09T13:45:00Z", flagged: false },
  { id: "tx-003", portfolioId: "p-001", type: "sell", asset: "Corporate Bonds", ticker: "LQD", amount: 500, price: 107.82, total: 53_910, timestamp: "2026-06-09T12:10:00Z", flagged: false },
  { id: "tx-004", portfolioId: "p-002", type: "dividend", asset: "Dividend Stocks", ticker: "SCHD", amount: 1, price: 0, total: 24_500, timestamp: "2026-06-09T08:00:00Z", flagged: false },
  { id: "tx-005", portfolioId: "p-003", type: "transfer", asset: "Cash", ticker: "BIL", amount: 1, price: 0, total: 500_000, timestamp: "2026-06-09T07:15:00Z", flagged: true, flagReason: "Large cash movement to offshore account" },
  { id: "tx-006", portfolioId: "p-002", type: "buy", asset: "Treasury Bonds", ticker: "TLT", amount: 3000, price: 93.45, total: 280_350, timestamp: "2026-06-08T16:30:00Z", flagged: false },
  { id: "tx-007", portfolioId: "p-004", type: "sell", asset: "Clean Energy", ticker: "ICLN", amount: 1500, price: 16.22, total: 24_330, timestamp: "2026-06-08T15:00:00Z", flagged: false },
  { id: "tx-008", portfolioId: "p-001", type: "buy", asset: "Real Estate", ticker: "VNQ", amount: 2200, price: 91.53, total: 201_366, timestamp: "2026-06-08T11:40:00Z", flagged: false },
  { id: "tx-009", portfolioId: "p-003", type: "sell", asset: "Crypto Equities", ticker: "BITQ", amount: 400, price: 42.80, total: 17_120, timestamp: "2026-06-08T10:10:00Z", flagged: true, flagReason: "Unusual trading pattern detected" },
  { id: "tx-010", portfolioId: "p-002", type: "buy", asset: "REITs", ticker: "O", amount: 5000, price: 62.38, total: 311_900, timestamp: "2026-06-08T09:00:00Z", flagged: false },
  { id: "tx-011", portfolioId: "p-004", type: "transfer", asset: "Cash", ticker: "BIL", amount: 1, price: 0, total: 750_000, timestamp: "2026-06-07T18:25:00Z", flagged: true, flagReason: "Transfer exceeds regulatory threshold" },
  { id: "tx-012", portfolioId: "p-001", type: "buy", asset: "International Equity", ticker: "VXUS", amount: 600, price: 62.14, total: 37_284, timestamp: "2026-06-07T14:00:00Z", flagged: false },
  { id: "tx-013", portfolioId: "p-003", type: "buy", asset: "AI & Robotics", ticker: "BOTZ", amount: 350, price: 31.89, total: 11_162, timestamp: "2026-06-07T11:30:00Z", flagged: false },
  { id: "tx-014", portfolioId: "p-004", type: "buy", asset: "Green Bonds", ticker: "BGRN", amount: 2000, price: 48.75, total: 97_500, timestamp: "2026-06-07T09:45:00Z", flagged: false },
  { id: "tx-015", portfolioId: "p-002", type: "sell", asset: "Corporate Bonds", ticker: "LQD", amount: 1200, price: 107.82, total: 129_384, timestamp: "2026-06-06T16:20:00Z", flagged: true, flagReason: "Sale timing matches insider activity window" },
];

export const fraudAlerts: FraudAlert[] = [
  { id: "fa-001", transactionId: "tx-005", severity: "high", riskScore: 87, title: "Large Offshore Transfer", description: "$500K customer-authorized transfer follows an online investment solicitation and targets a jurisdiction flagged as high-risk by FATF. Transaction originates from a recently opened account, and a same-session recovery-phone change makes the in-session contact path untrusted.", detectedAt: "2026-06-09T07:16:00Z", status: "new", category: "geographic", modelConfidence: 91, falsePositiveRisk: 18, fundsMovementChannel: "ach_credit_push", counterpartyReviewStatus: "coordinated_review", counterpartyIntelligenceStatus: "scam_watchlist_hit", customerAuthorized: true, scamOriginChannel: "online_platform", customerOutreachStatus: "challenge_sent", customerContactIntegrityStatus: "independent_contact_required", paymentInstructionVerificationStatus: "bank_account_mismatch", beneficiaryRiskSignals: ["new_beneficiary", "payee_name_mismatch", "high_risk_jurisdiction"], accountHandoverSignals: ["new_device_after_kyc", "credential_reset_before_transfer", "behavioral_biometrics_shift"], aiImpersonationSignals: [], settlementWindowSeconds: 180, interventionAction: "pause_payment", recommendedAction: "Hold payment and verify beneficiary ownership through a trusted contact channel captured before the recovery-phone change." },
  { id: "fa-002", transactionId: "tx-009", severity: "medium", riskScore: 62, title: "Pattern Deviation: Crypto Sell-off", description: "Unusual sell pattern in crypto equities diverges from portfolio's historical buy-and-hold behavior.", detectedAt: "2026-06-08T10:12:00Z", status: "investigating", category: "anomaly", modelConfidence: 74, falsePositiveRisk: 42, fundsMovementChannel: "crypto", counterpartyReviewStatus: "not_required", counterpartyIntelligenceStatus: "manual_verification", customerAuthorized: false, scamOriginChannel: "not_applicable", customerOutreachStatus: "not_required", customerContactIntegrityStatus: "trusted_channels_intact", paymentInstructionVerificationStatus: "not_required", beneficiaryRiskSignals: ["session_anomaly"], accountHandoverSignals: ["behavioral_biometrics_shift"], aiImpersonationSignals: [], settlementWindowSeconds: 1800, interventionAction: "analyst_review", recommendedAction: "Compare against historical crypto allocation policy before escalating to compliance." },
  { id: "fa-003", transactionId: "tx-011", severity: "high", riskScore: 79, title: "Regulatory Threshold Breach", description: "Customer-approved transfer follows an emailed supplier-account change and exceeds the $500K reporting threshold. The changed banking instructions have not been independently verified.", detectedAt: "2026-06-07T18:30:00Z", status: "new", category: "aml", modelConfidence: 88, falsePositiveRisk: 22, fundsMovementChannel: "wire", counterpartyReviewStatus: "originator_review", counterpartyIntelligenceStatus: "manual_verification", customerAuthorized: true, scamOriginChannel: "email", customerOutreachStatus: "queued", customerContactIntegrityStatus: "trusted_channels_intact", paymentInstructionVerificationStatus: "change_unverified", beneficiaryRiskSignals: ["new_beneficiary", "high_risk_jurisdiction"], accountHandoverSignals: ["new_device_after_kyc"], aiImpersonationSignals: [], settlementWindowSeconds: 240, interventionAction: "pause_payment", recommendedAction: "Pause payment, verify the changed supplier instructions through a pre-existing vendor-master callback, and assemble the SAR review packet." },
  { id: "fa-004", transactionId: "tx-015", severity: "medium", riskScore: 55, title: "Insider Window Correlation", description: "Bond sale timing aligns with known insider trading window for related securities.", detectedAt: "2026-06-06T16:25:00Z", status: "investigating", category: "anomaly", modelConfidence: 67, falsePositiveRisk: 51, fundsMovementChannel: "securities_trade", counterpartyReviewStatus: "not_required", counterpartyIntelligenceStatus: "clear", customerAuthorized: false, scamOriginChannel: "not_applicable", customerOutreachStatus: "not_required", customerContactIntegrityStatus: "trusted_channels_intact", paymentInstructionVerificationStatus: "not_required", beneficiaryRiskSignals: ["session_anomaly"], accountHandoverSignals: [], aiImpersonationSignals: [], settlementWindowSeconds: 3600, interventionAction: "analyst_review", recommendedAction: "Check employee watchlist and market-news timing before formal investigation." },
  { id: "fa-005", severity: "critical", riskScore: 94, title: "Identity Verification Failure", description: "Multiple KYC document mismatches and deepfake injection artifacts detected in the liveness capture for Phoenix Ventures. Possible synthetic identity.", detectedAt: "2026-06-09T06:00:00Z", status: "new", category: "identity", modelConfidence: 96, falsePositiveRisk: 9, fundsMovementChannel: "card", counterpartyReviewStatus: "originator_review", counterpartyIntelligenceStatus: "manual_verification", customerAuthorized: false, scamOriginChannel: "online_platform", customerOutreachStatus: "challenge_sent", customerContactIntegrityStatus: "independent_contact_required", paymentInstructionVerificationStatus: "not_required", beneficiaryRiskSignals: ["payee_name_mismatch", "device_handoff"], accountHandoverSignals: ["new_device_after_kyc", "sim_swap_indicator"], aiImpersonationSignals: ["deepfake_injection_suspected", "synthetic_document_artifact"], settlementWindowSeconds: 120, interventionAction: "step_up_verification", recommendedAction: "Freeze onboarding workflow, run an independent liveness challenge, and request live document re-verification." },
  { id: "fa-006", severity: "low", riskScore: 28, title: "Velocity Check: Rapid Trading", description: "Three consecutive trades executed within 5 minutes. Within tolerance but flagged for review.", detectedAt: "2026-06-08T14:55:00Z", status: "dismissed", category: "velocity", modelConfidence: 53, falsePositiveRisk: 68, fundsMovementChannel: "securities_trade", counterpartyReviewStatus: "not_required", counterpartyIntelligenceStatus: "clear", customerAuthorized: false, scamOriginChannel: "not_applicable", customerOutreachStatus: "not_required", customerContactIntegrityStatus: "trusted_channels_intact", paymentInstructionVerificationStatus: "not_required", beneficiaryRiskSignals: ["session_anomaly"], accountHandoverSignals: [], aiImpersonationSignals: [], settlementWindowSeconds: 7200, interventionAction: "analyst_review", recommendedAction: "Route to analyst sampling queue; likely benign unless paired with login anomalies." },
  { id: "fa-007", severity: "high", riskScore: 81, title: "Suspicious Structuring Pattern", description: "Multiple sub-$10K transactions follow a recovery-email change that blocked routine outreach, potentially structured to avoid reporting and mule-account detection.", detectedAt: "2026-06-08T09:30:00Z", status: "new", category: "aml", modelConfidence: 84, falsePositiveRisk: 28, fundsMovementChannel: "ach_credit_push", counterpartyReviewStatus: "receiving_bank_review", counterpartyIntelligenceStatus: "mule_cluster_match", customerAuthorized: false, scamOriginChannel: "unknown", customerOutreachStatus: "not_required", customerContactIntegrityStatus: "outbound_channel_blocked", paymentInstructionVerificationStatus: "existing_instructions_match", beneficiaryRiskSignals: ["mule_network_link", "new_beneficiary"], accountHandoverSignals: ["session_cookie_replay", "behavioral_biometrics_shift"], aiImpersonationSignals: [], settlementWindowSeconds: 210, interventionAction: "freeze_mule_route", recommendedAction: "Aggregate linked accounts, freeze mule-route settlement, and verify through a pre-change customer contact channel." },
  { id: "fa-008", severity: "medium", riskScore: 48, title: "Geographic Anomaly: IP Mismatch", description: "Login from an unrecognized jurisdiction during a customer-authorized session while the customer reports voice-clone artifacts on a live phone call with an alleged bank investigator. A recent recovery-phone change makes the in-session contact path untrusted. Account normally accessed from New York; this login originated in Eastern Europe.", detectedAt: "2026-06-07T22:15:00Z", status: "investigating", category: "geographic", modelConfidence: 72, falsePositiveRisk: 46, fundsMovementChannel: "instant_payment", counterpartyReviewStatus: "receiving_bank_review", counterpartyIntelligenceStatus: "manual_verification", customerAuthorized: true, scamOriginChannel: "telecom", customerOutreachStatus: "challenge_sent", customerContactIntegrityStatus: "recent_contact_change", paymentInstructionVerificationStatus: "existing_instructions_match", beneficiaryRiskSignals: ["device_handoff", "session_anomaly"], accountHandoverSignals: ["new_device_after_kyc", "session_cookie_replay"], aiImpersonationSignals: ["voice_clone_suspected", "authority_impersonation"], settlementWindowSeconds: 240, interventionAction: "step_up_verification", recommendedAction: "Pause release, challenge with step-up authentication, and verify the caller through a trusted-channel callback." },
];

export const kycChecks: KYCCheck[] = [
  { id: "kyc-001", client: "Apex Capital Partners", status: "passed", documentType: "passport", jurisdiction: "US", submittedAt: "2026-01-15T10:00:00Z", verifiedAt: "2026-01-16T14:30:00Z", score: 96 },
  { id: "kyc-002", client: "Meridian Trust", status: "passed", documentType: "national_id", jurisdiction: "DE", submittedAt: "2026-02-22T09:00:00Z", verifiedAt: "2026-02-23T11:15:00Z", score: 88 },
  { id: "kyc-003", client: "Phoenix Ventures", status: "pending", documentType: "passport", jurisdiction: "KY", submittedAt: "2026-06-08T15:00:00Z", score: 42, notes: "Document image quality insufficient. Requesting resubmission." },
  { id: "kyc-004", client: "Greenfield Advisors", status: "passed", documentType: "drivers_license", jurisdiction: "GB", submittedAt: "2026-03-10T12:00:00Z", verifiedAt: "2026-03-11T09:45:00Z", score: 93 },
  { id: "kyc-005", client: "Phoenix Ventures", status: "failed", documentType: "utility_bill", jurisdiction: "KY", submittedAt: "2026-06-08T16:30:00Z", score: 18, notes: "Address verification failed. Document appears altered." },
  { id: "kyc-006", client: "Apex Capital Partners", status: "expired", documentType: "passport", jurisdiction: "US", submittedAt: "2025-06-01T08:00:00Z", verifiedAt: "2025-06-02T13:00:00Z", score: 91, notes: "KYC documents expired. Renewal required within 30 days." },
  { id: "kyc-007", client: "Meridian Trust", status: "pending", documentType: "national_id", jurisdiction: "SG", submittedAt: "2026-06-12T03:15:00Z", score: 61, notes: "SG jurisdiction requires additional PEP/sanctions screening. Awaiting MAS-compliant certification." },
  { id: "kyc-008", client: "Apex Capital Partners", status: "pending", documentType: "passport", jurisdiction: "AE", submittedAt: "2026-06-11T09:00:00Z", score: 55, notes: "UAE beneficial ownership disclosure incomplete. DFSA rules require ultimate beneficial owner attestation." },
  { id: "kyc-009", client: "Greenfield Advisors", status: "passed", documentType: "utility_bill", jurisdiction: "CH", submittedAt: "2026-05-20T14:00:00Z", verifiedAt: "2026-05-22T10:30:00Z", score: 89, notes: "Swiss FINMA cross-border onboarding completed. EU GDPR data-processing addendum signed." },
];

export const financialReports: FinancialReport[] = [
  {
    id: "rpt-001",
    title: "Q2 2026 Portfolio Review",
    period: "2026-Q2",
    generatedAt: "2026-06-09T08:00:00Z",
    type: "quarterly",
    summary: "Aggregate AUM up 14.2% QoQ. Fraud detection rate improved to 99.7% with new ML models. Two high-severity alerts require immediate attention.",
    sections: [
      { heading: "AUM Summary", content: "Total assets under management reached $113.8M across four managed portfolios, up from $99.6M in Q1 2026.", highlight: 14.2 },
      { heading: "Risk & Compliance", content: "KYC pass rate at 75%. One client flagged for synthetic identity risk. Enhanced due diligence initiated.", highlight: 75 },
      { heading: "Portfolio Performance", content: "Weighted average portfolio return of 14.2% YTD. Tech-heavy portfolio leading with 28.3% YTD.", highlight: 14.2 },
      { heading: "Fraud Detection", content: "8 active alerts this quarter. 3 high/critical severity. New transformer-based detection model deployed.", highlight: 8 },
    ],
  },
];

export const metrics: FintechMetrics = {
  totalAum: 113_800_000,
  totalTransactions: 15,
  flaggedTransactions: 4,
  kycPassRate: 44,
  averagePortfolioReturn: 14.2,
  activeFraudAlerts: 8,
  criticalAlerts: 3,
  pendingKycChecks: 3,
};
