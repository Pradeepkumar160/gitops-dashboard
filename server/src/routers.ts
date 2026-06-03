import { COOKIE_NAME } from "../../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies.js";
import { systemRouter } from "./_core/systemRouter.js";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc.js";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  createPipelineRun,
  getPipelineRuns,
  updatePipelineRun,
  getDeploymentsByNamespace,
  createDeployment,
  updateDeployment,
  getHelmReleasesByNamespace,
  createHelmRelease,
  getHelmReleaseHistory,
  getSecretsByNamespace,
  createSecret,
  updateSecret,
  getMetricsByNamespaceAndType,
  createMetric,
  getAuditLogs,
  createAuditLog,
} from "./db.js";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user?.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ PIPELINE RUNS ============
  pipeline: router({
    // Get all pipeline runs with optional filters
    getRuns: publicProcedure
      .input(
        z.object({
          environment: z.enum(["dev", "staging", "production"]).optional(),
          status: z.string().optional(),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
          limit: z.number().default(50),
        })
      )
      .query(({ input }) =>
        getPipelineRuns({
          environment: input.environment,
          status: input.status,
          startDate: input.startDate,
          endDate: input.endDate,
          limit: input.limit,
        })
      ),

    // Admin: Trigger a new pipeline run
    triggerRun: adminProcedure
      .input(
        z.object({
          commitSha: z.string(),
          commitMessage: z.string(),
          branch: z.string().default("main"),
          environment: z.enum(["dev", "staging", "production"]).default("staging"),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const run = await createPipelineRun({
          commitSha: input.commitSha,
          commitMessage: input.commitMessage,
          branch: input.branch,
          environment: input.environment,
          status: "pending",
          buildStageStatus: "pending",
          testStageStatus: "pending",
          dockerizeStageStatus: "pending",
          pushStageStatus: "pending",
          deployStageStatus: "pending",
          triggeredBy: ctx.user?.email || "admin",
        });

        // Log audit event
        await createAuditLog({
          userId: ctx.user?.id,
          action: "PIPELINE_TRIGGERED",
          resourceType: "pipeline_run",
          resourceId: run.runId,
          details: { environment: input.environment, branch: input.branch } as any,
        });

        return run;
      }),

    // Admin: Update pipeline run status
    updateRun: adminProcedure
      .input(
        z.object({
          runId: z.string(),
          status: z.string().optional(),
          buildStageStatus: z.string().optional(),
          testStageStatus: z.string().optional(),
          dockerizeStageStatus: z.string().optional(),
          pushStageStatus: z.string().optional(),
          deployStageStatus: z.string().optional(),
          dockerImage: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const updated = await updatePipelineRun(input.runId, {
          status: input.status as any,
          buildStageStatus: input.buildStageStatus as any,
          testStageStatus: input.testStageStatus as any,
          dockerizeStageStatus: input.dockerizeStageStatus as any,
          pushStageStatus: input.pushStageStatus as any,
          deployStageStatus: input.deployStageStatus as any,
          dockerImage: input.dockerImage,
          completedAt:
            input.status === "success" || input.status === "failed" ? new Date() : undefined,
        });

        await createAuditLog({
          userId: ctx.user?.id,
          action: "PIPELINE_UPDATED",
          resourceType: "pipeline_run",
          resourceId: input.runId,
          details: { newStatus: input.status } as any,
        });

        return updated;
      }),
  }),

  // ============ DEPLOYMENTS ============
  deployment: router({
    // Get deployments by namespace
    getByNamespace: publicProcedure
      .input(z.object({ namespace: z.enum(["dev", "staging", "production"]) }))
      .query(({ input }) => getDeploymentsByNamespace(input.namespace as any)),

    // Admin: Create deployment
    create: adminProcedure
      .input(
        z.object({
          namespace: z.enum(["dev", "staging", "production"]),
          appName: z.string(),
          imageTag: z.string(),
          replicas: z.number().default(1),
          helmRelease: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const deployment = await createDeployment({
          namespace: input.namespace,
          appName: input.appName,
          imageTag: input.imageTag,
          replicas: input.replicas,
          readyReplicas: 0,
          helmRelease: input.helmRelease,
          status: "pending",
          argoCdSyncStatus: "syncing",
        });

        await createAuditLog({
          userId: ctx.user?.id,
          action: "DEPLOYMENT_CREATED",
          resourceType: "deployment",
          resourceId: deployment.deploymentId,
          details: { namespace: input.namespace, appName: input.appName } as any,
        });

        return deployment;
      }),

    // Admin: Update deployment status
    updateStatus: adminProcedure
      .input(
        z.object({
          deploymentId: z.string(),
          status: z.enum(["pending", "running", "healthy", "degraded", "failed"]),
          readyReplicas: z.number().optional(),
          argoCdSyncStatus: z.enum(["synced", "out-of-sync", "syncing", "unknown"]).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const updated = await updateDeployment(input.deploymentId, {
          status: input.status,
          readyReplicas: input.readyReplicas,
          argoCdSyncStatus: input.argoCdSyncStatus,
          lastSyncTime: new Date(),
        });

        await createAuditLog({
          userId: ctx.user?.id,
          action: "DEPLOYMENT_UPDATED",
          resourceType: "deployment",
          resourceId: input.deploymentId,
          details: { newStatus: input.status } as any,
        });

        return updated;
      }),
  }),

  // ============ HELM RELEASES ============
  helm: router({
    // Get Helm releases by namespace
    getByNamespace: publicProcedure
      .input(z.object({ namespace: z.enum(["dev", "staging", "production"]) }))
      .query(({ input }) => getHelmReleasesByNamespace(input.namespace as any)),

    // Get release history for a chart
    getHistory: publicProcedure
      .input(
        z.object({
          chartName: z.string(),
          namespace: z.enum(["dev", "staging", "production"]),
        })
      )
      .query(({ input }) => getHelmReleaseHistory(input.chartName, input.namespace as any)),

    // Admin: Create Helm release
    create: adminProcedure
      .input(
        z.object({
          chartName: z.string(),
          chartVersion: z.string(),
          namespace: z.enum(["dev", "staging", "production"]),
          valuesJson: z.record(z.string(), z.any()).optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const release = await createHelmRelease({
          chartName: input.chartName,
          chartVersion: input.chartVersion,
          namespace: input.namespace,
          valuesJson: input.valuesJson,
          status: "deployed",
          revision: 1,
        });

        await createAuditLog({
          userId: ctx.user?.id,
          action: "HELM_RELEASE_CREATED",
          resourceType: "helm_release",
          resourceId: release.releaseId,
          details: { chartName: input.chartName, namespace: input.namespace } as any,
        });

        return release;
      }),
  }),

  // ============ SECRETS ============
  secret: router({
    // Get secrets by namespace (metadata only, never raw values)
    getByNamespace: publicProcedure
      .input(z.object({ namespace: z.enum(["dev", "staging", "production"]) }))
      .query(({ input }) => getSecretsByNamespace(input.namespace as any)),

    // Admin: Create secret (metadata only)
    create: adminProcedure
      .input(
        z.object({
          secretName: z.string(),
          namespace: z.enum(["dev", "staging", "production"]),
          secretType: z.enum(["database", "api-key", "certificate", "oauth", "custom"]),
          keyFingerprint: z.string().optional(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        const secret = await createSecret({
          secretName: input.secretName,
          namespace: input.namespace,
          secretType: input.secretType,
          isSealed: true,
          encryptionStatus: "encrypted",
          keyFingerprint: input.keyFingerprint,
        });

        await createAuditLog({
          userId: ctx.user?.id,
          action: "SECRET_CREATED",
          resourceType: "secret",
          resourceId: secret.secretId,
          details: { secretName: input.secretName, namespace: input.namespace } as any,
        });

        return secret;
      }),

    // Admin: Rotate secret (update metadata)
    rotate: adminProcedure
      .input(z.object({ secretId: z.string() }))
      .mutation(async ({ input, ctx }) => {
        const updated = await updateSecret(input.secretId, {
          rotatedAt: new Date(),
          encryptionStatus: "encrypted",
        });

        await createAuditLog({
          userId: ctx.user?.id,
          action: "SECRET_ROTATED",
          resourceType: "secret",
          resourceId: input.secretId,
          details: {} as any,
        });

        return updated;
      }),
  }),

  // ============ METRICS ============
  metric: router({
    // Get metrics by namespace and type
    getByNamespaceAndType: publicProcedure
      .input(
        z.object({
          namespace: z.enum(["dev", "staging", "production"]),
          metricType: z.enum(["cpu_usage", "memory_usage", "request_rate", "error_rate", "latency"]),
          limit: z.number().int().default(100),
        })
      )
      .query(({ input }) =>
        getMetricsByNamespaceAndType(input.namespace, input.metricType, input.limit)
      ),

    // Admin: Record metric data
    record: adminProcedure
      .input(
        z.object({
          namespace: z.enum(["dev", "staging", "production"]),
          podName: z.string(),
          metricType: z.enum(["cpu_usage", "memory_usage", "request_rate", "error_rate", "latency"]),
          value: z.number(),
          unit: z.string().default("percent").optional(),
        })
      )
      .mutation(({ input }) =>
        createMetric({
          namespace: input.namespace,
          podName: input.podName,
          metricType: input.metricType,
          value: input.value as any,
          unit: input.unit || "percent",
        })
      ),
  }),

  // ============ AUDIT LOGS ============
  audit: router({
    // Get audit logs (admin only)
    getLogs: adminProcedure
      .input(z.object({ limit: z.number().int().default(100) }).optional())
      .query(({ input }) => getAuditLogs(input?.limit || 100)),
  }),
});

export type AppRouter = typeof appRouter;
