interface RealCplCardProps {
  metaLeads: number
  metaCpl: number
  waContacts: number
  waContactRate: number
  realCpl: number
  cplDifference: number
}

export function RealCplCard({
  metaLeads,
  metaCpl,
  waContacts,
  waContactRate,
  realCpl,
  cplDifference,
}: RealCplCardProps) {
  const diff = Math.abs(cplDifference).toFixed(0)
  const isWorseReal = cplDifference > 0

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-5">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-4">
        CPL real vs CPL do Meta
      </p>

      <div className="grid grid-cols-2 gap-4 mb-5">
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-xs text-gray-400 mb-1">CPL Meta (formulário)</p>
          <p className="text-xl font-semibold text-gray-700">
            R${metaCpl.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">{metaLeads} leads</p>
        </div>
        <div className={`rounded-lg p-3 ${isWorseReal ? 'bg-red-50' : 'bg-green-50'}`}>
          <p className="text-xs text-gray-400 mb-1">CPL real (contato WA)</p>
          <p className={`text-xl font-semibold ${isWorseReal ? 'text-red-600' : 'text-green-700'}`}>
            R${realCpl.toFixed(2)}
          </p>
          <p className="text-xs text-gray-400 mt-1">{waContacts} contatos</p>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Taxa de contato WA</span>
          <span className="font-medium">{waContactRate.toFixed(0)}% dos leads</span>
        </div>
        <div className="flex items-center justify-between text-sm mt-2">
          <span className="text-gray-500">Diferença real</span>
          <span className={`font-medium ${isWorseReal ? 'text-red-500' : 'text-green-600'}`}>
            {isWorseReal ? '+' : '-'}{diff}% no CPL real
          </span>
        </div>

        <p className="text-xs text-gray-400 mt-3 leading-relaxed">
          {isWorseReal
            ? `O custo real por contato é ${diff}% maior que o reportado pelo Meta — ${metaLeads - waContacts} leads não chegaram ao WhatsApp.`
            : `Ótima taxa de conversão. ${waContacts} de ${metaLeads} leads chegaram ao WhatsApp.`
          }
        </p>
      </div>
    </div>
  )
}
