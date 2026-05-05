export type Status = 'draft' | 'in_progress' | 'sme_approved' | 'approved' | 'rejected' | 'completed'

export interface SME {
  sme_id: string
  name: string
  specialization: string
  sub_areas: string[]
  contact_email: string
  created_at: string
}

export interface Interview {
  interview_id: string
  sme_id: string
  topic: string
  status: string
  created_at: string
  turns?: Turn[]
}

export interface Turn {
  turn_number: number
  sme_response: string
  agent_follow_up: string | null
  timestamp: string
  usage?: UsageInfo | null
}

export interface Material {
  material_id: string
  sme_id: string
  title: string
  file_type: string
  status: string
  created_at: string
}

export interface SourcesSchema {
  interviews: string[]
  materials: string[]
}

export interface KnowledgeEntry {
  entry_id: string
  sme_id: string
  topic: string
  status: Status
  content: string
  sources: SourcesSchema
  created_at: string
  updated_at: string
  approved_at?: string
  admin_approved_at?: string
  rejected_at?: string
  rejection_reason?: string
}

export interface QuerySource {
  entry_id: string
  sme_name: string
  topic: string
}

export interface RoutedTo {
  type: 'sme' | 'admin'
  sme_name: string | null
  specialization: string
  reason: string
}

export interface QueryResponse {
  answer: string
  grounded: boolean
  sources: QuerySource[]
  disclaimer: string | null
  session_id: string
  response_type: 'answer' | 'clarification' | 'routing'
  routed_to: RoutedTo[] | null
  timestamp: string
  usage: UsageInfo | null
}

export interface UsageInfo {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
  model: string
}

export interface ChatMessage {
  id: string
  role: 'user' | 'ai'
  content: string
  response_type?: 'answer' | 'clarification' | 'routing'
  grounded?: boolean
  sources?: QuerySource[]
  disclaimer?: string | null
  routed_to?: RoutedTo[] | null
  chips?: string[]
  timestamp: string
}
