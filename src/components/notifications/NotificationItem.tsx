import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { 
  Upload, 
  MessageCircle, 
  AtSign, 
  Heart, 
  Star, 
  Bell,
  AlertTriangle,
  Trophy,
  Settings as SettingsIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NotificationItemProps {
  notification: {
    id: string;
    type: string;
    category: string;
    title: string;
    message: string;
    link: string | null;
    icon: string | null;
    read: boolean;
    created_at: string;
  };
  onMarkAsRead: (id: string) => void;
}

const iconMap: Record<string, any> = {
  upload: Upload,
  update: Upload,
  comment: MessageCircle,
  reply: MessageCircle,
  mention: AtSign,
  reaction: Heart,
  follow: Star,
  badge: Trophy,
  announcement: Bell,
  warning: AlertTriangle,
  default: Bell,
};

const typeColors: Record<string, string> = {
  system: 'text-blue-400',
  creator: 'text-primary',
  community: 'text-purple-400',
  moderation: 'text-yellow-400',
};

export function NotificationItem({ notification, onMarkAsRead }: NotificationItemProps) {
  const navigate = useNavigate();
  const Icon = iconMap[notification.category] || iconMap.default;
  const colorClass = typeColors[notification.type] || 'text-primary';

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "p-4 hover:bg-primary/5 transition-colors cursor-pointer",
        !notification.read && "bg-primary/10 border-l-2 border-primary"
      )}
    >
      <div className="flex gap-3">
        <div className={cn("mt-1", colorClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 space-y-1">
          <p className={cn(
            "text-sm leading-tight",
            !notification.read && "font-semibold"
          )}>
            {notification.title}
          </p>
          <p className="text-xs text-muted-foreground line-clamp-2">
            {notification.message}
          </p>
          <p className="text-xs text-muted-foreground/70">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
        {!notification.read && (
          <div className="mt-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
          </div>
        )}
      </div>
    </div>
  );
}
