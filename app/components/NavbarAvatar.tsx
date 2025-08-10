'use client';

import OptimizedAvatar from './OptimizedAvatar';

interface NavbarAvatarProps {
  user: {
    user_metadata?: { full_name?: string };
    email?: string;
    avatar_url?: string;
  } | null;
}

/**
 * Avatar otimizado para Navbar - Above-the-fold critical image
 * Usa priority=true para carregamento imediato
 */
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

/**
 * COMO USAR no Navbar.tsx:
 * 
 * // ❌ ANTES
 * <Icon name="user-circle" className="h-5 w-5" />
 * 
 * // ✅ DEPOIS  
 * <NavbarAvatar user={user} />
 * 
 * BENEFÍCIOS:
 * - ✅ Priority loading para above-the-fold
 * - ✅ Placeholder blur para transição suave
 * - ✅ Quality otimizada para 32px (quality=60)
 * - ✅ Fallback elegante com inicial do nome
 * - ✅ Sizes correto: "32px" para optimização precisa
 */