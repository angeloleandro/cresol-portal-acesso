// Mock data for economic indicators panel

export const mockEconomicIndicators = [
  {
    id: "1",
    title: "COOPERADOS",
    value: "38.019",
    icon: "users",
    description: "Número total de cooperados",
    display_order: 1,
    is_active: true,
    issue_date: "05/2025"
  },
  {
    id: "2", 
    title: "ATIVOS",
    value: "R$ 1,89 bi",
    icon: "treasure",
    description: "Total de ativos",
    display_order: 2,
    is_active: true,
    issue_date: "05/2025"
  },
  {
    id: "3",
    title: "AGÊNCIAS", 
    value: "32",
    icon: "building",
    description: "Número de agências",
    display_order: 3,
    is_active: true,
    issue_date: "05/2025"
  },
  {
    id: "4",
    title: "Patrimônio",
    value: "R$ 281,4 mi",
    icon: "bank",
    description: "Patrimônio líquido",
    display_order: 4,
    is_active: true,
    issue_date: "05/2025"
  },
  {
    id: "5",
    title: "Depósito Totais",
    value: "R$ 848,2 mi", 
    icon: "money",
    description: "Total de depósitos",
    display_order: 5,
    is_active: true,
    issue_date: "05/2025"
  },
  {
    id: "6",
    title: "Crédito Comercial",
    value: "R$ 847,7 mi",
    icon: "handshake",
    description: "Crédito comercial",
    display_order: 6,
    is_active: true,
    issue_date: "05/2025"
  },
  {
    id: "7",
    title: "Crédito de Repasse",
    value: "R$ 602,1 mi",
    icon: "piggy-bank", 
    description: "Crédito de repasse",
    display_order: 7,
    is_active: true,
    issue_date: "05/2025"
  },
  {
    id: "8",
    title: "Carteira Total",
    value: "R$ 1,45 bi",
    icon: "briefcase",
    description: "Carteira total",
    display_order: 8,
    is_active: true,
    issue_date: "05/2025"
  },
  {
    id: "9",
    title: "Cooperativa",
    value: "1",
    icon: "tractor",
    description: "Número de cooperativas",
    display_order: 9,
    is_active: true,
    issue_date: "05/2025"
  }
];

export const mockRootProps = {
  indicators: mockEconomicIndicators
};