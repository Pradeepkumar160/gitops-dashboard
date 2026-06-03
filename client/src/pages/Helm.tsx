import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Box, GitBranch } from "lucide-react";
import { trpc } from "@/lib/trpc";

const NAMESPACES = ["dev", "staging", "production"] as const;

export default function Helm() {
  const releaseQueries = NAMESPACES.map((ns) =>
    trpc.helm.getByNamespace.useQuery({ namespace: ns })
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Helm Charts</h1>
        <p className="mt-2 text-muted-foreground">
          Helm release management and version tracking
        </p>
      </div>

      {/* Releases by Namespace */}
      {NAMESPACES.map((namespace, idx) => {
        const { data: releases = [] } = releaseQueries[idx];

        return (
          <div key={namespace} className="space-y-4">
            <h2 className="text-2xl font-bold capitalize text-foreground">{namespace}</h2>
            {releases.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {releases.map((release) => (
                  <Card
                    key={release.id}
                    className="border-border bg-card hover:border-purple-500/50 transition-all duration-200"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="flex items-center gap-2">
                            <Box className="h-5 w-5 text-purple-400" />
                            {release.chartName}
                          </CardTitle>
                          <p className="mt-1 text-sm text-muted-foreground">
                            v{release.chartVersion}
                          </p>
                        </div>
                        <StatusBadge
                          status={release.status === "deployed" ? "success" : "warning"}
                          label={release.status}
                          size="sm"
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Release Info */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-slate-700/30 p-3">
                          <p className="text-xs text-muted-foreground">Revision</p>
                          <p className="text-2xl font-bold text-foreground">{release.revision}</p>
                        </div>
                        <div className="rounded-lg bg-slate-700/30 p-3">
                          <p className="text-xs text-muted-foreground">Status</p>
                          <p className="text-sm font-semibold text-cyan-400">{release.status}</p>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="space-y-2 border-t border-border pt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Created</span>
                          <span className="text-sm text-foreground">
                            {new Date(release.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Updated</span>
                          <span className="text-sm text-foreground">
                            {new Date(release.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Values Preview */}
                      {release.valuesJson ? (
                        <div className="space-y-2 border-t border-border pt-3">
                          <p className="text-xs font-medium text-muted-foreground">VALUES</p>
                          <div className="max-h-32 overflow-y-auto rounded-lg bg-slate-900/50 p-2">
                            <pre className="text-xs text-slate-300">
                              {JSON.stringify(release.valuesJson as any, null, 2).slice(0, 200)}
                              {JSON.stringify(release.valuesJson as any, null, 2).length > 200 && "..."}
                            </pre>
                          </div>
                        </div>
                      ) : null}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-border bg-card">
                <CardContent className="flex h-32 items-center justify-center">
                  <p className="text-muted-foreground">No Helm releases in {namespace}</p>
                </CardContent>
              </Card>
            )}
          </div>
        );
      })}

      {/* Release History Example */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Release History</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select a chart to view its complete release history and rollback options.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
