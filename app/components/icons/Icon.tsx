import React from 'react';
import { ArrowLeftIcon } from './ArrowLeftIcon';
import { UserAddIcon } from './UserAddIcon';
import { UserIcon } from './UserIcon';
import { Building1Icon } from './Building1Icon';
import { Building2Icon } from './Building2Icon';
import { MapIcon } from './MapIcon';
import { ImageIcon } from './ImageIcon';
import { MonitorIcon } from './MonitorIcon';
import { SaveIcon } from './SaveIcon';
import { MonitorPlayIcon } from './MonitorPlayIcon';
import { BellNotificationIcon } from './BellNotificationIcon';
import { BellIcon } from './BellIcon';
import { ChartBarVerticalIcon } from './ChartBarVerticalIcon';
import { ChatLineIcon } from './ChatLineIcon';
import { LinkIcon } from './LinkIcon';
import { CheckIcon } from './CheckIcon';
import { SuitcaseIcon } from './SuitcaseIcon';
import { TrashIcon } from './TrashIcon';
import { FilterIcon } from './FilterIcon';
import { User2Icon } from './User2Icon';
import { UserRemoveIcon } from './UserRemoveIcon';
import { UserCircleIcon } from './UserCircleIcon';
import { UserSquareIcon } from './UserSquareIcon';
import { UserCheckIcon } from './UserCheckIcon';
import { UserGroupIcon } from './UserGroupIcon';
import { UserCloseIcon } from './UserCloseIcon';
import { WorkEconomiIndicatorIcon } from './WorkEconomiIndicatorIcon';
import { ClockIcon } from './ClockIcon';
import { ExternalLinkIcon } from './ExternalLinkIcon';
import { TriangleAlertIcon } from './TriangleAlertIcon';
import { PlusIcon } from './PlusIcon';
import { PencilIcon } from './PencilIcon';
import { FolderIcon } from './FolderIcon';
import { FolderPlusIcon } from './FolderPlusIcon';
import { SettingsIcon } from './SettingsIcon';
import { CloseIcon } from './CloseIcon';
import { MailIcon } from './MailIcon';
import { SearchIcon } from './SearchIcon';
// Adicione outros ícones aqui
// import { OutroIcone } from './OutroIcone';

export type IconName =
  | 'arrow-left'
  | 'user-add'
  | 'user'
  | 'building-1'
  | 'building-2'
  | 'map'
  | 'image'
  | 'monitor'
  | 'save'
  | 'monitor-play'
  | 'bell-notification'
  | 'bell'
  | 'chart-bar-vertical'
  | 'chat-line'
  | 'link'
  | 'check'
  | 'suitcase'
  | 'trash'
  | 'filter'
  | 'user-2'
  | 'user-remove'
  | 'user-circle'
  | 'user-square'
  | 'user-check'
  | 'user-group'
  | 'user-close'
  | 'work-economi-indicator'
  | 'clock'
  | 'external-link'
  | 'triangle-alert'
  | 'plus'
  | 'pencil'
  | 'folder'
  | 'folder-plus'
  | 'settings'
  | 'close'
  | 'mail'
  | 'search'; // Adicione outros nomes de ícones aqui

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
}

const iconMap: Record<IconName, React.FC<React.SVGProps<SVGSVGElement>>> = {
  'arrow-left': ArrowLeftIcon,
  'user-add': UserAddIcon,
  'user': UserIcon,
  'building-1': Building1Icon,
  'building-2': Building2Icon,
  'map': MapIcon,
  'image': ImageIcon,
  'monitor': MonitorIcon,
  'save': SaveIcon,
  'monitor-play': MonitorPlayIcon,
  'bell-notification': BellNotificationIcon,
  'bell': BellIcon,
  'chart-bar-vertical': ChartBarVerticalIcon,
  'chat-line': ChatLineIcon,
  'link': LinkIcon,
  'check': CheckIcon,
  'suitcase': SuitcaseIcon,
  'trash': TrashIcon,
  'filter': FilterIcon,
  'user-2': User2Icon,
  'user-remove': UserRemoveIcon,
  'user-circle': UserCircleIcon,
  'user-square': UserSquareIcon,
  'user-check': UserCheckIcon,
  'user-group': UserGroupIcon,
  'user-close': UserCloseIcon,
  'work-economi-indicator': WorkEconomiIndicatorIcon,
  'clock': ClockIcon,
  'external-link': ExternalLinkIcon,
  'triangle-alert': TriangleAlertIcon,
  'plus': PlusIcon,
  'pencil': PencilIcon,
  'folder': FolderIcon,
  'folder-plus': FolderPlusIcon,
  'settings': SettingsIcon,
  'close': CloseIcon,
  'mail': MailIcon,
  'search': SearchIcon,
  // Adicione outros ícones aqui
  // 'outro-icone': OutroIcone,
};

export const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    // Você pode renderizar um ícone padrão ou null
    return null;
  }

  return <IconComponent {...props} />;
};
