// Heroicons imports
import {
  ArrowLeftIcon,
  ArrowDownIcon,
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  HomeIcon,
  Bars3Icon,
  XMarkIcon,
  EllipsisHorizontalIcon,
  MagnifyingGlassIcon,
  ArrowTopRightOnSquareIcon,
  UserIcon,
  UserPlusIcon,
  UserMinusIcon,
  UserCircleIcon,
  UsersIcon,
  BuildingOfficeIcon,
  BuildingOffice2Icon,
  MapIcon,
  BellIcon,
  BellAlertIcon,
  EnvelopeIcon,
  ChatBubbleLeftIcon,
  PlusIcon,
  MinusIcon,
  CheckIcon,
  PencilIcon,
  TrashIcon,
  DocumentArrowDownIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  CogIcon,
  PhotoIcon,
  VideoCameraIcon,
  PlayIcon,
  PauseIcon,
  ComputerDesktopIcon,
  TvIcon,
  FolderIcon,
  FolderPlusIcon,
  CalendarIcon,
  ClockIcon,
  ListBulletIcon,
  Squares2X2Icon,
  BarsArrowUpIcon,
  FunnelIcon,
  StarIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  LinkIcon,
  BriefcaseIcon,
  DocumentIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  FilmIcon,
  WrenchScrewdriverIcon,
  LockClosedIcon,
  DocumentDuplicateIcon,
  CameraIcon,
  MapPinIcon,
} from '@heroicons/react/24/outline';

export type IconName =
  | 'arrow-left'
  | 'arrow-right'
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
  | 'more-horizontal'
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
  | 'search'
  // Novos ícones
  | 'calendar'
  | 'list'
  | 'video'
  | 'star'
  | 'arrow-down'
  | 'menu'
  | 'play'
  | 'pause'
  | 'sort'
  | 'trending-up'
  | 'trending-down'
  | 'minus'
  | 'grid'
  | 'house'
  | 'chevron-down'
  | 'chevron-up'
  | 'chevron-left'
  | 'x'
  | 'refresh'
  | 'refresh-cw'
  | 'download'
  | 'chevron-right'
  | 'file'
  | 'volume-1'
  | 'volume-2'
  | 'volume-x'
  | 'video-off'
  | 'alert-circle'
  | 'check-circle'
  | 'info'
  | 'tool'
  | 'lock'
  // Form icons
  | 'Loader'
  | 'AlertTriangle'
  | 'Info' 
  | 'CheckCircle'
  | 'Eye'
  | 'EyeOff'
  // Form aliases for better component compatibility
  | 'X'
  | 'ChevronDown'
  | 'ChevronUp'
  | 'Check'
  | 'Search'
  | 'Mail'
  // Missing icons needed for admin components
  | 'layers'
  | 'file-text'
  | 'message-square'
  | 'edit'
  | 'copy'
  | 'eye'
  | 'eye-slash'
  | 'camera'
  | 'map-pin';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
}

// Custom composite components for complex icons
const UserCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <div className="relative inline-block">
    <UserIcon {...props} />
    <CheckIcon className="absolute -top-1 -right-1 w-3 h-3 text-green-500" />
  </div>
);

const UserCloseIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <div className="relative inline-block">
    <UserIcon {...props} />
    <XMarkIcon className="absolute -top-1 -right-1 w-3 h-3 text-red-500" />
  </div>
);

// Animated loader component
const LoaderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <ArrowPathIcon {...props} className={`animate-spin ${props.className || ''}`} />
);

