const sharp = require('sharp');
const path = require('path');

const WIDTH = 1200;
const HEIGHT = 780;
const imagesDir = path.resolve(__dirname, '..');
const outDir = __dirname;
const mediaDir = 'C:\\Users\\VERGIO\\.openclaw\\media';

const images = [
  { src: 'meeting-integrations-settings.jpg', out: 'gallery-1-meeting-providers.png', label: 'Meeting Provider Integration' },
  { src: 'create-event-recording.jpg', out: 'gallery-2-schedule-recording.png', label: 'Schedule Recording' },
  { src: 'notetaker-zoom.jpg', out: 'gallery-3-notetaker-zoom.png', label: 'AI Notetaker in Zoom' },
  { src: 'edit-minutes-modal.jpg', out: 'gallery-4-edit-minutes.png', label: 'Edit Meeting Minutes' },
];

async function processImage({ src, out, label }) {
  const inputPath = path.join(imagesDir, src);
  
  // Get original dimensions
  const meta = await sharp(inputPath).metadata();
  console.log(`${src}: ${meta.width}x${meta.height}`);
  
  // Resize to fit 1200x780, maintaining aspect ratio, with white background padding
  const resized = await sharp(inputPath)
    .resize(WIDTH, HEIGHT, {
      fit: 'contain',
      background: { r: 245, g: 247, b: 250, alpha: 1 }
    })
    .png()
    .toFile(path.join(outDir, out));
  
  // Copy to media folder
  await sharp(inputPath)
    .resize(WIDTH, HEIGHT, {
      fit: 'contain',
      background: { r: 245, g: 247, b: 250, alpha: 1 }
    })
    .png()
    .toFile(path.join(mediaDir, out));
  
  console.log(`  → ${out} (${Math.round(resized.size / 1024)}KB)`);
}

async function main() {
  for (const img of images) {
    await processImage(img);
  }
  console.log('\nDone! All gallery images resized to 1200x780.');
}

main().catch(console.error);
