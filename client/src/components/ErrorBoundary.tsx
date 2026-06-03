import React from "react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex h-screen items-center justify-center bg-background">
            <div className="text-center">
              <h2 className="mb-2 text-xl font-bold text-red-400">Something went wrong</h2>
              <p className="mb-4 text-muted-foreground">{this.state.error?.message}</p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="rounded bg-cyan-500 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-600"
              >
                Try again
              </button>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
