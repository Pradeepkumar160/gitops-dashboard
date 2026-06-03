import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 py-20">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-cyan-400">404</h1>
        <h2 className="mt-4 text-2xl font-semibold text-foreground">Page Not Found</h2>
        <p className="mt-2 text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
      </div>
      <Link href="/">
        <a className="rounded-lg bg-cyan-500 px-6 py-2 text-sm font-medium text-white hover:bg-cyan-600 transition-colors">
          Back to Dashboard
        </a>
      </Link>
    </div>
  );
}
