import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RoleEnum } from "../../data/mockUserData";
import AdminDashboard from "../platform-admin/dashboard/AdminDashboard";
import EmployeeDashboard from "../platform-employee/EmployeeDashboard";
import ComplianceCalendarPage from "../platform-admin/compliance-calendar/ComplianceCalendarPage";

interface DashboardProps {
  activeSection?: string;
}

export default function Dashboard({ activeSection = "Dashboard" }: DashboardProps) {
  const navigate = useNavigate();
  const [role] = useState<string | null>(() => localStorage.getItem("userRole"));

  useEffect(() => {
    if (!role) {
      navigate("/login");
    }
  }, [role, navigate]);

  if (!role) return null;

  // Compliance Calendar: platform roles only (PLATFORM_ADMIN + PLATFORM_EMPLOYEE)
  if (activeSection === "Compliance" && (role === RoleEnum.PLATFORM_ADMIN || role === RoleEnum.PLATFORM_EMPLOYEE)) {
    return <ComplianceCalendarPage />;
  }

  if (role === RoleEnum.PLATFORM_ADMIN) {
    return <AdminDashboard />;
  }

  if (role === RoleEnum.PLATFORM_EMPLOYEE) {
    return <EmployeeDashboard activeSection={activeSection} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Unknown Role. Please contact support.</p>
    </div>
  );
}
