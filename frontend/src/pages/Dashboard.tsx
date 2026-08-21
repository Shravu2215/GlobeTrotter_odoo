import Layout from "@/components/Layout";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Users, Activity, CheckCircle2, Clock, Zap, Plug, ShieldCheck } from "lucide-react";

const stats = [
  { label: "Team Members", value: "6", icon: Users, trend: "+2 this week" },
  { label: "Active Tasks", value: "0", icon: Activity, trend: "Awaiting problem statement" },
  { label: "Completed", value: "0", icon: CheckCircle2, trend: "No tasks yet" },
  { label: "Hours to Deadline", value: "—", icon: Clock, trend: "Set once PS is locked" },
];

const setupChecks = [
  { label: "Authentication (JWT + bcrypt)", done: true },
  { label: "API client wired up", done: true },
  { label: "Socket.IO client ready", done: true },
  { label: "Database schema (Prisma)", done: false },
  { label: "Problem statement locked", done: false },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <Layout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-1">Welcome back, {user?.name?.split(" ")[0]}</h1>
        <p className="text-muted text-sm">Here's what's happening with your team right now.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, trend }) => (
          <Card key={label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-muted">{label}</span>
                <div className="w-8 h-8 rounded-lg bg-accent/15 text-accent flex items-center justify-center">
                  <Icon size={16} />
                </div>
              </div>
              <p className="text-2xl font-semibold font-display">{value}</p>
              <p className="text-xs text-muted mt-1">{trend}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Boilerplate health check for the stack</CardDescription>
            </div>
            <Badge variant="success">All systems ready</Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {setupChecks.map(({ label, done }) => (
              <div key={label} className="flex items-center justify-between px-4 py-3 bg-surfaceAlt rounded-xl">
                <span className="text-sm">{label}</span>
                <Badge variant={done ? "success" : "warning"}>{done ? "Ready" : "Pending"}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-surfaceAlt rounded-xl text-sm text-left hover:bg-surfaceAlt/70 transition-colors">
              <Zap size={16} className="text-accent" /> Start building a feature
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-surfaceAlt rounded-xl text-sm text-left hover:bg-surfaceAlt/70 transition-colors">
              <Plug size={16} className="text-accent" /> Connect an API endpoint
            </button>
            <button className="w-full flex items-center gap-3 px-4 py-3 bg-surfaceAlt rounded-xl text-sm text-left hover:bg-surfaceAlt/70 transition-colors">
              <ShieldCheck size={16} className="text-accent" /> Review security config
            </button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}