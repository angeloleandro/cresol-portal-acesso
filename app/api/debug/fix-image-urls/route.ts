import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json({ 
        error: 'Configuração do Supabase não encontrada' 
      }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceKey);

    const results = {
      banners: { updated: 0, errors: 0 },
      gallery: { updated: 0, errors: 0 },
      profiles: { updated: 0, errors: 0 }
    };

    // Função para corrigir URLs
    const fixUrl = (url: string | null): string | null => {
      if (!url) return null;
      
      // Se já é uma URL completa válida
      if (url.startsWith('https://') && url.includes('supabase.co')) {
        return url;
      }
      
      // Se é um path relativo, construir URL completa
      if (!url.startsWith('http')) {
        const cleanPath = url.startsWith('/') ? url.slice(1) : url;
        return `${supabaseUrl}/storage/v1/object/public/images/${cleanPath}`;
      }
      
      return url;
    };

    // Corrigir banners
    const { data: banners } = await supabase
      .from('banners')
      .select('id, image_url');

    if (banners) {
      for (const banner of banners) {
        const fixedUrl = fixUrl(banner.image_url);
        if (fixedUrl !== banner.image_url) {
          const { error } = await supabase
            .from('banners')
            .update({ image_url: fixedUrl })
            .eq('id', banner.id);
          
          if (error) {
            results.banners.errors++;
          } else {
            results.banners.updated++;
          }
        }
      }
    }

    // Corrigir gallery_images
    const { data: gallery } = await supabase
      .from('gallery_images')
      .select('id, image_url');

    if (gallery) {
      for (const img of gallery) {
        const fixedUrl = fixUrl(img.image_url);
        if (fixedUrl !== img.image_url) {
          const { error } = await supabase
            .from('gallery_images')
            .update({ image_url: fixedUrl })
            .eq('id', img.id);
          
          if (error) {
            results.gallery.errors++;
          } else {
            results.gallery.updated++;
          }
        }
      }
    }

    // Corrigir profiles (avatars)
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, avatar_url')
      .not('avatar_url', 'is', null);

    if (profiles) {
      for (const profile of profiles) {
        const fixedUrl = fixUrl(profile.avatar_url);
        if (fixedUrl !== profile.avatar_url) {
          const { error } = await supabase
            .from('profiles')
            .update({ avatar_url: fixedUrl })
            .eq('id', profile.id);
          
          if (error) {
            results.profiles.errors++;
          } else {
            results.profiles.updated++;
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'URLs corrigidas com sucesso',
      results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Erro ao corrigir URLs:', error);
    return NextResponse.json({ 
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 });
  }
}