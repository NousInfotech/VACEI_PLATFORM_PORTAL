import { 
  DashboardSquare02Icon, 
  Building01Icon, 
  FileEditIcon,
  InboxIcon
} from '@hugeicons/core-free-icons';
import type { MenuItem } from '../types/menu';

export const menuData: MenuItem[] = [
    {
        slug: "dashboard",
        icon: DashboardSquare02Icon,
        label: "Dashboard",
        href: "/dashboard",
        section: "primary",
        description: "Service Overview",
    },
    {
        slug: "organizations",
        icon: Building01Icon,
        label: "Organizations",
        href: "/dashboard/organizations",
        section: "primary",
        description: "Manage all entities",
    },
    {
        slug: "service-request-management",
        icon: InboxIcon,
        label: "Service Request Management",
        href: "/dashboard/service-request-management",
        section: "primary",
        description: "Manage client requests",
    },
    {
        slug: "service-request-templates",
        icon: FileEditIcon,
        label: "Service Request Template",
        href: "/dashboard/service-request-templates",
        section: "primary",
        description: "Configure form fields",
    },
];
