import { 
  DashboardSquare02Icon, 
  Building01Icon, 
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
    
];
