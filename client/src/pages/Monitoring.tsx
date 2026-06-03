import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Zap } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { trpc } from "@/lib/trpc";

const NAMESPACES = ["dev", "staging", "production"] as const;

// Mock data for demonstration
const generateMockMetrics = (type: string) => {
  const data = [];
  for (let i = 0; i < 12; i++) {
    data.push({
      time: `${i}:00`,
      value: Math.floor(Math.random() * 100),
    });
  }
  return data;
};

export default function Monitoring() {
  const metricQueries = NAMESPACES.flatMap((ns) => [
    trpc.metric.getByNamespaceAndType.useQuery({
      namespace: ns,
      metricType: "cpu_usage",
      limit: 100,
    }),
    trpc.metric.getByNamespaceAndType.useQuery({
      namespace: ns,
      metricType: "memory_usage",
      limit: 100,
    }),
    trpc.metric.getByNamespaceAndType.useQuery({
      namespace: ns,
      metricType: "request_rate",
      limit: 100,
    }),
    trpc.metric.getByNamespaceAndType.useQuery({
      namespace: ns,
      metricType: "error_rate",
      limit: 100,
    }),
  ]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground">Monitoring</h1>
        <p className="mt-2 text-muted-foreground">
          Real-time metrics and performance monitoring
        </p>
      </div>

      {/* Metrics by Namespace */}
      {NAMESPACES.map((namespace) => (
        <div key={namespace} className="space-y-4">
          <h2 className="text-2xl font-bold capitalize text-foreground">{namespace}</h2>

          {/* CPU and Memory */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* CPU Usage */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-cyan-400" />
                  CPU Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={generateMockMetrics("cpu")}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(71,85,105,0.5)" />
                    <XAxis stroke="rgba(148,163,184,0.5)" />
                    <YAxis stroke="rgba(148,163,184,0.5)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(30,41,59,0.95)",
                        border: "1px solid rgba(0,184,212,0.5)",
                        borderRadius: "0.5rem",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#00b8d4"
                      strokeWidth={2}
                      dot={false}
                      name="CPU %"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Memory Usage */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-400" />
                  Memory Usage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={generateMockMetrics("memory")}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(71,85,105,0.5)" />
                    <XAxis stroke="rgba(148,163,184,0.5)" />
                    <YAxis stroke="rgba(148,163,184,0.5)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(30,41,59,0.95)",
                        border: "1px solid rgba(168,85,247,0.5)",
                        borderRadius: "0.5rem",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="value" fill="#a855f7" name="Memory %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Request Rate and Error Rate */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Request Rate */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-green-400" />
                  Request Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={generateMockMetrics("requests")}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(71,85,105,0.5)" />
                    <XAxis stroke="rgba(148,163,184,0.5)" />
                    <YAxis stroke="rgba(148,163,184,0.5)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(30,41,59,0.95)",
                        border: "1px solid rgba(34,197,94,0.5)",
                        borderRadius: "0.5rem",
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#22c55e"
                      strokeWidth={2}
                      dot={false}
                      name="Req/s"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Error Rate */}
            <Card className="border-border bg-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-red-400" />
                  Error Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={generateMockMetrics("errors")}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(71,85,105,0.5)" />
                    <XAxis stroke="rgba(148,163,184,0.5)" />
                    <YAxis stroke="rgba(148,163,184,0.5)" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(30,41,59,0.95)",
                        border: "1px solid rgba(239,68,68,0.5)",
                        borderRadius: "0.5rem",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="value" fill="#ef4444" name="Errors %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      ))}

      {/* Alerts */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Active Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No active alerts. All systems operating within normal parameters.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