const iconMap: Record<IconName, React.FC<React.SVGProps<SVGSVGElement>>> = {
  // Navigation & Interface
  'arrow-left': ArrowLeftIcon,
  'arrow-right': ArrowRightIcon,
  'arrow-down': ArrowDownIcon,
  'chevron-down': ChevronDownIcon,
  'chevron-up': ChevronUpIcon,
  'chevron-right': ChevronRightIcon,
  'chevron-left': ChevronLeftIcon,
  'house': HomeIcon,
  'menu': Bars3Icon,
  'close': XMarkIcon,
  'x': XMarkIcon,
  'search': MagnifyingGlassIcon,
  'external-link': ArrowTopRightOnSquareIcon,

  // Users & People
  'user': UserIcon,
  'user-2': UserIcon,
  'user-add': UserPlusIcon,
  'user-remove': UserMinusIcon,
  'user-circle': UserCircleIcon,
  'user-square': UserIcon,
  'user-check': UserCheckIcon as any,
  'user-group': UsersIcon,
  'user-close': UserCloseIcon as any,

  // Buildings & Locations
  'building-1': BuildingOfficeIcon,
  'building-2': BuildingOffice2Icon,
  'map': MapIcon,

  // Communication & Notifications
  'bell': BellIcon,
  'bell-notification': BellAlertIcon,
  'mail': EnvelopeIcon,
  'chat-line': ChatBubbleLeftIcon,

  // Actions & Controls
  'plus': PlusIcon,
  'minus': MinusIcon,
  'check': CheckIcon,
  'pencil': PencilIcon,
  'trash': TrashIcon,
  'more-horizontal': EllipsisHorizontalIcon,
  'save': DocumentArrowDownIcon,
  'refresh': ArrowPathIcon,
  'download': ArrowDownTrayIcon,
  'settings': CogIcon,

  // Media & Files
  'image': PhotoIcon,
  'video': VideoCameraIcon,
  'play': PlayIcon,
  'pause': PauseIcon,
  'monitor': ComputerDesktopIcon,
  'monitor-play': TvIcon,
  'folder': FolderIcon,
  'folder-plus': FolderPlusIcon,
  'file': DocumentIcon,
  'volume-1': SpeakerWaveIcon,
  'volume-2': SpeakerWaveIcon,
  'volume-x': SpeakerXMarkIcon,
  'video-off': FilmIcon,

  // Data & Time
  'calendar': CalendarIcon,
  'clock': ClockIcon,

  // Visualization & Layout
  'list': ListBulletIcon,
  'grid': Squares2X2Icon,
  'sort': BarsArrowUpIcon,
  'filter': FunnelIcon,
  'star': StarIcon,

  // Charts & Analytics
  'chart-bar-vertical': ChartBarIcon,
  'trending-up': ArrowTrendingUpIcon,
  'trending-down': ArrowTrendingDownIcon,

  // Status & Feedback
  'CheckCircle': CheckCircleIcon,
  'check-circle': CheckCircleIcon,
  'triangle-alert': ExclamationTriangleIcon,
  'AlertTriangle': ExclamationTriangleIcon,
  'alert-circle': ExclamationTriangleIcon,
  'Info': InformationCircleIcon,
  'info': InformationCircleIcon,
  'Eye': EyeIcon,
  'EyeOff': EyeSlashIcon,

  // Utilities & Loading
  'link': LinkIcon,
  'Loader': LoaderIcon,
  'refresh-cw': ArrowPathIcon,
  'tool': WrenchScrewdriverIcon,
  'lock': LockClosedIcon,

  // Specific System Icons
  'suitcase': BriefcaseIcon,
  'work-economi-indicator': ChartBarIcon,

  // Form aliases for better component compatibility  
  'X': XMarkIcon,
  'ChevronDown': ChevronDownIcon,
  'ChevronUp': ChevronUpIcon,
  'Check': CheckIcon,
  'Search': MagnifyingGlassIcon,
  'Mail': EnvelopeIcon,
  
  // Missing icons needed for admin components
  'layers': Squares2X2Icon,
  'file-text': DocumentIcon,
  'message-square': ChatBubbleLeftIcon,
  'edit': PencilIcon,
  'copy': DocumentDuplicateIcon,
  'eye': EyeIcon,
  'eye-slash': EyeSlashIcon,
  'camera': CameraIcon,
  'map-pin': MapPinIcon,
};

export const Icon: React.FC<IconProps> = ({ name, ...props }) => {
  const IconComponent = iconMap[name];

  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in iconMap. Available icons:`, Object.keys(iconMap));
    // Return a default icon instead of null
    return <ExclamationTriangleIcon {...props} className={`text-red-500 ${props.className || ''}`} />;
  }

  return <IconComponent {...props} />;
};

export default Icon;