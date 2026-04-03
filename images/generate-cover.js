const sharp = require('sharp');
const path = require('path');

async function generateCover() {
  const WIDTH = 1824;
  const HEIGHT = 176;
  
  // This logo is wider with "Transparency Hub Network" text
  // Layout: logo on left (~550px), separator, tagline + pills on right
  
  const bgSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" style="stop-color:#006699;stop-opacity:1" />
        <stop offset="55%" style="stop-color:#005580;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#990066;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
    
    <!-- Subtle diagonal lines -->
    <g opacity="0.06">
      ${Array.from({length: 18}, (_, i) => `<line x1="${200 + i*100}" y1="0" x2="${350 + i*100}" y2="176" stroke="white" stroke-width="1"/>`).join('\n      ')}
    </g>
    
    <circle cx="1650" cy="88" r="120" fill="white" opacity="0.03"/>
    <circle cx="1700" cy="40" r="80" fill="white" opacity="0.04"/>
    
    <!-- Network dots -->
    <g opacity="0.12" fill="white">
      <circle cx="1400" cy="30" r="3"/><circle cx="1450" cy="55" r="2.5"/>
      <circle cx="1500" cy="25" r="2"/><circle cx="1480" cy="70" r="3"/>
      <circle cx="1530" cy="50" r="2"/><circle cx="1560" cy="85" r="2.5"/>
      <circle cx="1420" cy="80" r="2"/><circle cx="1600" cy="35" r="3"/>
      <circle cx="1640" cy="70" r="2"/><circle cx="1580" cy="110" r="2.5"/>
      <circle cx="1520" cy="130" r="2"/><circle cx="1460" cy="120" r="3"/>
      <circle cx="1680" cy="100" r="2"/><circle cx="1700" cy="55" r="2.5"/>
      <circle cx="1720" cy="130" r="2"/><circle cx="1750" cy="80" r="3"/>
      <line x1="1400" y1="30" x2="1450" y2="55" stroke="white" stroke-width="0.5"/>
      <line x1="1450" y1="55" x2="1480" y2="70" stroke="white" stroke-width="0.5"/>
      <line x1="1480" y1="70" x2="1530" y2="50" stroke="white" stroke-width="0.5"/>
      <line x1="1530" y1="50" x2="1560" y2="85" stroke="white" stroke-width="0.5"/>
      <line x1="1560" y1="85" x2="1640" y2="70" stroke="white" stroke-width="0.5"/>
      <line x1="1640" y1="70" x2="1680" y2="100" stroke="white" stroke-width="0.5"/>
      <line x1="1600" y1="35" x2="1700" y2="55" stroke="white" stroke-width="0.5"/>
      <line x1="1700" y1="55" x2="1750" y2="80" stroke="white" stroke-width="0.5"/>
      <line x1="1580" y1="110" x2="1520" y2="130" stroke="white" stroke-width="0.5"/>
      <line x1="1520" y1="130" x2="1460" y2="120" stroke="white" stroke-width="0.5"/>
    </g>
    
    <!-- Separator -->
    <line x1="690" y1="28" x2="690" y2="148" stroke="white" stroke-width="1" opacity="0.2"/>
    
    <!-- Tagline -->
    <text x="720" y="72" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="white" opacity="0.95" letter-spacing="0.3">AI-Powered Meeting Notes &amp; Association Management</text>
    
    <!-- Feature pills -->
    <g transform="translate(720, 92)">
      <rect x="0" y="0" width="155" height="28" rx="14" fill="white" opacity="0.15"/>
      <text x="78" y="18" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="white" text-anchor="middle">Auto Transcripts</text>
      <rect x="170" y="0" width="125" height="28" rx="14" fill="white" opacity="0.15"/>
      <text x="233" y="18" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="white" text-anchor="middle">AI Minutes</text>
      <rect x="310" y="0" width="165" height="28" rx="14" fill="white" opacity="0.15"/>
      <text x="393" y="18" font-family="Arial, Helvetica, sans-serif" font-size="12" fill="white" text-anchor="middle">Secure Recording</text>
    </g>
    
    <!-- Bottom accent -->
    <rect x="0" y="172" width="${WIDTH}" height="4" fill="#990066" opacity="0.5"/>
  </svg>`;

  const bgBuffer = await sharp(Buffer.from(bgSvg)).png().toBuffer();
  
  // Load the correct full logo
  const logoPath = path.resolve('C:\\Users\\VERGIO\\.openclaw\\media\\inbound\\cf0bf754-621c-4b2a-8051-ae75cb3c9054.jpg');
  const logoRaw = await sharp(logoPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { data, info } = logoRaw;
  
  // Remove white/near-white background
  const threshold = 230;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2];
    if (r > threshold && g > threshold && b > threshold) {
      data[i+3] = 0;
    }
  }
  
  // Invert dark text to white for dark background
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i], g = data[i+1], b = data[i+2], a = data[i+3];
    if (a === 0) continue;
    
    const brightness = (r + g + b) / 3;
    
    // Dark/black text → white
    if (brightness < 70) {
      data[i] = 255;
      data[i+1] = 255;
      data[i+2] = 255;
    }
    // Blue tones → brighten
    else if (b > r && b > g && brightness < 180) {
      data[i] = Math.min(255, r + 120);
      data[i+1] = Math.min(255, g + 110);
      data[i+2] = 255;
    }
    // Magenta/purple tones → brighten
    else if (r > g && b < r && brightness < 180) {
      data[i] = 255;
      data[i+1] = Math.min(255, g + 140);
      data[i+2] = Math.min(255, b + 100);
    }
    // Mid-gray (anti-aliasing) → make white with partial alpha
    else if (brightness >= 70 && brightness < 180) {
      // Check if it's a gray (all channels close)
      const maxDiff = Math.max(r, g, b) - Math.min(r, g, b);
      if (maxDiff < 30) {
        data[i] = 255;
        data[i+1] = 255;
        data[i+2] = 255;
        data[i+3] = Math.round(255 * (1 - (brightness - 70) / 160));
      }
    }
  }
  
  const processedLogo = await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer();
  
  // Resize to fit left area
  const resizedLogo = await sharp(processedLogo)
    .resize({ width: 620, height: 140, fit: 'inside', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  
  const logoMeta = await sharp(resizedLogo).metadata();
  console.log(`Logo: ${logoMeta.width}x${logoMeta.height}`);
  
  const result = await sharp(bgBuffer)
    .composite([
      {
        input: resizedLogo,
        top: Math.round((HEIGHT - logoMeta.height) / 2),
        left: 40,
      }
    ])
    .png()
    .toFile(path.join(__dirname, 'zoom-marketplace-cover-v4.png'));
  
  console.log('Cover generated:', result);
}

generateCover().catch(console.error);
