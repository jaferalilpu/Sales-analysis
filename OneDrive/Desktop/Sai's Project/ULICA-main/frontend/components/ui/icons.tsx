import React from 'react';
import type { LucideProps } from 'lucide-react';
import {
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpWideNarrow,
  Archive,
  BadgeDollarSign,
  BarChart3,
  Bell,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  CircleDollarSign,
  ClipboardList,
  Clock,
  Boxes,
  Cpu,
  CreditCard,
  Download,
  FileDown,
  FileText,
  Filter,
  Globe2,
  Heart,
  Home,
  Image as ImageIcon,
  LogOut,
  Mail,
  MapPin,
  Menu,
  Moon,
  Package,
  Pencil,
  Plus,
  Printer,
  RefreshCw,
  Search,
  Settings,
  Share,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Star,
  Sun,
  Tag,
  Trash2,
  Truck,
  User,
  Users,
  X,
  XCircle,
  Eye,
  ChevronRight,
  ChevronLeft,
  UserCircle,
  Wallet,
  Sparkles,
  MessageSquare,
  MessageCircle,
  TrendingUp,
  TrendingDown,
  Upload,
  Play,
  Pause,
  SlidersHorizontal,
  Info,
} from 'lucide-react';

// Fallback for potentially missing icons
const SafeUserCircle = UserCircle || User;
const SafeWallet = Wallet || CreditCard;
const SafeSparkles = Sparkles || Star;
const SafeMessageSquare = MessageSquare || MessageCircle || Mail;
const SafeMessageCircle = MessageCircle || MessageSquare || Mail;

const withDefaultStroke = (
  IconComponent: React.ComponentType<LucideProps> | undefined,
  defaultStrokeWidth = 1.8
) => {
  if (!IconComponent) {
    const FallbackIcon: React.FC<LucideProps> = () => null;
    FallbackIcon.displayName = 'FallbackIcon';
    return FallbackIcon;
  }

  const Wrapped: React.FC<LucideProps> = ({ className, strokeWidth, ...props }) => (
    <IconComponent
      className={className}
      strokeWidth={strokeWidth ?? defaultStrokeWidth}
      {...props}
    />
  );
  // Type assertion needed for dynamic icon component
  Wrapped.displayName =
    // @ts-ignore - Dynamic icon component may not have displayName
    (IconComponent as any)?.displayName ?? (IconComponent as any)?.name ?? 'LucideIcon';
  return Wrapped;
};

