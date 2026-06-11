import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { StatusDot } from "@/components/ui/status-dot";
import { StatCard } from "@/components/ui/stat-card";
import {
  metrics,
  transactions,
  fraudAlerts,
  kycChecks,
  portfolios,
  financialReports,
} from "@/lib/demo-data";

function formatCurrency(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n}`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function severityVariant(
  severity: string,
): "danger" | "warning" | "info" | "default" {
  if (severity === "critical") return "danger";
  if (severity === "high") return "warning";
  if (severity === "medium") return "info";
  return "default";
}

function kycStatusVariant(
  status: string,
): "success" | "warning" | "danger" | "default" {
  if (status === "passed") return "success";
  if (status === "pending") return "warning";
  if (status === "failed") return "danger";
  return "default";
}

function dotStatusFromKyc(
  status: string,
): "online" | "warning" | "error" | "offline" {
  if (status === "passed") return "online";
  if (status === "pending") return "warning";
  if (status === "failed") return "error";
  return "offline";
}

export default function FintechDashboard() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Fintech AI Suite
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Portfolio Analytics &amp; Fraud Detection
        </p>
      </header>

      {/* Hero Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total AUM"
          value={formatCurrency(metrics.totalAum)}
          subtitle="Across 4 portfolios"
          trend={{ direction: "up", pct: 14.2 }}
        />
        <StatCard
          label="Flagged Transactions"
          value={String(metrics.flaggedTransactions)}
          subtitle={`of ${metrics.totalTransactions} total`}
          variant="warning"
        />
        <StatCard
          label="KYC Pass Rate"
          value={`${metrics.kycPassRate}%`}
          subtitle={`${metrics.pendingKycChecks} pending`}
          variant={metrics.kycPassRate < 80 ? "warning" : "success"}
        />
        <StatCard
          label="Avg Portfolio Return"
          value={`${metrics.averagePortfolioReturn}%`}
          subtitle="YTD weighted average"
          trend={{ direction: "up", pct: metrics.averagePortfolioReturn }}
        />
      </div>

      {/* Portfolio Allocation and Transaction Feed */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Transaction Feed */}
        <Card title="Recent Transactions">
          <div className="max-h-96 space-y-3 overflow-y-auto">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 p-3 transition-colors hover:bg-slate-50"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`text-xs font-bold uppercase ${
                      tx.type === "buy"
                        ? "text-emerald-600"
                        : tx.type === "sell"
                          ? "text-red-600"
                          : "text-slate-500"
                    }`}
                  >
                    {tx.type}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {tx.ticker}
                    </p>
                    <p className="text-xs text-slate-500">
                      {formatDate(tx.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {formatCurrency(tx.total)}
                    </p>
                    <p className="text-xs text-slate-500">
                      {tx.amount > 1
                        ? `${tx.amount.toLocaleString()} shares`
                        : ""}
                    </p>
                  </div>
                  {tx.flagged && (
                    <Badge variant="danger" className="text-xs">
                      Flagged
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Portfolio Allocation Breakdown */}
        <Card title="Portfolio Allocation">
          <div className="space-y-4">
            {portfolios.map((p) => (
              <div key={p.id}>
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {p.name}
                    </p>
                    <p className="text-xs text-slate-500">{p.client}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-slate-900">
                      {formatCurrency(p.aum)}
                    </p>
                    <p className="text-xs text-emerald-600">
                      +{p.returnYtd}% YTD
                    </p>
                  </div>
                </div>
                <div className="flex h-3 overflow-hidden rounded-full bg-slate-100">
                  {p.allocations.map((a) => (
                    <div
                      key={a.asset}
                      className="h-full transition-all"
                      style={{
                        width: `${a.percentage}%`,
                        backgroundColor: a.color,
                      }}
                      title={`${a.asset} (${a.ticker}): ${a.percentage}%`}
                    />
                  ))}
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {p.allocations.slice(0, 3).map((a) => (
                    <span
                      key={a.asset}
                      className="text-xs text-slate-500"
                    >
                      {a.ticker} {a.percentage}%
                    </span>
                  ))}
                  {p.allocations.length > 3 && (
                    <span className="text-xs text-slate-400">
                      +{p.allocations.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Fraud Alert Queue and KYC Status */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Fraud Alert Queue */}
        <Card
          title="Fraud Alert Queue"
          action={
            <Badge variant="danger">
              {metrics.criticalAlerts} critical
            </Badge>
          }
        >
          <div className="space-y-3">
            {fraudAlerts.map((alert) => (
              <div
                key={alert.id}
                className="rounded-lg border border-slate-100 p-3"
              >
                <div className="mb-1 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StatusDot
                      status={
                        alert.status === "new"
                          ? "error"
                          : alert.status === "investigating"
                            ? "warning"
                            : "online"
                      }
                    />
                    <span className="text-sm font-semibold text-slate-900">
                      {alert.title}
                    </span>
                  </div>
                  <Badge variant={severityVariant(alert.severity)}>
                    {alert.severity}
                  </Badge>
                </div>
                <p className="mb-2 text-xs text-slate-600">
                  {alert.description}
                </p>
                <p className="mb-2 rounded-md bg-slate-50 px-2 py-1 text-xs text-slate-600">
                  <span className="font-semibold text-slate-700">Next action:</span>{" "}
                  {alert.recommendedAction}
                </p>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs text-slate-400">
                    {formatDate(alert.detectedAt)}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-slate-500">
                      Risk: {alert.riskScore}/100
                    </span>
                    <span className="text-xs text-slate-500">
                      Confidence: {alert.modelConfidence}%
                    </span>
                    <span className="text-xs text-slate-500">
                      FP risk: {alert.falsePositiveRisk}%
                    </span>
                    <ProgressBar
                      value={alert.riskScore}
                      variant={
                        alert.riskScore >= 80
                          ? "danger"
                          : alert.riskScore >= 50
                            ? "warning"
                            : "success"
                      }
                      className="w-16"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* KYC Status Dashboard */}
        <Card title="KYC Status Dashboard">
          <div className="space-y-3">
            {kycChecks.map((kyc) => (
              <div
                key={kyc.id}
                className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
              >
                <div className="flex items-center gap-3">
                  <StatusDot status={dotStatusFromKyc(kyc.status)} />
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {kyc.client}
                    </p>
                    <p className="text-xs text-slate-500">
                      {kyc.documentType.replace("_", " ")}
                      {" -- "}
                      {formatDate(kyc.submittedAt)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <Badge variant={kycStatusVariant(kyc.status)}>
                      {kyc.status}
                    </Badge>
                    {kyc.notes && (
                      <p className="mt-1 max-w-48 truncate text-xs text-slate-400">
                        {kyc.notes}
                      </p>
                    )}
                  </div>
                  <div className="w-16">
                    <ProgressBar
                      value={kyc.score}
                      variant={
                        kyc.score >= 80
                          ? "success"
                          : kyc.score >= 50
                            ? "warning"
                            : "danger"
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Financial Report Preview */}
      <Card title="Latest Financial Report">
        {financialReports.map((report) => (
          <div key={report.id}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {report.title}
                </h3>
                <p className="text-sm text-slate-500">
                  {report.period} -- Generated{" "}
                  {new Date(report.generatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <Badge variant="info">{report.type}</Badge>
            </div>
            <p className="mb-4 text-sm text-slate-700">{report.summary}</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {report.sections.map((section) => (
                <div
                  key={section.heading}
                  className="rounded-lg border border-slate-100 p-4"
                >
                  <h4 className="mb-1 text-sm font-semibold text-slate-900">
                    {section.heading}
                  </h4>
                  <p className="text-sm text-slate-600">{section.content}</p>
                  {section.highlight !== undefined && (
                    <p className="mt-2 text-xs font-semibold text-accent">
                      {section.highlight}%{section.heading.includes("AUM") || section.heading.includes("Performance") || section.heading.includes("Portfolio") ? " change" : ""}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
