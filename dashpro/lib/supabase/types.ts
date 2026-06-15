export type WorkspaceStatus = 'trial' | 'active' | 'paused' | 'cancelled'
export type HealthStatus = 'green' | 'yellow' | 'red'

export interface Manager {
  id: string
  full_name: string
  email: string
  created_at: string
}

export interface Workspace {
  id: string
  manager_id: string
  client_name: string
  client_logo_url: string | null
  report_pin: string
  report_slug: string
  status: WorkspaceStatus
  trial_ends_at: string | null
  monthly_goal_leads: number | null
  monthly_goal_cpl: number | null
  notes: string | null
  huggy_webhook_token: string | null
  huggy_company_code: string | null
  created_at: string
}

export interface WhatsappContact {
  id: string
  workspace_id: string
  huggy_contact_id: string
  phone: string | null
  name: string | null
  department: string | null
  first_contact_at: string
  last_message_at: string
  message_count: number
  created_at: string
}

export interface DailyMetric {
  id: string
  workspace_id: string
  date: string
  spend: number
  leads: number
  impressions: number
  clicks: number
  reach: number
  cpl: number
  ctr: number
}

export interface ActivityLog {
  id: string
  workspace_id: string
  event_type: string
  description: string | null
  metadata: Record<string, unknown> | null
  created_at: string
}

export interface MetaConnection {
  id: string
  workspace_id: string
  ad_account_id: string
  token_expires_at: string | null
  created_at: string
}

export interface WorkspaceSummary {
  totalSpend: number
  totalLeads: number
  avgCpl: number
  prevTotalSpend: number
  prevTotalLeads: number
  prevAvgCpl: number
}