export const ChartBarIcon = withDefaultStroke(BarChart3);
export const ShoppingBagIcon = withDefaultStroke(ShoppingBag);
export const ShoppingCartIcon = withDefaultStroke(ShoppingCart);
export const UserGroupIcon = withDefaultStroke(Users);
export const UsersIcon = withDefaultStroke(Users);
export const UserIcon = withDefaultStroke(User);
export const PackageIcon = withDefaultStroke(Package);
export const CubeIcon = withDefaultStroke(Boxes);
export const PlusIcon = withDefaultStroke(Plus);
export const ClockIcon = withDefaultStroke(Clock);
export const PencilIcon = withDefaultStroke(Pencil);
export const TrashIcon = withDefaultStroke(Trash2);
export const EyeIcon = withDefaultStroke(Eye);
export const MagnifyingGlassIcon = withDefaultStroke(Search);
export const FunnelIcon = withDefaultStroke(Filter);
export const ExclamationTriangleIcon = withDefaultStroke(AlertTriangle);
export const ArrowLeftIcon = withDefaultStroke(ArrowLeft);
export const ArrowRightIcon = withDefaultStroke(ArrowRight);
export const ArrowRightOnRectangleIcon = withDefaultStroke(LogOut);
export const ArrowUpIcon = withDefaultStroke(ArrowUp);
export const ArrowDownIcon = withDefaultStroke(ArrowDown);
export const BarsArrowUpIcon = withDefaultStroke(ArrowUpWideNarrow);
export const Bars3Icon = withDefaultStroke(Menu);
export const XMarkIcon = withDefaultStroke(X);
export const XIcon = withDefaultStroke(X);
export const TruckIcon = withDefaultStroke(Truck);
export const MapPinIcon = withDefaultStroke(MapPin);
export const ClipboardDocumentIcon = withDefaultStroke(ClipboardList);
export const DocumentTextIcon = withDefaultStroke(FileText);
export const DocumentArrowDownIcon = withDefaultStroke(FileDown);
export const PrinterIcon = withDefaultStroke(Printer);
export const CogIcon = withDefaultStroke(Settings);
export const SettingsIcon = withDefaultStroke(Settings);
export const GlobeAltIcon = withDefaultStroke(Globe2);
export const CurrencyDollarIcon = withDefaultStroke(CircleDollarSign);
export const BadgeDollarIcon = withDefaultStroke(BadgeDollarSign);
export const EnvelopeIcon = withDefaultStroke(Mail);
export const ShieldCheckIcon = withDefaultStroke(ShieldCheck);
export const BellIcon = withDefaultStroke(Bell);
export const CheckIcon = withDefaultStroke(Check);
export const CheckCircleIcon = withDefaultStroke(CheckCircle);
export const XCircleIcon = withDefaultStroke(XCircle);
export const StarIcon = withDefaultStroke(Star);
export const HeartIcon = withDefaultStroke(Heart);
export const HeartSolidIcon = ({ className, ...props }: LucideProps) => (
  <Heart className={className} fill="currentColor" stroke="none" {...props} />
);
HeartSolidIcon.displayName = 'HeartSolidIcon';
export const ChevronDownIcon = withDefaultStroke(ChevronDown);
export const CreditCardIcon = withDefaultStroke(CreditCard);
export const DevicePhoneMobileIcon = withDefaultStroke(Smartphone);
export const CpuChipIcon = withDefaultStroke(Cpu);
export const MailIcon = withDefaultStroke(Mail);
export const HomeIcon = withDefaultStroke(Home);
export const SunIcon = withDefaultStroke(Sun);
export const MoonIcon = withDefaultStroke(Moon);
export const TagIcon = withDefaultStroke(Tag);
export const PhotoIcon = withDefaultStroke(ImageIcon);
export const CalendarIcon = withDefaultStroke(Calendar);
export const ArrowDownTrayIcon = withDefaultStroke(Download);
export const ArrowUpOnSquareIcon = withDefaultStroke(Share);
export const ArrowPathIcon = withDefaultStroke(RefreshCw);
export const ArchiveBoxIcon = withDefaultStroke(Archive);
export const ChevronRightIcon = withDefaultStroke(ChevronRight);
export const ChevronLeftIcon = withDefaultStroke(ChevronLeft);
export const UserCircleIcon = withDefaultStroke(SafeUserCircle);
export const WalletIcon = withDefaultStroke(SafeWallet);
export const SparklesIcon = withDefaultStroke(SafeSparkles);
export const Cog6ToothIcon = withDefaultStroke(Settings); // Using Settings as Cog6Tooth doesn't exist in lucide-react
export const ChatBubbleLeftRightIcon = withDefaultStroke(SafeMessageSquare);
export const ChatBubbleLeftIcon = withDefaultStroke(SafeMessageCircle);
export const ArrowTrendingUpIcon = withDefaultStroke(TrendingUp);
export const ArrowTrendingDownIcon = withDefaultStroke(TrendingDown);
export const ArrowUpTrayIcon = withDefaultStroke(Upload);
export const PlayIcon = withDefaultStroke(Play);
export const PauseIcon = withDefaultStroke(Pause);
export const AdjustmentsHorizontalIcon = withDefaultStroke(SlidersHorizontal);
export const InformationCircleIcon = withDefaultStroke(Info);
export const ShareIcon = withDefaultStroke(Share);

export const Icons = {
  ChartBarIcon,
  ShoppingBagIcon,
  ShoppingCartIcon,
  UserGroupIcon,
  UsersIcon,
  UserIcon,
  PackageIcon,
  CubeIcon,
  PlusIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
  ArrowRightIcon,
  ArrowRightOnRectangleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  BarsArrowUpIcon,
  Bars3Icon,
  XMarkIcon,
  XIcon,
  TruckIcon,
  MapPinIcon,
  ClipboardDocumentIcon,
  DocumentTextIcon,
  DocumentArrowDownIcon,
  PrinterIcon,
  CogIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  BadgeDollarIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  BellIcon,
  CheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  StarIcon,
  HeartIcon,
  HeartSolidIcon,
  ChevronDownIcon,
  CreditCardIcon,
  DevicePhoneMobileIcon,
  CpuChipIcon,
  MailIcon,
  HomeIcon,
  SunIcon,
  MoonIcon,
  TagIcon,
  PhotoIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  ArrowUpOnSquareIcon,
  ArrowPathIcon,
  ArchiveBoxIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  UserCircleIcon,
  WalletIcon,
  SparklesIcon,
  Cog6ToothIcon,
  ChatBubbleLeftRightIcon,
  ChatBubbleLeftIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowUpTrayIcon,
  PlayIcon,
  PauseIcon,
  AdjustmentsHorizontalIcon,
  InformationCircleIcon,
  ShareIcon,
};

