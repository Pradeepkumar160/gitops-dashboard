import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { AnimatedIndicator } from "@/components/AnimatedIndicator";
import { ArrowRight, Play } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

const PIPELINE_STAGES = ["Build", "Test", "Dockerize", "Push", "Deploy"];

export default function Pipeline() {
  const { user } = useAuth();
  const { data: pipelineRuns = [] } = trpc.pipeline.getRuns.useQuery({
    limit: 20,
  });

  const triggerMutation = trpc.pipeline.triggerRun.useMutation();
  const updateMutation = trpc.pipeline.updateRun.useMutation();

  const handleTriggerPipeline = async () => {
    try {
      await triggerMutation.mutateAsync({
        commitSha: "abc123def456",
        commitMessage: "feat: Add new monitoring dashboard",
        branch: "main",
        environment: "staging",
      });
    } catch (error) {
      console.error("Failed to trigger pipeline:", error);
    }
  };

  const getStageStatus = (run: any, stage: string) => {
    const stageKey = `${stage.toLowerCase()}StageStatus`;
    return run[stageKey] || "pending";
  };

  const getStageIndex = (status: string) => {
    const stages = ["pending", "running", "success", "failed"];
    return stages.indexOf(status);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground">CI/CD Pipeline</h1>
          <p className="mt-2 text-muted-foreground">
            GitHub Actions workflow execution and deployment tracking
          </p>
        </div>
        {user?.role === "admin" && (
          <Button
            onClick={handleTriggerPipeline}
            disabled={triggerMutation.isPending}
            className="gap-2 bg-cyan-600 hover:bg-cyan-700"
          >
            <Play className="h-4 w-4" />
            {triggerMutation.isPending ? "Triggering..." : "Trigger Pipeline"}
          </Button>
        )}
      </div>

      {/* Pipeline Stage Flow Diagram */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Pipeline Stages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4 overflow-x-auto pb-4">
            {PIPELINE_STAGES.map((stage, index) => (
              <div key={stage} className="flex items-center gap-4">
                <div className="flex flex-col items-center gap-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 ring-1 ring-cyan-500/50">
                    <span className="text-sm font-bold text-cyan-400">{index + 1}</span>
                  </div>
                  <span className="text-sm font-medium text-foreground">{stage}</span>
                </div>
                {index < PIPELINE_STAGES.length - 1 && (
                  <ArrowRight className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Pipeline Runs */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Recent Runs</h2>
        {pipelineRuns.length > 0 ? (
          pipelineRuns.map((run) => (
            <Card key={run.id} className="border-border bg-card hover:border-cyan-500/50 transition-all duration-200">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-lg">{run.branch}</CardTitle>
                      <StatusBadge status={run.status as any} label={run.status} size="sm" />
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{run.commitMessage}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Commit: {run.commitSha.slice(0, 8)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {new Date(run.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Stage Progress */}
                  <div className="grid gap-3 sm:grid-cols-5">
                    {PIPELINE_STAGES.map((stage) => {
                      const stageStatus = getStageStatus(run, stage);
                      return (
                        <div key={stage} className="flex flex-col items-center gap-2">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                              stageStatus === "success"
                                ? "bg-green-500/20 ring-1 ring-green-500/50"
                                : stageStatus === "failed"
                                  ? "bg-red-500/20 ring-1 ring-red-500/50"
                                  : stageStatus === "running"
                                    ? "bg-cyan-500/20 ring-1 ring-cyan-500/50 animate-pulse"
                                    : "bg-slate-500/20 ring-1 ring-slate-500/50"
                            }`}
                          >
                            {stageStatus === "success" && (
                              <span className="text-lg text-green-400">✓</span>
                            )}
                            {stageStatus === "failed" && (
                              <span className="text-lg text-red-400">✕</span>
                            )}
                            {stageStatus === "running" && (
                              <span className="inline-block h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                            )}
                          </div>
                          <span className="text-xs font-medium text-muted-foreground">{stage}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Environment and Duration */}
                  <div className="flex flex-wrap items-center gap-4 border-t border-border pt-4">
                    <div>
                      <span className="text-xs text-muted-foreground">Environment</span>
                      <p className="font-medium text-foreground">{run.environment}</p>
                    </div>
                    {run.dockerImage && (
                      <div>
                        <span className="text-xs text-muted-foreground">Docker Image</span>
                        <p className="font-medium text-foreground text-sm">{run.dockerImage}</p>
                      </div>
                    )}
                    {run.duration && (
                      <div>
                        <span className="text-xs text-muted-foreground">Duration</span>
                        <p className="font-medium text-foreground">
                          {(run.duration / 1000).toFixed(1)}s
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-border bg-card">
            <CardContent className="flex h-32 items-center justify-center">
              <p className="text-muted-foreground">No pipeline runs yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
