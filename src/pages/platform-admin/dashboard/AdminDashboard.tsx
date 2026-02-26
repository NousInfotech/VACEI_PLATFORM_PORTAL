import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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
import { apiGet } from "../../../config/base";
import { endPoints } from "../../../config/endPoint";

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: overviewRes, isLoading } = useQuery<{
    success: boolean;
    data: {
      totalOrganizations: number;
      activeClients: number;
      activeEngagements: number;
      serviceRequestsPending: number;
      serviceRequestsTotal: number;
    };
  }>({
    queryKey: ["platform-analytics-overview"],
    queryFn: () => apiGet(endPoints.PLATFORM_ANALYTICS.OVERVIEW),
  });

  const overview = overviewRes?.data;

  const stats = [
    { label: "Total Organizations", value: String(overview?.totalOrganizations ?? 0), icon: Building2, color: "text-blue-600", bg: "bg-blue-50", path: "/dashboard/organizations" },
    { label: "Active Clients", value: String(overview?.activeClients ?? 0), icon: Users, color: "text-purple-600", bg: "bg-purple-50", path: "/dashboard/clients" },
    { label: "Active Engagements", value: String(overview?.activeEngagements ?? 0), icon: ShieldCheck, color: "text-green-600", bg: "bg-green-50", path: "/dashboard/engagements" },
    { label: "Service requests", value: String(overview?.serviceRequestsPending ?? 0), icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50", path: "/dashboard/service-request-management" },
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
      description: "View and manage client accounts", 
      icon: Users, 
      path: "/dashboard/clients",
      color: "bg-indigo-600"
    },
    { 
      title: "Manage Employees", 
      description: "View and manage platform employees", 
      icon: Users, 
      path: "/dashboard/employees",
      color: "bg-emerald-600"
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
        {isLoading ? (
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
            <ShadowCard 
              key={index} 
              className="p-6 flex items-center gap-4 hover:translate-y-[-4px] transition-transform cursor-pointer border-none shadow-sm hover:shadow-lg"
              onClick={() => navigate(stat.path)}
            >
              <div className={`p-4 rounded-2xl ${stat.bg} shrink-0`}>
                <stat.icon className={`h-8 w-8 ${stat.color || "text-primary"}`} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
            </ShadowCard>
          ))
        )}
      </div>

      {/* Quick Actions */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-primary" />
            Quick Actions
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
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
    </div>
  );
};

export default AdminDashboard;
