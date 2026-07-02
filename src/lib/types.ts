export interface AssetAllocation {
  asset: string;
  ticker: string;
  percentage: number;
  value: number;
  color: string;
}

export interface Portfolio {
  id: string;
  name: string;
  client: string;
  aum: number;
  returnYtd: number;
  return1y: number;
  riskScore: number; // 1-10
  allocations: AssetAllocation[];
}

export interface Transaction {
  id: string;
  portfolioId: string;
  type: "buy" | "sell" | "transfer" | "dividend";
  asset: string;
  ticker: string;
  amount: number;
  price: number;
  total: number;
  timestamp: string;
  flagged: boolean;
  flagReason?: string;
}

export type FraudInterventionAction =
  | "pause_payment"
  | "step_up_verification"
  | "freeze_mule_route"
  | "analyst_review";

export type FundsMovementChannel =
  | "ach_credit_push"
  | "wire"
  | "instant_payment"
  | "card"
  | "crypto"
  | "securities_trade";

export type CounterpartyReviewStatus =
  | "not_required"
  | "originator_review"
  | "receiving_bank_review"
  | "coordinated_review";

export type CounterpartyIntelligenceStatus =
  | "clear"
  | "manual_verification"
  | "scam_watchlist_hit"
  | "mule_cluster_match";

export type CustomerOutreachStatus =
  | "not_required"
  | "queued"
  | "challenge_sent"
  | "confirmed_safe"
  | "unable_to_reach";

export type BeneficiaryRiskSignal =
  | "new_beneficiary"
  | "payee_name_mismatch"
  | "high_risk_jurisdiction"
  | "mule_network_link"
  | "device_handoff"
  | "session_anomaly";

export interface FraudAlert {
  id: string;
  transactionId?: string;
  severity: "low" | "medium" | "high" | "critical";
  riskScore: number; // 0-100
  modelConfidence: number; // 0-100
  falsePositiveRisk: number; // 0-100, higher means analysts should triage before escalation
  fundsMovementChannel: FundsMovementChannel; // distinguishes ACH/instant credit-push risk from trades
  counterpartyReviewStatus: CounterpartyReviewStatus; // captures sending/receiving institution review needs
  counterpartyIntelligenceStatus: CounterpartyIntelligenceStatus; // scam-account watchlist or mule-network graph hit
  customerAuthorized: boolean; // APP-style scams can pass traditional auth controls
  customerOutreachStatus: CustomerOutreachStatus; // direct customer warning/challenge state before release
  beneficiaryRiskSignals: BeneficiaryRiskSignal[]; // payee, mule, or session evidence beyond clean auth
  settlementWindowSeconds: number; // time left to pause, verify, or freeze before funds settle
  interventionAction: FraudInterventionAction;
  title: string;
  description: string;
  recommendedAction: string;
  detectedAt: string;
  status: "new" | "investigating" | "resolved" | "dismissed";
  category: "anomaly" | "aml" | "identity" | "velocity" | "geographic";
}

export interface KYCCheck {
  id: string;
  client: string;
  status: "passed" | "pending" | "failed" | "expired";
  documentType: "passport" | "drivers_license" | "national_id" | "utility_bill";
  jurisdiction: string; // ISO 3166-1 alpha-2 or "international"
  submittedAt: string;
  verifiedAt?: string;
  score: number; // 0-100
  notes?: string;
}

export interface FinancialReport {
  id: string;
  title: string;
  period: string;
  generatedAt: string;
  type: "monthly" | "quarterly" | "annual";
  sections: ReportSection[];
  summary: string;
}

export interface ReportSection {
  heading: string;
  content: string;
  highlight?: number;
}

export interface FintechMetrics {
  totalAum: number;
  totalTransactions: number;
  flaggedTransactions: number;
  kycPassRate: number;
  averagePortfolioReturn: number;
  activeFraudAlerts: number;
  criticalAlerts: number;
  pendingKycChecks: number;
}
