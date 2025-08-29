import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function SectionCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Clients</CardDescription>
          <CardTitle className="text-4xl">12</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Active Facebook Ad accounts
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Data Collections</CardDescription>
          <CardTitle className="text-4xl">47</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Monthly reports generated
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Last Scrape</CardDescription>
          <CardTitle className="text-4xl">2h</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            Time since last data collection
          </p>
        </CardContent>
      </Card>
    </div>
  )
}