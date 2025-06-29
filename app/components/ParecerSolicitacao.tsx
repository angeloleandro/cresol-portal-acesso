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
      {/* Container principal do relatório financeiro - Padronizado */}
      <div className="w-full max-w-5xl card-standard">
        
        {/* Seção do Cabeçalho - Usando tipografia padronizada */}
        <header className="text-center mb-10">
          <h1 className="heading-2 md:heading-1">
            Parecer da Solicitação
          </h1>
          <p className="body-text-small mt-2">
            <span className="badge-warning">
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
                className="card-status"
              >
                <h2 className="body-text-small uppercase tracking-wider text-muted">
                  {stat.title}
                </h2>
                <p className="text-4xl font-bold text-body mt-2">
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
                className="card-standard"
              >
                <h3 className="body-text-bold text-muted">
                  {metric.title}
                </h3>
                <p className="text-2xl font-semibold text-title mt-1">
                  {metric.value}
                </p>
              </div>
            ))}
          </div>
        </main>

        {/* Seção do Rodapé */}
        <footer className="text-center mt-8 pt-8 border-t border-gray-200/80">
          <p className="text-xs text-muted">
            Dados oficiais • Cresol Fronteiras • Atualização Mensal
          </p>
        </footer>

      </div>
    </section>
  );
} 