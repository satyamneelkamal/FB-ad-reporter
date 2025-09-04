import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"

// Client navigation data
const clientNavigation = {
  user: {
    name: "Client User",
    email: "client@example.com",
    avatar: "/avatars/client.jpg",
  },
  navMain: [
    {
      title: "Analytics Overview",
      url: "/client/analytics",
      icon: "IconChartBar",
    },
    {
      title: "Campaigns",
      url: "/client/analytics/campaigns",
      icon: "IconTarget",
    },
    {
      title: "Campaign Types",
      url: "/client/analytics/campaign-types",
      icon: "IconCategory2",
    },
    {
      title: "Engagement",
      url: "/client/analytics/engagement",
      icon: "IconHeart",
    },
    {
      title: "Regional",
      url: "/client/analytics/regional",
      icon: "IconMap",
    },
    {
      title: "Demographics",
      url: "/client/analytics/demographics",
      icon: "IconUsers",
    },
    {
      title: "Devices",
      url: "/client/analytics/devices",
      icon: "IconDevices",
    },
    {
      title: "ROI & ROAS",
      url: "/client/analytics/roi",
      icon: "IconTrendingUp",
    },
  ],
  navClouds: [],
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
  documents: [],
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
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
              {children}
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}