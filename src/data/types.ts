export type LicenseStatus = 'active' | 'expired' | 'suspended' | 'trial'

export interface License {
  id: string
  key: string
  product: string
  customer: string
  status: LicenseStatus
  seats: number
  seatsUsed: number
  issuedAt: string
  expiresAt: string
}

export interface Customer {
  id: string
  name: string
  email: string
  company: string
  plan: 'Free' | 'Pro' | 'Enterprise'
  licenses: number
  createdAt: string
}
