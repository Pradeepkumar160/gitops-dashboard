import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { AnimatedIndicator } from "@/components/AnimatedIndicator";
import { Activity, AlertCircle, CheckCircle2, GitBranch, Zap } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function Home() {
  // Fetch pipeline runs for dashboard stats
  const { data: pipelineRuns = [] } = trpc.pipeline.getRuns.useQuery({
    limit: 10,
  });

  // Fetch deployments for all environments
  const { data: devDeployments = [] } = trpc.deployment.getByNamespace.useQuery({
    namespace: "dev",
  });
  const { data: stagingDeployments = [] } = trpc.deployment.getByNamespace.useQuery({
    namespace: "staging",
  });
  const { data: prodDeployments = [] } = trpc.deployment.getByNamespace.useQuery({
    namespace: "production",
  });

  // Calculate stats
  const successfulRuns = pipelineRuns.filter((r) => r.status === "success").length;
  const failedRuns = pipelineRuns.filter((r) => r.status === "failed").length;
  const activeDeployments = [
    ...devDeployments,
    ...stagingDeployments,
    ...prodDeployments,
  ].filter((d) => d.status === "healthy").length;

  const recentActivity = pipelineRuns.slice(0, 5).map((run) => ({
    id: run.id,
    type: "pipeline",
    title: `Pipeline run on ${run.branch}`,
    description: run.commitMessage || "No message",
    status: run.status,
    timestamp: run.createdAt,
  }));

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-2 text-muted-foreground">
          Real-time visibility into your DevOps infrastructure
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Successful Runs */}
        <Card className="border-border bg-card hover:border-green-500/50 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Runs</CardTitle>
            <CheckCircle2 className="h-5 w-5 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{successfulRuns}</div>
            <p className="mt-1 text-xs text-muted-foreground">Last 10 runs</p>
          </CardContent>
        </Card>

        {/* Failed Runs */}
        <Card className="border-border bg-card hover:border-red-500/50 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Runs</CardTitle>
            <AlertCircle className="h-5 w-5 text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{failedRuns}</div>
            <p className="mt-1 text-xs text-muted-foreground">Last 10 runs</p>
          </CardContent>
        </Card>

        {/* Active Deployments */}
        <Card className="border-border bg-card hover:border-cyan-500/50 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Deployments</CardTitle>
            <Zap className="h-5 w-5 text-cyan-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{activeDeployments}</div>
            <p className="mt-1 text-xs text-muted-foreground">Healthy status</p>
          </CardContent>
        </Card>

        {/* Cluster Health */}
        <Card className="border-border bg-card hover:border-purple-500/50 transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cluster Health</CardTitle>
            <div className="flex items-center gap-2">
              <AnimatedIndicator type="active" size="sm" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">98%</div>
            <p className="mt-1 text-xs text-muted-foreground">Uptime</p>
          </CardContent>
        </Card>
      </div>

      {/* Environment Status */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { name: "Development", deployments: devDeployments, color: "blue" },
          { name: "Staging", deployments: stagingDeployments, color: "orange" },
          { name: "Production", deployments: prodDeployments, color: "green" },
        ].map((env) => (
          <Card key={env.name} className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-base">{env.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Deployments</span>
                <span className="font-semibold text-foreground">{env.deployments.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Healthy</span>
                <span className="font-semibold text-green-400">
                  {env.deployments.filter((d) => d.status === "healthy").length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Sync Status</span>
                <StatusBadge
                  status={
                    env.deployments.some((d) => d.argoCdSyncStatus === "out-of-sync")
                      ? "warning"
                      : "success"
                  }
                  label={
                    env.deployments.some((d) => d.argoCdSyncStatus === "out-of-sync")
                      ? "Out of Sync"
                      : "Synced"
                  }
                  size="sm"
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-cyan-400" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 border-b border-border pb-4 last:border-0"
                >
                  <div className="mt-1">
                    <AnimatedIndicator
                      type={
                        activity.status === "success"
                          ? "active"
                          : activity.status === "failed"
                            ? "error"
                            : "syncing"
                      }
                      size="sm"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{activity.title}</p>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  <StatusBadge status={activity.status as any} label={activity.status} size="sm" />
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
