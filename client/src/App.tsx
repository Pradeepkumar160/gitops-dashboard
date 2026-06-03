import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { EnhancedDashboardLayout } from "./components/EnhancedDashboardLayout";
import Home from "./pages/Home";
import Pipeline from "./pages/Pipeline";
import Environments from "./pages/Environments";
import Helm from "./pages/Helm";
import Secrets from "./pages/Secrets";
import Monitoring from "./pages/Monitoring";
import ConfigViewer from "./pages/ConfigViewer";
import PipelineHistory from "./pages/PipelineHistory";
import { trpc } from "./lib/trpc";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";

function Router() {
  return (
    <EnhancedDashboardLayout>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/pipeline"} component={Pipeline} />
        <Route path={"/environments"} component={Environments} />
        <Route path={"/helm"} component={Helm} />
        <Route path={"/secrets"} component={Secrets} />
        <Route path={"/monitoring"} component={Monitoring} />
        <Route path={"/config"} component={ConfigViewer} />
        <Route path={"/history"} component={PipelineHistory} />
        <Route path={"/404"} component={NotFound} />
        <Route component={NotFound} />
      </Switch>
    </EnhancedDashboardLayout>
  );
}

function App() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
      },
    },
  }));

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "/trpc",
        }),
      ],
    })
  );

  return (
    <ErrorBoundary>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider defaultTheme="dark">
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </ErrorBoundary>
  );
}

export default App;
