'use client'
import { useState } from 'react'
import { PinGate } from '@/components/report/PinGate'
import { ReportView } from './ReportView'

export default function ReportPage({ params }: { params: { slug: string } }) {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)

  if (!workspaceId) {
    return <PinGate slug={params.slug} onUnlock={setWorkspaceId} />
  }

  return <ReportView workspaceId={workspaceId} />
}
