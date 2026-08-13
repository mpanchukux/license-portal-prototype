import { useState } from 'react'
import StatusBadge from '../components/StatusBadge'
import { licenses } from '../data/mock'
import type { LicenseStatus } from '../data/types'

const filters: (LicenseStatus | 'all')[] = ['all', 'active', 'trial', 'expired', 'suspended']

export default function Licenses() {
  const [filter, setFilter] = useState<LicenseStatus | 'all'>('all')
  const rows = filter === 'all' ? licenses : licenses.filter((l) => l.status === filter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Licenses</h2>
          <p className="text-sm text-gray-500">{rows.length} license(s)</p>
        </div>
        <div className="flex gap-1 rounded-lg border border-gray-200 bg-white p-1">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1 text-xs font-medium capitalize transition ${
                filter === f ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-5 py-3">License key</th>
              <th className="px-5 py-3">Customer</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Seats</th>
              <th className="px-5 py-3">Expires</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((l) => (
              <tr key={l.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-mono text-xs">{l.key}</td>
                <td className="px-5 py-3">{l.customer}</td>
                <td className="px-5 py-3">
                  <StatusBadge status={l.status} />
                </td>
                <td className="px-5 py-3 text-gray-600">
                  {l.seatsUsed} / {l.seats}
                </td>
                <td className="px-5 py-3 text-gray-600">{l.expiresAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
