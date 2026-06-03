import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  decimal,
  json,
  boolean,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Pipeline Runs - tracks CI/CD workflow executions
 * Stores GitHub Actions workflow run history with stage progression
 */
export const pipelineRuns = mysqlTable("pipeline_runs", {
  id: int("id").autoincrement().primaryKey(),
  runId: varchar("runId", { length: 64 }).notNull().unique(), // GitHub Actions run ID
  commitSha: varchar("commitSha", { length: 64 }).notNull(),
  commitMessage: text("commitMessage"),
  branch: varchar("branch", { length: 255 }).default("main").notNull(),
  status: mysqlEnum("status", [
    "pending",
    "building",
    "testing",
    "dockerizing",
    "pushing",
    "deploying",
    "success",
    "failed",
    "cancelled",
  ])
    .default("pending")
    .notNull(),
  environment: mysqlEnum("environment", ["dev", "staging", "production"])
    .default("staging")
    .notNull(),
  // Stage progression tracking
  buildStageStatus: mysqlEnum("buildStageStatus", ["pending", "running", "success", "failed"])
    .default("pending")
    .notNull(),
  testStageStatus: mysqlEnum("testStageStatus", ["pending", "running", "success", "failed"])
    .default("pending")
    .notNull(),
  dockerizeStageStatus: mysqlEnum("dockerizeStageStatus", [
    "pending",
    "running",
    "success",
    "failed",
  ])
    .default("pending")
    .notNull(),
  pushStageStatus: mysqlEnum("pushStageStatus", ["pending", "running", "success", "failed"])
    .default("pending")
    .notNull(),
  deployStageStatus: mysqlEnum("deployStageStatus", ["pending", "running", "success", "failed"])
    .default("pending")
    .notNull(),
  // Metadata
  dockerImage: varchar("dockerImage", { length: 255 }),
  duration: int("duration"), // milliseconds
  triggeredBy: varchar("triggeredBy", { length: 255 }), // user or "auto"
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type PipelineRun = typeof pipelineRuns.$inferSelect;
export type InsertPipelineRun = typeof pipelineRuns.$inferInsert;

/**
 * Deployments - tracks Kubernetes deployments per environment
 * Linked to pipeline runs for traceability
 */
export const deployments = mysqlTable("deployments", {
  id: int("id").autoincrement().primaryKey(),
  deploymentId: varchar("deploymentId", { length: 64 }).notNull().unique(),
  pipelineRunId: int("pipelineRunId").references(() => pipelineRuns.id),
  namespace: mysqlEnum("namespace", ["dev", "staging", "production"]).notNull(),
  appName: varchar("appName", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["pending", "running", "healthy", "degraded", "failed"])
    .default("pending")
    .notNull(),
  replicas: int("replicas").default(1).notNull(),
  readyReplicas: int("readyReplicas").default(0).notNull(),
  imageTag: varchar("imageTag", { length: 255 }),
  helmRelease: varchar("helmRelease", { length: 255 }),
  argoCdSyncStatus: mysqlEnum("argoCdSyncStatus", ["synced", "out-of-sync", "syncing", "unknown"])
    .default("unknown")
    .notNull(),
  lastSyncTime: timestamp("lastSyncTime"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Deployment = typeof deployments.$inferSelect;
export type InsertDeployment = typeof deployments.$inferInsert;

/**
 * Helm Releases - tracks Helm chart releases per environment
 * Stores chart versions and release history
 */
export const helmReleases = mysqlTable("helm_releases", {
  id: int("id").autoincrement().primaryKey(),
  releaseId: varchar("releaseId", { length: 64 }).notNull().unique(),
  chartName: varchar("chartName", { length: 255 }).notNull(),
  chartVersion: varchar("chartVersion", { length: 64 }).notNull(),
  namespace: mysqlEnum("namespace", ["dev", "staging", "production"]).notNull(),
  status: mysqlEnum("status", ["deployed", "superseded", "failed", "pending-install"])
    .default("deployed")
    .notNull(),
  valuesJson: json("valuesJson"), // Helm values as JSON
  revision: int("revision").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type HelmRelease = typeof helmReleases.$inferSelect;
export type InsertHelmRelease = typeof helmReleases.$inferInsert;

/**
 * Secrets - tracks sealed secrets metadata (NOT raw values)
 * Raw values are never stored; only metadata and encryption status
 */
export const secrets = mysqlTable("secrets", {
  id: int("id").autoincrement().primaryKey(),
  secretId: varchar("secretId", { length: 64 }).notNull().unique(),
  secretName: varchar("secretName", { length: 255 }).notNull(),
  namespace: mysqlEnum("namespace", ["dev", "staging", "production"]).notNull(),
  secretType: mysqlEnum("secretType", ["database", "api-key", "certificate", "oauth", "custom"])
    .default("custom")
    .notNull(),
  isSealed: boolean("isSealed").default(true).notNull(), // Sealed Secrets status
  encryptionStatus: mysqlEnum("encryptionStatus", ["encrypted", "decrypted", "unknown"])
    .default("encrypted")
    .notNull(),
  keyFingerprint: varchar("keyFingerprint", { length: 255 }), // Sealed Secrets key fingerprint
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  rotatedAt: timestamp("rotatedAt"),
});

export type Secret = typeof secrets.$inferSelect;
export type InsertSecret = typeof secrets.$inferInsert;

/**
 * Metrics - time-series metrics for monitoring
 * Stores CPU, memory, request rates, and error rates
 */
export const metrics = mysqlTable("metrics", {
  id: int("id").autoincrement().primaryKey(),
  metricId: varchar("metricId", { length: 64 }).notNull().unique(),
  namespace: mysqlEnum("namespace", ["dev", "staging", "production"]).notNull(),
  podName: varchar("podName", { length: 255 }).notNull(),
  metricType: mysqlEnum("metricType", [
    "cpu_usage",
    "memory_usage",
    "request_rate",
    "error_rate",
    "latency",
  ]).notNull(),
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  unit: varchar("unit", { length: 32 }).default("percent").notNull(), // percent, bytes, requests/sec, ms
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export type Metric = typeof metrics.$inferSelect;
export type InsertMetric = typeof metrics.$inferInsert;

/**
 * Audit Logs - tracks admin actions for compliance
 * Records pipeline triggers, secret access, deployments, etc.
 */
export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  logId: varchar("logId", { length: 64 }).notNull().unique(),
  userId: int("userId").references(() => users.id),
  action: varchar("action", { length: 255 }).notNull(),
  resourceType: varchar("resourceType", { length: 64 }).notNull(),
  resourceId: varchar("resourceId", { length: 255 }),
  details: json("details"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
