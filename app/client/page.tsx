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

// Client navigation data
const clientNavigation = {
  user: {
    name: "Client User",
    email: "client@example.com",
    avatar: "/avatars/client.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/client",
      icon: "IconDashboard",
    },
    {
      title: "Monthly Reports",
      url: "/client/reports",
      icon: "IconReport",
    },
    {
      title: "Analytics",
      url: "/client/analytics",
      icon: "IconChartBar",
    },
  ],
  navClouds: [
    {
      title: "Reports",
      icon: "IconReport",
      isActive: true,
      url: "/client/reports",
      items: [
        {
          title: "Current Month",
          url: "/client/reports/current",
        },
        {
          title: "Previous Months",
          url: "/client/reports/archive",
        },
      ],
    },
    {
      title: "Campaign Data",
      icon: "IconChartBar",
      url: "/client/campaigns",
      items: [
        {
          title: "Performance",
          url: "/client/campaigns/performance",
        },
        {
          title: "Demographics",
          url: "/client/campaigns/demographics",
        },
      ],
    },
    {
      title: "Insights",
      icon: "IconFileAi",
      url: "/client/insights",
      items: [
        {
          title: "AI Analysis",
          url: "/client/insights/ai",
        },
        {
          title: "Trends",
          url: "/client/insights/trends",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "Account Settings",
      url: "/client/settings",
      icon: "IconSettings",
    },
    {
      title: "Help & Support",
      url: "/client/help",
      icon: "IconHelp",
    },
  ],
  documents: [
    {
      name: "Monthly Reports",
      url: "/client/reports",
      icon: "IconReport",
    },
    {
      name: "Campaign Data",
      url: "/client/campaigns",
      icon: "IconDatabase",
    },
    {
      name: "Export Data",
      url: "/client/export",
      icon: "IconFileDescription",
    },
  ],
}

export default function ClientDashboard() {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" navigationData={clientNavigation} />
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