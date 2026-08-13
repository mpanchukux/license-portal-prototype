import StatCard from '../components/StatCard'
import StatusBadge from '../components/StatusBadge'
import { licenses, customers } from '../data/mock'

export default function Dashboard() {
  const active = licenses.filter((l) => l.status === 'active').length
  const seats = licenses.reduce((sum, l) => sum + l.seats, 0)
  const used = licenses.reduce((sum, l) => sum + l.seatsUsed, 0)

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <p className="text-sm text-gray-500">Overview of licenses and customers</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total licenses" value={licenses.length} />
        <StatCard label="Active" value={active} hint={`${licenses.length - active} inactive`} />
        <StatCard label="Customers" value={customers.length} />
        <StatCard label="Seats used" value={`${used} / ${seats}`} hint="across all licenses" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-5 py-4">
          <h3 className="text-sm font-semibold">Recent licenses</h3>
        </div>
        <ul className="divide-y divide-gray-100">
          {licenses.slice(0, 5).map((l) => (
            <li key={l.id} className="flex items-center justify-between px-5 py-3 text-sm">
              <div>
                <p className="font-medium">{l.customer}</p>
                <p className="text-xs text-gray-400">{l.key}</p>
              </div>
              <StatusBadge status={l.status} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
