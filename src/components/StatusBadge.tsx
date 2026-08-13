import type { LicenseStatus } from '../data/types'

const styles: Record<LicenseStatus, string> = {
  active: 'bg-green-100 text-green-700',
  trial: 'bg-blue-100 text-blue-700',
  expired: 'bg-gray-100 text-gray-600',
  suspended: 'bg-red-100 text-red-700',
}

export default function StatusBadge({ status }: { status: LicenseStatus }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${styles[status]}`}
    >
      {status}
    </span>
  )
}
