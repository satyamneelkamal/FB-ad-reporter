import { redirect } from 'next/navigation'

export default function ClientDashboard() {
  redirect('/client/analytics/campaigns')
}