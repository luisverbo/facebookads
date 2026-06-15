interface ReportSummaryProps {
  text: string
}

export function ReportSummary({ text }: ReportSummaryProps) {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
      <p className="text-xs font-medium text-blue-600 mb-2 uppercase tracking-wide">Resumo do período</p>
      <p className="text-sm text-blue-900 leading-relaxed">{text}</p>
    </div>
  )
}
