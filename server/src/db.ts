import { eq, desc, and, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  type InsertUser,
  users,
  pipelineRuns,
  deployments,
  helmReleases,
  secrets,
  metrics,
  auditLogs,
  type PipelineRun,
  type Deployment,
  type HelmRelease,
  type Secret,
  type Metric,
  type AuditLog,
} from "../../drizzle/schema.js";
import { ENV } from "./_core/env.js";
import { nanoid } from "nanoid";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ USER OPERATIONS ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.openId, openId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ PIPELINE RUN OPERATIONS ============

export async function createPipelineRun(
  data: Omit<InsertPipelineRun, "id" | "runId">
): Promise<PipelineRun> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const runId = nanoid();
  const result = await db.insert(pipelineRuns).values({
    ...data,
    runId,
  } as any);

  const created = await db
    .select()
    .from(pipelineRuns)
    .where(eq(pipelineRuns.runId, runId))
    .limit(1);

  return created[0]!;
}

export async function getPipelineRuns(filters?: {
  environment?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}): Promise<PipelineRun[]> {
  const db = await getDb();
  if (!db) return [];

  const conditions = [];
  if (filters?.environment) {
    conditions.push(eq(pipelineRuns.environment, filters.environment as any));
  }
  if (filters?.status) {
    conditions.push(eq(pipelineRuns.status, filters.status as any));
  }
  if (filters?.startDate) {
    conditions.push(gte(pipelineRuns.createdAt, filters.startDate));
  }
  if (filters?.endDate) {
    conditions.push(lte(pipelineRuns.createdAt, filters.endDate));
  }

  const query = db
    .select()
    .from(pipelineRuns)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(pipelineRuns.createdAt))
    .limit(filters?.limit || 50);

  return query;
}

export async function updatePipelineRun(
  runId: string,
  data: Partial<Omit<PipelineRun, "id" | "runId">>
): Promise<PipelineRun> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(pipelineRuns)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(pipelineRuns.runId, runId));

  const updated = await db
    .select()
    .from(pipelineRuns)
    .where(eq(pipelineRuns.runId, runId))
    .limit(1);

  return updated[0]!;
}

// ============ DEPLOYMENT OPERATIONS ============

export async function createDeployment(
  data: Omit<InsertDeployment, "id" | "deploymentId">
): Promise<Deployment> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const deploymentId = nanoid();
  const result = await db.insert(deployments).values({
    ...data,
    deploymentId,
  } as any);

  const created = await db
    .select()
    .from(deployments)
    .where(eq(deployments.deploymentId, deploymentId))
    .limit(1);

  return created[0]!;
}

export async function getDeploymentsByNamespace(namespace: string): Promise<Deployment[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(deployments)
    .where(eq(deployments.namespace, namespace as any))
    .orderBy(desc(deployments.updatedAt));
}

export async function updateDeployment(
  deploymentId: string,
  data: Partial<Omit<Deployment, "id" | "deploymentId">>
): Promise<Deployment> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(deployments)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(deployments.deploymentId, deploymentId));

  const updated = await db
    .select()
    .from(deployments)
    .where(eq(deployments.deploymentId, deploymentId))
    .limit(1);

  return updated[0]!;
}

// ============ HELM RELEASE OPERATIONS ============

export async function createHelmRelease(
  data: Omit<InsertHelmRelease, "id" | "releaseId">
): Promise<HelmRelease> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const releaseId = nanoid();
  const result = await db.insert(helmReleases).values({
    ...data,
    releaseId,
  } as any);

  const created = await db
    .select()
    .from(helmReleases)
    .where(eq(helmReleases.releaseId, releaseId))
    .limit(1);

  return created[0]!;
}

export async function getHelmReleasesByNamespace(namespace: string): Promise<HelmRelease[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(helmReleases)
    .where(eq(helmReleases.namespace, namespace as any))
    .orderBy(desc(helmReleases.updatedAt));
}

export async function getHelmReleaseHistory(
  chartName: string,
  namespace: string
): Promise<HelmRelease[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(helmReleases)
    .where(
      and(
        eq(helmReleases.chartName, chartName),
        eq(helmReleases.namespace, namespace as any)
      )
    )
    .orderBy(desc(helmReleases.revision));
}

// ============ SECRET OPERATIONS ============

export async function createSecret(
  data: Omit<InsertSecret, "id" | "secretId">
): Promise<Secret> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const secretId = nanoid();
  const result = await db.insert(secrets).values({
    ...data,
    secretId,
  } as any);

  const created = await db
    .select()
    .from(secrets)
    .where(eq(secrets.secretId, secretId))
    .limit(1);

  return created[0]!;
}

export async function getSecretsByNamespace(namespace: string): Promise<Secret[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(secrets)
    .where(eq(secrets.namespace, namespace as any))
    .orderBy(desc(secrets.updatedAt));
}

export async function updateSecret(
  secretId: string,
  data: Partial<Omit<Secret, "id" | "secretId">>
): Promise<Secret> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(secrets)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(secrets.secretId, secretId));

  const updated = await db
    .select()
    .from(secrets)
    .where(eq(secrets.secretId, secretId))
    .limit(1);

  return updated[0]!;
}

// ============ METRICS OPERATIONS ============

export async function createMetric(data: Omit<InsertMetric, "id" | "metricId">): Promise<Metric> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const metricId = nanoid();
  const result = await db.insert(metrics).values({
    ...data,
    metricId,
  } as any);

  const created = await db
    .select()
    .from(metrics)
    .where(eq(metrics.metricId, metricId))
    .limit(1);

  return created[0]!;
}

export async function getMetricsByNamespaceAndType(
  namespace: string,
  metricType: string,
  limit = 100
): Promise<Metric[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(metrics)
    .where(
      and(
        eq(metrics.namespace, namespace as any),
        eq(metrics.metricType, metricType as any)
      )
    )
    .orderBy(desc(metrics.timestamp))
    .limit(limit);
}

// ============ AUDIT LOG OPERATIONS ============

export async function createAuditLog(
  data: Omit<InsertAuditLog, "id" | "logId">
): Promise<AuditLog> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const logId = nanoid();
  const result = await db.insert(auditLogs).values({
    ...data,
    logId,
  } as any);

  const created = await db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.logId, logId))
    .limit(1);

  return created[0]!;
}

export async function getAuditLogs(limit = 100): Promise<AuditLog[]> {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}

// Type exports for convenience
export type InsertPipelineRun = typeof pipelineRuns.$inferInsert;
export type InsertDeployment = typeof deployments.$inferInsert;
export type InsertHelmRelease = typeof helmReleases.$inferInsert;
export type InsertSecret = typeof secrets.$inferInsert;
export type InsertMetric = typeof metrics.$inferInsert;
export type InsertAuditLog = typeof auditLogs.$inferInsert;
