import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Code2, Copy } from "lucide-react";
import { useState } from "react";

const SAMPLE_CONFIGS = {
  kubernetes: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: myapp
  namespace: production
spec:
  replicas: 3
  selector:
    matchLabels:
      app: myapp`,

  helm: `replicaCount: 3
image:
  repository: myapp
  tag: v1.0.0
  pullPolicy: IfNotPresent
service:
  type: ClusterIP
  port: 80
  targetPort: 3000`,

  github: `name: Build and Deploy
on:
  push:
    branches:
      - main
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build Docker image
        run: docker build -t myapp:latest .`,
};

export default function ConfigViewer() {
  const [selectedConfig, setSelectedConfig] = useState<keyof typeof SAMPLE_CONFIGS>("kubernetes");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SAMPLE_CONFIGS[selectedConfig]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Config Viewer</h1>
        <p className="mt-2 text-muted-foreground">
          Syntax-highlighted configuration files and manifests
        </p>
      </div>

      {/* Config Selector */}
      <div className="flex flex-wrap gap-2">
        {Object.keys(SAMPLE_CONFIGS).map((key) => (
          <Button
            key={key}
            onClick={() => setSelectedConfig(key as keyof typeof SAMPLE_CONFIGS)}
            variant={selectedConfig === key ? "default" : "outline"}
            className={selectedConfig === key ? "bg-cyan-600 hover:bg-cyan-700" : ""}
          >
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </Button>
        ))}
      </div>

      {/* Code Viewer */}
      <Card className="border-border bg-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5 text-cyan-400" />
            {selectedConfig.charAt(0).toUpperCase() + selectedConfig.slice(1)} Configuration
          </CardTitle>
          <Button
            onClick={handleCopy}
            size="sm"
            variant="outline"
            className="gap-2"
          >
            <Copy className="h-4 w-4" />
            {copied ? "Copied!" : "Copy"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg bg-slate-900/50 p-4">
            <pre className="font-mono text-sm text-slate-300">
              <code>{SAMPLE_CONFIGS[selectedConfig]}</code>
            </pre>
          </div>
        </CardContent>
      </Card>

      {/* Info */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Available Configurations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            <strong>Kubernetes:</strong> Deployment manifests and resource definitions for managing
            applications in Kubernetes clusters.
          </p>
          <p>
            <strong>Helm:</strong> Chart values and configuration files for Helm deployments across
            different environments.
          </p>
          <p>
            <strong>GitHub Actions:</strong> CI/CD workflow definitions for automated build, test,
            and deployment pipelines.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
