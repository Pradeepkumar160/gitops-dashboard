import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { AnimatedIndicator } from "@/components/AnimatedIndicator";
import { Filter, History } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useState } from "react";

export default function PipelineHistory() {
  const { user } = useAuth();
  const [environment, setEnvironment] = useState<"dev" | "staging" | "production" | undefined>();
  const [status, setStatus] = useState<string | undefined>();

  const { data: pipelineRuns = [] } = trpc.pipeline.getRuns.useQuery({
    environment: environment,
    status: status,
    limit: 100,
  });

  if (user?.role !== "admin") {
    return (
      <div className="flex h-64 items-center justify-center">
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center gap-4 pt-6">
            <p className="text-lg font-semibold text-foreground">Access Denied</p>
            <p className="text-muted-foreground">Pipeline history is only available to administrators.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Pipeline History</h1>
        <p className="mt-2 text-muted-foreground">
          Complete audit trail of all CI/CD pipeline executions
        </p>
      </div>

      {/* Filters */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-cyan-400" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Environment</label>
            <select
              value={environment || ""}
              onChange={(e) => setEnvironment((e.target.value as any) || undefined)}
              className="mt-2 w-full rounded-lg border border-border bg-slate-700/30 px-3 py-2 text-foreground"
            >
              <option value="">All Environments</option>
              <option value="dev">Development</option>
              <option value="staging">Staging</option>
              <option value="production">Production</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <select
              value={status || ""}
              onChange={(e) => setStatus(e.target.value || undefined)}
              className="mt-2 w-full rounded-lg border border-border bg-slate-700/30 px-3 py-2 text-foreground"
            >
              <option value="">All Statuses</option>
              <option value="success">Success</option>
              <option value="failed">Failed</option>
              <option value="pending">Pending</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                setEnvironment(undefined);
                setStatus(undefined);
              }}
              className="w-full rounded-lg border border-border bg-slate-700/30 px-3 py-2 text-sm font-medium text-foreground hover:bg-slate-700/50"
            >
              Reset Filters
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Pipeline Runs Table */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">
          {pipelineRuns.length} Run{pipelineRuns.length !== 1 ? "s" : ""}
        </h2>
        {pipelineRuns.length > 0 ? (
          <div className="space-y-3">
            {pipelineRuns.map((run) => (
              <Card
                key={run.id}
                className="border-border bg-card hover:border-cyan-500/50 transition-all duration-200"
              >
                <CardContent className="pt-6">
                  <div className="grid gap-4 md:grid-cols-6">
                    {/* Run ID & Branch */}
                    <div className="md:col-span-2">
                      <p className="text-xs text-muted-foreground">RUN ID</p>
                      <p className="font-mono text-sm text-foreground">{run.runId.slice(0, 8)}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Branch: {run.branch}</p>
                    </div>

                    {/* Commit */}
                    <div>
                      <p className="text-xs text-muted-foreground">COMMIT</p>
                      <p className="font-mono text-sm text-cyan-400">{run.commitSha.slice(0, 8)}</p>
                    </div>

                    {/* Environment */}
                    <div>
                      <p className="text-xs text-muted-foreground">ENVIRONMENT</p>
                      <p className="capitalize text-sm font-medium text-foreground">
                        {run.environment}
                      </p>
                    </div>

                    {/* Status */}
                    <div>
                      <p className="text-xs text-muted-foreground">STATUS</p>
                      <StatusBadge
                        status={run.status as any}
                        label={run.status}
                        size="sm"
                      />
                    </div>

                    {/* Date */}
                    <div>
                      <p className="text-xs text-muted-foreground">DATE</p>
                      <p className="text-sm text-foreground">
                        {new Date(run.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(run.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {/* Commit Message */}
                  {run.commitMessage && (
                    <div className="mt-3 border-t border-border pt-3">
                      <p className="text-sm text-muted-foreground">{run.commitMessage}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="border-border bg-card">
            <CardContent className="flex h-32 items-center justify-center">
              <div className="text-center">
                <History className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">No pipeline runs found</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
