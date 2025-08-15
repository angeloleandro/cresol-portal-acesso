// Utilitários para processamento e crop de imagens

import { CropArea } from '../types/subsector.types';

/**
 * Cria um elemento HTMLImageElement a partir de uma URL
 * @param url URL da imagem
 * @returns Promise com o elemento de imagem
 */
export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new HTMLImageElement();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error: any) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous');
    image.src = url;
  });

/**
 * Obtém o recorte final da imagem com base na área de crop e rotação
 * @param imageSrc URL da imagem original
 * @param pixelCrop Área de recorte em pixels
 * @param rotation Rotação em graus (padrão: 0)
 * @returns Promise com o blob da imagem recortada e sua URL
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: CropArea,
  rotation = 0
): Promise<{ file: Blob; url: string }> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No 2d context');
  }

  const maxSize = Math.max(image.width, image.height);
  const safeArea = 2 * ((maxSize / 2) * Math.sqrt(2));

  // Definir as dimensões do canvas para a área de recorte
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Translação para permitir rotação da imagem
  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((rotation * Math.PI) / 180);
  ctx.translate(-canvas.width / 2, -canvas.height / 2);

  // Desenhar a imagem recortada no canvas
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Criar um blob do canvas
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Canvas is empty'));
        return;
      }
      const url = URL.createObjectURL(blob);
      resolve({ file: blob, url });
    }, 'image/jpeg', 0.95);
  });
}