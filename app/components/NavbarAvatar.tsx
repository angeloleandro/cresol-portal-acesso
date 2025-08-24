'use client';

import OptimizedAvatar from './OptimizedAvatar';

interface NavbarAvatarProps {
  user: {
    user_metadata?: { full_name?: string };
    email?: string;
    avatar_url?: string;
  } | null;
}

export default function NavbarAvatar({ user }: NavbarAvatarProps) {
  if (!user) {
    return (
      <div className="h-8 w-8 rounded-full bg-gray-300 animate-pulse" />
    );
  }

  const displayName = user?.user_metadata?.full_name || user?.email || 'Usuário';
  
  return (
    <OptimizedAvatar
      src={user?.avatar_url}
      alt={`Avatar de ${displayName}`}
      size="sm"
      priority={true} // ✅ CRITICAL: Above-the-fold no Navbar
      className="rounded-full border border-white/20"
    />
  );
}

