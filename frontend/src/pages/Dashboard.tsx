import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <Layout>
      <h1 className="text-2xl font-semibold mb-1">Dashboard</h1>
      <p className="text-muted text-sm mb-8">
        Hey {user?.name} 👋 — replace this page once the problem statement is locked.
      </p>
      <div className="bg-surface border border-border rounded-xl p-6">
        <p className="text-sm text-muted">
          Boilerplate is wired up: auth ✅, API client ✅, Socket.io client ready ✅.
          Start building domain screens here.
        </p>
      </div>
    </Layout>
  );
}
