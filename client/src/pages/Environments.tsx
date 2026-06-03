import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { AnimatedIndicator } from "@/components/AnimatedIndicator";
import { Activity, Server } from "lucide-react";
import { trpc } from "@/lib/trpc";

const NAMESPACES = ["dev", "staging", "production"] as const;

export default function Environments() {
  const deploymentQueries = NAMESPACES.map((ns) =>
    trpc.deployment.getByNamespace.useQuery({ namespace: ns })
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Environments</h1>
        <p className="mt-2 text-muted-foreground">
          Kubernetes namespace status and deployment management
        </p>
      </div>

      {/* Environment Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {NAMESPACES.map((namespace, idx) => {
          const { data: deployments = [] } = deploymentQueries[idx];
          const healthyCount = deployments.filter((d) => d.status === "healthy").length;
          const totalReplicas = deployments.reduce((sum, d) => sum + d.replicas, 0);
          const readyReplicas = deployments.reduce((sum, d) => sum + d.readyReplicas, 0);
          const syncedCount = deployments.filter((d) => d.argoCdSyncStatus === "synced").length;

          return (
            <Card
              key={namespace}
              className="border-border bg-card hover:border-cyan-500/50 transition-all duration-200"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="capitalize">{namespace}</CardTitle>
                  <AnimatedIndicator
                    type={healthyCount === deployments.length ? "active" : "warning"}
                    size="md"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status Overview */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-slate-700/30 p-3">
                    <p className="text-xs text-muted-foreground">Deployments</p>
                    <p className="text-2xl font-bold text-foreground">{deployments.length}</p>
                  </div>
                  <div className="rounded-lg bg-slate-700/30 p-3">
                    <p className="text-xs text-muted-foreground">Healthy</p>
                    <p className="text-2xl font-bold text-green-400">{healthyCount}</p>
                  </div>
                </div>

                {/* Replica Status */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Replicas</span>
                    <span className="font-semibold text-foreground">
                      {readyReplicas}/{totalReplicas}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-700">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
                      style={{
                        width: totalReplicas > 0 ? `${(readyReplicas / totalReplicas) * 100}%` : "0%",
                      }}
                    />
                  </div>
                </div>

                {/* Argo CD Sync Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Argo CD Sync</span>
                  <StatusBadge
                    status={syncedCount === deployments.length ? "success" : "warning"}
                    label={syncedCount === deployments.length ? "Synced" : "Out of Sync"}
                    size="sm"
                  />
                </div>

                {/* Deployments List */}
                {deployments.length > 0 && (
                  <div className="space-y-2 border-t border-border pt-4">
                    <p className="text-xs font-medium text-muted-foreground">DEPLOYMENTS</p>
                    <div className="space-y-2">
                      {deployments.slice(0, 3).map((deployment) => (
                        <div
                          key={deployment.id}
                          className="flex items-center justify-between rounded-lg bg-slate-700/20 p-2"
                        >
                          <div className="flex items-center gap-2">
                            <Server className="h-4 w-4 text-cyan-400" />
                            <span className="text-sm text-foreground">{deployment.appName}</span>
                          </div>
                          <StatusBadge
                            status={deployment.status as any}
                            label={deployment.status}
                            size="sm"
                          />
                        </div>
                      ))}
                      {deployments.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                          +{deployments.length - 3} more
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Detailed Deployments */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">All Deployments</h2>
        {NAMESPACES.map((namespace, idx) => {
          const { data: deployments = [] } = deploymentQueries[idx];
          if (deployments.length === 0) return null;

          return (
            <Card key={namespace} className="border-border bg-card">
              <CardHeader>
                <CardTitle className="capitalize">{namespace} Deployments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {deployments.map((deployment) => (
                    <div
                      key={deployment.id}
                      className="flex items-center justify-between rounded-lg border border-border bg-slate-700/20 p-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/20 ring-1 ring-cyan-500/50">
                            <Server className="h-5 w-5 text-cyan-400" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{deployment.appName}</p>
                            <p className="text-xs text-muted-foreground">{deployment.imageTag}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm font-medium text-foreground">
                            {deployment.readyReplicas}/{deployment.replicas}
                          </p>
                          <p className="text-xs text-muted-foreground">replicas</p>
                        </div>
                        <div className="flex flex-col gap-2">
                          <StatusBadge
                            status={deployment.status as any}
                            label={deployment.status}
                            size="sm"
                          />
                          <StatusBadge
                            status={
                              deployment.argoCdSyncStatus === "synced" ? "success" : "warning"
                            }
                            label={deployment.argoCdSyncStatus}
                            size="sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
