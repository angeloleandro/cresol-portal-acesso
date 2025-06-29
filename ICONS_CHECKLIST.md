# Guia de Iconografia e Checklist

Este documento serve como um guia para padronização dos ícones do projeto. Ele lista os ícones que já foram padronizados, os que ainda precisam ser criados e onde eles são utilizados.

## 1. Checklist de Ícones Pendentes

Abaixo está a lista de ícones que são utilizados no projeto via bibliotecas externas (`lucide-react`, `react-icons`) e que precisam ser convertidos em componentes locais no diretório `app/components/icons/` para mantermos um padrão.

- [x] **ClockIcon** (Relógio)
- [x] **ExternalLinkIcon** (Link externo)
- [x] **TriangleAlertIcon** (Alerta de triângulo)
- [x] **PlusIcon** (Sinal de mais, para ações de adicionar genéricas)
- [x] **PencilIcon** (Lápis, para edição)
- [x] **FolderIcon** (Pasta)
- [x] **FolderPlusIcon** (Pasta com sinal de mais)
- [x] **SettingsIcon** (Engrenagem para configurações)
- [x] **CloseIcon** (Ícone "X" para fechar)
- [x] **MailIcon** (Email)
- [x] **ArrowLeftIcon** (Seta para a esquerda)
- [x] **SearchIcon** (Lupa para busca)

---

## 2. Onde os Ícones São Usados

Esta seção detalha quais arquivos estão importando os ícones listados acima. Após a criação dos novos componentes, estas importações deverão ser atualizadas.

- **`app/home/page.tsx`**
  - `Clock` (lucide-react) -> `ClockIcon`

- **`app/components/SystemLinks.tsx`**
  - `ExternalLink` (lucide-react) -> `ExternalLinkIcon`

- **`app/components/SubsectorTeam.tsx`**
  - `LuExternalLink` (react-icons/lu) -> `ExternalLinkIcon`

- **`app/subsetores/[id]/page.tsx`**
  - `LuClock` (react-icons/lu) -> `ClockIcon`
  - `LuTriangleAlert` (react-icons/lu) -> `TriangleAlertIcon`

- **`app/admin/sectors/page.tsx`**
  - `LuPlus` (react-icons/lu) -> `PlusIcon`
  - `LuPencil` (react-icons/lu) -> `PencilIcon`
  - `LuFolder` (react-icons/lu) -> `FolderIcon`
  - `LuFolderPlus` (react-icons/lu) -> `FolderPlusIcon`
  - `LuSettings` (react-icons/lu) -> `SettingsIcon`
  - `LuExternalLink` (react-icons/lu) -> `ExternalLinkIcon`

- **`app/subsetores/[id]/equipe/page.tsx`**
  - `LuPlus` (react-icons/lu) -> `PlusIcon`
  - `LuX` (react-icons/lu) -> `CloseIcon`
  - `LuPencil` (react-icons/lu) -> `PencilIcon`
  - `LuMail` (react-icons/lu) -> `MailIcon`
  - `LuArrowLeft` (react-icons/lu) -> `ArrowLeftIcon`
  - `LuSearch` (react-icons/lu) -> `SearchIcon`

---

## 3. Ícones Já Padronizados

Estes são os ícones que já existem em `app/components/icons/` e estão prontos para uso.

- `UserAddIcon`
- `UserIcon`
- `Building1Icon`
- `Building2Icon`
- `MapIcon`
- `ImageIcon`
- `MonitorIcon`
- `SaveIcon`
- `MonitorPlayIcon`
- `BellNotificationIcon`
- `BellIcon`
- `ChartBarVerticalIcon`
- `ChatLineIcon`
- `LinkIcon`
- `CheckIcon`
- `SuitcaseIcon`
- `TrashIcon`
- `FilterIcon`
- `User2Icon`
- `UserRemoveIcon`
- `UserCircleIcon`
- `UserSquareIcon`
- `UserCheckIcon`
- `UserGroupIcon`
- `UserCloseIcon`
- `WorkEconomiIndicatorIcon`
