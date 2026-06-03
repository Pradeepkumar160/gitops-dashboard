import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarContent, SidebarHeader, SidebarTrigger } from "@/components/ui/sidebar";
import {
  Activity,
  BarChart3,
  Box,
  Code2,
  Gauge,
  GitBranch,
  Lock,
  LogOut,
  Menu,
  Settings,
  Zap,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { AnimatedIndicator } from "./AnimatedIndicator";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
  badge?: string;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  {
    href: "/",
    label: "Dashboard",
    icon: <Gauge className="h-5 w-5" />,
  },
  {
    href: "/pipeline",
    label: "CI/CD Pipeline",
    icon: <GitBranch className="h-5 w-5" />,
  },
  {
    href: "/environments",
    label: "Environments",
    icon: <Activity className="h-5 w-5" />,
  },
  {
    href: "/helm",
    label: "Helm Charts",
    icon: <Box className="h-5 w-5" />,
  },
  {
    href: "/secrets",
    label: "Secrets",
    icon: <Lock className="h-5 w-5" />,
  },
  {
    href: "/monitoring",
    label: "Monitoring",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    href: "/config",
    label: "Config Viewer",
    icon: <Code2 className="h-5 w-5" />,
  },
];

const adminItems: NavItem[] = [
  {
    href: "/history",
    label: "Pipeline History",
    icon: <Zap className="h-5 w-5" />,
    adminOnly: true,
  },
  {
    href: "/admin",
    label: "Admin",
    icon: <Settings className="h-5 w-5" />,
    adminOnly: true,
  },
];

interface EnhancedDashboardLayoutProps {
  children: React.ReactNode;
}

export function EnhancedDashboardLayout({ children }: EnhancedDashboardLayoutProps) {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const [location] = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="mb-4 text-3xl font-bold gradient-text">GitOps Dashboard</h1>
          <p className="mb-6 text-muted-foreground">Sign in to continue</p>
          <Button onClick={() => window.location.reload()} variant="default">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const visibleNavItems = navItems.concat(
    user?.role === "admin" ? adminItems : []
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden w-64 border-r border-border bg-card md:flex md:flex-col">
        {/* Header */}
        <div className="border-b border-border px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-purple-500">
              <Gauge className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">GitOps</h1>
              <p className="text-xs text-muted-foreground">DevOps Platform</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {visibleNavItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <a
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/50"
                        : "text-muted-foreground hover:bg-slate-700/50 hover:text-foreground"
                    )}
                  >
                    {item.icon}
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-xs text-cyan-400">
                        {item.badge}
                      </span>
                    )}
                  </a>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* User Section */}
        <div className="border-t border-border px-3 py-4">
          <div className="mb-4 rounded-lg bg-slate-700/30 p-3">
            <p className="text-xs text-muted-foreground">Logged in as</p>
            <p className="text-sm font-medium text-foreground">{user?.name || user?.email}</p>
            {user?.role === "admin" && (
              <div className="mt-2 flex items-center gap-2">
                <AnimatedIndicator type="active" size="sm" />
                <span className="text-xs text-cyan-400">Admin</span>
              </div>
            )}
          </div>
          <Button
            onClick={logout}
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="flex items-center justify-between border-b border-border bg-card px-4 py-4 md:hidden">
          <div className="flex items-center gap-2">
            <Gauge className="h-6 w-6 text-cyan-400" />
            <h1 className="text-lg font-bold text-foreground">GitOps</h1>
          </div>
          <SidebarTrigger>
            <Menu className="h-6 w-6" />
          </SidebarTrigger>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-4 py-6 sm:px-6 lg:px-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
