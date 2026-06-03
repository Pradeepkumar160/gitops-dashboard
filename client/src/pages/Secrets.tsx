import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Lock, Plus, RotateCw } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

const NAMESPACES = ["dev", "staging", "production"] as const;

export default function Secrets() {
  const { user } = useAuth();
  const secretQueries = NAMESPACES.map((ns) =>
    trpc.secret.getByNamespace.useQuery({ namespace: ns })
  );

  const rotateMutation = trpc.secret.rotate.useMutation();

  const handleRotateSecret = async (secretId: string) => {
    try {
      await rotateMutation.mutateAsync({ secretId });
    } catch (error) {
      console.error("Failed to rotate secret:", error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header with Warning */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Secrets Management</h1>
        <p className="mt-2 text-muted-foreground">
          Sealed Secrets metadata and encryption status
        </p>
        <div className="mt-4 rounded-lg border border-orange-500/30 bg-orange-500/10 p-4">
          <p className="text-sm text-orange-400">
            ⚠️ Raw secret values are never displayed. Only metadata and encryption status are shown.
          </p>
        </div>
      </div>

      {/* Secrets by Namespace */}
      {NAMESPACES.map((namespace, idx) => {
        const { data: secrets = [] } = secretQueries[idx];

        return (
          <div key={namespace} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold capitalize text-foreground">{namespace}</h2>
              {user?.role === "admin" && (
                <Button size="sm" className="gap-2 bg-cyan-600 hover:bg-cyan-700">
                  <Plus className="h-4 w-4" />
                  Create Secret
                </Button>
              )}
            </div>

            {secrets.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {secrets.map((secret) => (
                  <Card
                    key={secret.id}
                    className="border-border bg-card hover:border-pink-500/50 transition-all duration-200"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Lock className="h-5 w-5 text-pink-400" />
                            <CardTitle className="text-base">{secret.secretName}</CardTitle>
                          </div>
                          <p className="mt-1 text-xs text-muted-foreground capitalize">
                            {secret.secretType}
                          </p>
                        </div>
                        <StatusBadge
                          status={secret.encryptionStatus === "encrypted" ? "success" : "warning"}
                          label={secret.encryptionStatus}
                          size="sm"
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Encryption Status */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-slate-700/30 p-3">
                          <p className="text-xs text-muted-foreground">Sealed</p>
                          <p className="text-sm font-semibold text-foreground">
                            {secret.isSealed ? "Yes" : "No"}
                          </p>
                        </div>
                        <div className="rounded-lg bg-slate-700/30 p-3">
                          <p className="text-xs text-muted-foreground">Encryption</p>
                          <p className="text-sm font-semibold text-cyan-400">
                            {secret.encryptionStatus}
                          </p>
                        </div>
                      </div>

                      {/* Key Fingerprint */}
                      {secret.keyFingerprint && (
                        <div className="space-y-2 border-t border-border pt-3">
                          <p className="text-xs font-medium text-muted-foreground">KEY FINGERPRINT</p>
                          <p className="break-all rounded-lg bg-slate-900/50 p-2 font-mono text-xs text-slate-300">
                            {secret.keyFingerprint}
                          </p>
                        </div>
                      )}

                      {/* Dates */}
                      <div className="space-y-2 border-t border-border pt-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Created</span>
                          <span className="text-sm text-foreground">
                            {new Date(secret.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {secret.rotatedAt && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Last Rotated</span>
                            <span className="text-sm text-foreground">
                              {new Date(secret.rotatedAt).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Admin Actions */}
                      {user?.role === "admin" && (
                        <Button
                          onClick={() => handleRotateSecret(secret.secretId)}
                          disabled={rotateMutation.isPending}
                          variant="outline"
                          size="sm"
                          className="w-full gap-2"
                        >
                          <RotateCw className="h-4 w-4" />
                          {rotateMutation.isPending ? "Rotating..." : "Rotate"}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="border-border bg-card">
                <CardContent className="flex h-32 items-center justify-center">
                  <p className="text-muted-foreground">No secrets in {namespace}</p>
                </CardContent>
              </Card>
            )}
          </div>
        );
      })}

      {/* Security Notice */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-cyan-400" />
            Security Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            This dashboard uses Sealed Secrets for secure secret management. All secrets are
            encrypted at rest and in transit.
          </p>
          <p>
            Raw secret values are never displayed in the UI for security reasons. Only metadata,
            encryption status, and key fingerprints are shown.
          </p>
          <p>
            To access actual secret values, use kubectl or your CI/CD platform's secret
            management interface.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
