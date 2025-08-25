import { AppSidebar } from "@/components/app-sidebar"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { DataTable } from "@/components/data-table"
import { SectionCards } from "@/components/section-cards"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

import data from "../dashboard/data.json"

// Admin navigation data
const adminNavigation = {
  user: {
    name: "Admin User",
    email: "admin@example.com",
    avatar: "https://ui-avatars.com/api/?name=Admin+User&background=0f172a&color=fff",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: "IconDashboard",
    },
    {
      title: "Clients",
      url: "/admin/clients",
      icon: "IconUsers",
    },
    {
      title: "Data Collection",
      url: "/admin/scrape",
      icon: "IconDatabase",
    },
    {
      title: "Analytics",
      url: "/admin/analytics",
      icon: "IconChartBar",
    },
  ],
  navClouds: [
    {
      title: "Client Management",
      icon: "IconUsers",
      isActive: true,
      url: "/admin/clients",
      items: [
        {
          title: "All Clients",
          url: "/admin/clients",
        },
        {
          title: "Add Client",
          url: "/admin/clients/new",
        },
      ],
    },
    {
      title: "Data Collection",
      icon: "IconDatabase",
      url: "/admin/scrape",
      items: [
        {
          title: "Manual Scrape",
          url: "/admin/scrape",
        },
        {
          title: "Scrape History",
          url: "/admin/scrape/history",
        },
      ],
    },
    {
      title: "Reports",
      icon: "IconReport",
      url: "/admin/reports",
      items: [
        {
          title: "All Reports",
          url: "/admin/reports",
        },
        {
          title: "System Stats",
          url: "/admin/reports/stats",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/admin/settings",
      icon: "IconSettings",
    },
    {
      title: "API Logs",
      url: "/admin/logs",
      icon: "IconFileDescription",
    },
    {
      title: "Help",
      url: "/admin/help",
      icon: "IconHelp",
    },
  ],
  documents: [
    {
      name: "Client Database",
      url: "/admin/clients",
      icon: "IconDatabase",
    },
    {
      name: "System Reports",
      url: "/admin/reports",
      icon: "IconReport",
    },
    {
      name: "API Documentation",
      url: "/admin/docs",
      icon: "IconFileDescription",
    },
  ],
}

export default function AdminDashboard() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" navigationData={adminNavigation} />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}