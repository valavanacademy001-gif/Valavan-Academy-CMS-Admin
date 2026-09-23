import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminLayoutWrapper from '@/components/layout/AdminLayoutWrapper'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <AdminLayoutWrapper user={user}>
      {children}
    </AdminLayoutWrapper>
  )
}
