import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Helper para corrigir URL do Supabase
function fixSupabaseImageUrl(originalUrl: string | null): string | null {
  if (!originalUrl) return null;

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!baseUrl) return originalUrl;

  // Se já é uma URL completa e válida
  if (originalUrl.startsWith('https://') && originalUrl.includes('supabase.co')) {
    return originalUrl;
  }

  // Se é um caminho relativo
  if (originalUrl.startsWith('/storage/v1/object/public/')) {
    return `${baseUrl}${originalUrl}`;
  }

  // Se é apenas o nome do arquivo
  if (!originalUrl.includes('/')) {
    return `${baseUrl}/storage/v1/object/public/images/${originalUrl}`;
  }

  // Se é um caminho parcial
  if (originalUrl.startsWith('images/') || originalUrl.startsWith('/images/')) {
    const cleanPath = originalUrl.replace(/^\//, '');
    return `${baseUrl}/storage/v1/object/public/${cleanPath}`;
  }

  return originalUrl;
}

export async function POST(request: NextRequest) {
  try {
    const results = {
      success: true,
      updated: 0,
      errors: [] as string[],
      details: [] as Array<{
        table: string;
        id: string;
        oldUrl: string;
        newUrl: string;
      }>
    };

    // Corrigir URLs em banners
    const { data: banners, error: bannersError } = await supabase
      .from('banners')
      .select('id, image_url');

    if (bannersError) {
      results.errors.push(`Erro ao buscar banners: ${bannersError.message}`);
    } else if (banners) {
      for (const banner of banners) {
        const fixedUrl = fixSupabaseImageUrl(banner.image_url);
        if (fixedUrl && fixedUrl !== banner.image_url) {
          const { error: updateError } = await supabase
            .from('banners')
            .update({ image_url: fixedUrl })
            .eq('id', banner.id);

          if (updateError) {
            results.errors.push(`Erro ao atualizar banner ${banner.id}: ${updateError.message}`);
          } else {
            results.updated++;
            results.details.push({
              table: 'banners',
              id: banner.id,
              oldUrl: banner.image_url,
              newUrl: fixedUrl
            });
          }
        }
      }
    }

    // Corrigir URLs em gallery_images
    const { data: galleryImages, error: galleryError } = await supabase
      .from('gallery_images')
      .select('id, image_url');

    if (galleryError) {
      results.errors.push(`Erro ao buscar gallery_images: ${galleryError.message}`);
    } else if (galleryImages) {
      for (const image of galleryImages) {
        const fixedUrl = fixSupabaseImageUrl(image.image_url);
        if (fixedUrl && fixedUrl !== image.image_url) {
          const { error: updateError } = await supabase
            .from('gallery_images')
            .update({ image_url: fixedUrl })
            .eq('id', image.id);

          if (updateError) {
            results.errors.push(`Erro ao atualizar gallery_image ${image.id}: ${updateError.message}`);
          } else {
            results.updated++;
            results.details.push({
              table: 'gallery_images',
              id: image.id,
              oldUrl: image.image_url,
              newUrl: fixedUrl
            });
          }
        }
      }
    }

    // Corrigir URLs em usuarios (foto_perfil)
    const { data: users, error: usersError } = await supabase
      .from('usuarios')
      .select('id, foto_perfil');

    if (usersError) {
      results.errors.push(`Erro ao buscar usuarios: ${usersError.message}`);
    } else if (users) {
      for (const user of users) {
        const fixedUrl = fixSupabaseImageUrl(user.foto_perfil);
        if (fixedUrl && fixedUrl !== user.foto_perfil) {
          const { error: updateError } = await supabase
            .from('usuarios')
            .update({ foto_perfil: fixedUrl })
            .eq('id', user.id);

          if (updateError) {
            results.errors.push(`Erro ao atualizar usuario ${user.id}: ${updateError.message}`);
          } else {
            results.updated++;
            results.details.push({
              table: 'usuarios',
              id: user.id,
              oldUrl: user.foto_perfil,
              newUrl: fixedUrl
            });
          }
        }
      }
    }

    return NextResponse.json(results);

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      updated: 0,
      details: []
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'API para correção automática de URLs de imagem',
    usage: 'Envie uma requisição POST para corrigir as URLs automaticamente',
    endpoint: '/api/debug/fix-vercel-images'
  });
}
