"use client"

import * as React from "react"
import Link from "next/link"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
  IconTarget,
  IconCategory2,
  IconHeart,
  IconMap,
  IconDevices,
  IconChartPie,
  IconTrendingUp,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Icon mapping for dynamic navigation
const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  IconDashboard,
  IconUsers,
  IconDatabase,
  IconChartBar,
  IconSettings,
  IconHelp,
  IconSearch,
  IconReport,
  IconFileDescription,
  IconCamera,
  IconFileAi,
  IconListDetails,
  IconFolder,
  IconFileWord,
  IconTarget,
  IconCategory2,
  IconHeart,
  IconMap,
  IconDevices,
  IconChartPie,
  IconTrendingUp,
}

// Default data (fallback)
const defaultData = {
  user: {
    name: "User",
    email: "user@example.com",
    avatar: "/avatars/user.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/",
      icon: "IconDashboard",
    },
  ],
  navClouds: [],
  navSecondary: [
    {
      title: "Settings",
      url: "/settings",
      icon: "IconSettings",
    },
  ],
  documents: [],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  navigationData?: typeof defaultData
}

export function AppSidebar({ navigationData, ...props }: AppSidebarProps) {
  const data = navigationData || defaultData

  // Convert icon strings to actual icon components
  const processNavItems = (items: { title: string; url: string; icon: string | React.ComponentType<{ className?: string }> }[]) => {
    return items.map(item => ({
      ...item,
      icon: typeof item.icon === 'string' ? iconMap[item.icon] || IconDashboard : item.icon
    }))
  }

  const processDocuments = (items: { title: string; url: string; icon: string | React.ComponentType<{ className?: string }> }[]) => {
    return items.map(item => ({
      ...item,
      icon: typeof item.icon === 'string' ? iconMap[item.icon] || IconDatabase : item.icon
    }))
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Facebook Ads Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={processNavItems(data.navMain)} />
        {data.documents && data.documents.length > 0 && (
          <NavDocuments items={processDocuments(data.documents)} />
        )}
        <NavSecondary 
          items={processNavItems(data.navSecondary)} 
          className="mt-auto" 
        />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
