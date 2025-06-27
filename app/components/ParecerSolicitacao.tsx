'use client';

interface MetricData {
  title: string;
  value: string;
}

export default function ParecerSolicitacao() {
  // Dados principais (primeira linha)
  const primaryStats: MetricData[] = [
    { title: 'Cooperados', value: '38.019' },
    { title: 'Ativos', value: 'R$ 1,89 bi' },
    { title: 'Agências', value: '32' }
  ];

  // Dados financeiros detalhados (grid inferior)
  const financialMetrics: MetricData[] = [
    { title: 'Patrimônio', value: 'R$ 281,4 mi' },
    { title: 'Depósito Totais', value: 'R$ 848,2 mi' },
    { title: 'Crédito Comercial', value: 'R$ 847,7 mi' },
    { title: 'Crédito de Repasse', value: 'R$ 602,1 mi' },
    { title: 'Carteira Total', value: 'R$ 1,45 bi' },
    { title: 'Cooperativa', value: '1' }
  ];

  return (
    <section className="flex items-center justify-center min-h-[60vh] p-4 bg-gray-50">
      {/* Container principal do relatório financeiro */}
      <div className="w-full max-w-5xl bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 md:p-10">
        
        {/* Seção do Cabeçalho */}
        <header className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Parecer da Solicitação
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            <span className="inline-block bg-orange-50 text-orange-600 font-semibold rounded-full px-4 py-1.5">
              Dados Referentes a 05/2025
            </span>
          </p>
        </header>

        {/* Conteúdo Principal */}
        <main>
          {/* Primeira linha com estatísticas principais */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {primaryStats.map((stat, index) => (
              <div 
                key={index}
                className="bg-gray-50/70 p-5 rounded-xl border border-gray-200/80 text-center transition-all duration-200 ease-in-out hover:transform hover:-translate-y-1 hover:shadow-lg"
              >
                <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                  {stat.title}
                </h2>
                <p className="text-4xl font-bold text-gray-900 mt-2">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Grid de Detalhes Financeiros */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {financialMetrics.map((metric, index) => (
              <div 
                key={index}
                className="bg-white border border-gray-200/80 p-5 rounded-xl transition-all duration-200 ease-in-out hover:transform hover:-translate-y-1 hover:shadow-lg"
              >
                <h3 className="text-base font-medium text-gray-600">
                  {metric.title}
                </h3>
                <p className="text-2xl font-semibold text-gray-800 mt-1">
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        </main>

        {/* Seção do Rodapé */}
        <footer className="text-center mt-8 pt-8 border-t border-gray-200/80">
          <p className="text-xs text-gray-500">
            Dados oficiais • Cresol Fronteiras • Atualização Mensal
          </p>
        </footer>

      </div>
    </section>
  );
} 