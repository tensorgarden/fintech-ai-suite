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

export interface FraudAlert {
  id: string;
  transactionId?: string;
  severity: "low" | "medium" | "high" | "critical";
  riskScore: number; // 0-100
  modelConfidence: number; // 0-100
  falsePositiveRisk: number; // 0-100, higher means analysts should triage before escalation
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
