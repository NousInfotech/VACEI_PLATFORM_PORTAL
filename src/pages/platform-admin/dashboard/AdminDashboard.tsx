import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  Building2, 
  Users, 
  Settings, 
  PlusCircle, 
  TrendingUp, 
  ArrowRight,
  ShieldCheck,
  LayoutDashboard
} from "lucide-react";
import { Button } from "../../../ui/Button";
import { ShadowCard } from "../../../ui/ShadowCard";
import { Skeleton } from "../../../ui/Skeleton";
import { PageHeader } from "../../common/PageHeader";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const stats = [
    { label: "Total Organizations", value: "24", icon: Building2, color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Active Clients", value: "156", icon: Users, color: "text-purple-600", bg: "bg-purple-50" },
    { label: "Active Engagements", value: "40", icon: ShieldCheck, color: "text-green-600", bg: "bg-green-50" },
    { label: "Service requests", value: "12", icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  const quickActions = [
    { 
      title: "New Organization", 
      description: "Onboard a new entity and its admin", 
      icon: PlusCircle, 
      path: "/dashboard/organizations/create",
      color: "bg-primary"
    },
    { 
      title: "Manage Clients", 
      description: "View and edit platform administrators", 
      icon: Users, 
      path: "/dashboard/clients",
      color: "bg-indigo-600"
    },
    { 
      title: "Global Settings", 
      description: "Configure platform-wide parameters", 
      icon: Settings, 
      path: "/dashboard/settings",
      color: "bg-gray-700"
    }
  ];

  return (
    <div className="space-y-8 mx-auto">
      <PageHeader 
        title="Admin Overview" 
        icon={LayoutDashboard}
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <ShadowCard key={i} className="p-6 flex items-center gap-4 border-none shadow-sm">
              <Skeleton className="h-16 w-16 rounded-2xl shrink-0" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-2/3" />
                <Skeleton className="h-8 w-1/2" />
              </div>
            </ShadowCard>
          ))
        ) : (
          stats.map((stat, index) => (
            <ShadowCard key={index} className="p-6 flex items-center gap-4 hover:translate-y-[-4px] transition-transform cursor-default border-none shadow-sm hover:shadow-md">
              <div className={`p-4 rounded-2xl ${stat.bg} shrink-0`}>
                <stat.icon className={`h-8 w-8 ${stat.color || "text-primary"}`} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
            </ShadowCard>
          ))
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-primary" />
              Quick Actions
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {loading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <ShadowCard key={i} className="p-8 border-none shadow-sm space-y-6">
                  <Skeleton className="w-14 h-14 rounded-2xl" />
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-1/2" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                </ShadowCard>
              ))
            ) : (
              quickActions.map((action, index) => (
                <ShadowCard 
                  key={index} 
                  className="group p-8 hover:border-primary/50 cursor-pointer overflow-hidden relative border-none shadow-sm hover:shadow-xl transition-all duration-300"
                  onClick={() => navigate(action.path)}
                >
                  <div className="space-y-4 relative z-10">
                    <div className={`w-14 h-14 rounded-2xl ${action.color} flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                      <action.icon className="h-7 w-7" />
                    </div>
                    <div>
                      <h3 className="font-bold text-xl text-gray-900">{action.title}</h3>
                      <p className="text-sm text-gray-500 leading-relaxed mt-2">{action.description}</p>
                    </div>
                    <div className="flex items-center text-primary font-bold text-sm group-hover:translate-x-2 transition-all duration-300 mt-4">
                      Get Started <ArrowRight className="h-4 w-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                  {/* Decorative background element */}
                  <div className={`absolute -right-4 -bottom-4 w-32 h-32 ${action.color} opacity-[0.05] rounded-full group-hover:scale-150 transition-transform duration-700`} />
                </ShadowCard>
              ))
            )}
          </div>
        </div>

        {/* System Health Section */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-green-600" />
            System Health
          </h2>
          <ShadowCard className="p-8 flex flex-col items-center justify-center text-center space-y-6 border-none shadow-sm">
            {loading ? (
              <div className="w-full space-y-6">
                <div className="flex flex-col items-center space-y-4">
                  <Skeleton className="w-24 h-24 rounded-full" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
                <div className="pt-4 border-t border-gray-50">
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              </div>
            ) : (
              <>
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-green-100 flex items-center justify-center">
                    <ShieldCheck className="h-12 w-12 text-green-600" />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-4 border-white animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-xl tracking-tight">All Systems Go</h3>
                  <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                    Platform performance is optimal. Security scanning complete. Next scheduled audit in 14 hours.
                  </p>
                </div>
                <div className="w-full pt-4 border-t border-gray-50">
                  <Button variant="outline">
                    View Performance Metrics
                  </Button>
                </div>
              </>
            )}
          </ShadowCard>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
