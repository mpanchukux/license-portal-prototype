import { customers } from '../data/mock'

const planStyles: Record<string, string> = {
  Free: 'bg-gray-100 text-gray-600',
  Pro: 'bg-indigo-100 text-indigo-700',
  Enterprise: 'bg-purple-100 text-purple-700',
}

export default function Customers() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Customers</h2>
        <p className="text-sm text-gray-500">{customers.length} customer(s)</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {customers.map((c) => (
          <div key={c.id} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gray-100 text-sm font-semibold">
                {c.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${planStyles[c.plan]}`}
              >
                {c.plan}
              </span>
            </div>
            <p className="mt-3 font-medium">{c.name}</p>
            <p className="text-sm text-gray-500">{c.company}</p>
            <p className="mt-1 text-xs text-gray-400">{c.email}</p>
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3 text-xs text-gray-500">
              <span>{c.licenses} license(s)</span>
              <span>Since {c.createdAt}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
