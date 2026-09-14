import { getServerSession } from '@/lib/session'
import { redirect } from 'next/navigation'
import AdminNav from '@/components/admin/AdminNav'

export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()
  if (!session) redirect('/login?next=/admin')
  if (session.role !== 'ADMIN') redirect('/')

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="bg-slate-900 text-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Choke Panoramic — Admin</h1>
            <p className="text-sm text-stone-400">Signed in as {session.email}</p>
          </div>
          <AdminNav />
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">{children}</div>
    </div>
  )
}