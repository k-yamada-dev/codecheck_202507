import sharp from 'sharp';
import path from 'path';
import { promises as fs } from 'fs';

const THUMBNAIL_WIDTH = 64;
const THUMBNAIL_HEIGHT = 64;

/**
 * Generates a thumbnail from an image file.
 * @param inputPath - The path to the input image.
 * @param outputPath - The path where the thumbnail will be saved.
 * @returns A promise that resolves when the thumbnail is created.
 */
export async function createThumbnail(inputPath: string, outputPath: string): Promise<void> {
  try {
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await sharp(inputPath)
      .resize(THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 80 })
      .toFile(outputPath);
  } catch (error) {
    console.error(`Failed to create thumbnail for ${inputPath}:`, error);
    throw new Error('Thumbnail generation failed');
  }
}

/**
 * Optimizes an image for storage.
 * @param inputPath - The path to the input image.
 * @param outputPath - The path where the optimized image will be saved.
 * @returns A promise that resolves when the image is optimized.
 */
export async function optimizeImage(inputPath: string, outputPath: string): Promise<void> {
  try {
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await sharp(inputPath).jpeg({ quality: 90, progressive: true }).toFile(outputPath);
  } catch (error) {
    console.error(`Failed to optimize image ${inputPath}:`, error);
    throw new Error('Image optimization failed');
  }
}
