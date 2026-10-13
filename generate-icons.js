const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// 1. Full Icon SVG (Angkot dengan rounded background elegan)
const fullIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1E293B"/>
      <stop offset="100%" stop-color="#0F172A"/>
    </linearGradient>
    <linearGradient id="angkotGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FCD34D"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.35"/>
    </filter>
  </defs>
  <!-- Background -->
  <rect width="512" height="512" rx="110" fill="url(#bgGrad)"/>
  <rect x="12" y="12" width="488" height="488" rx="98" fill="none" stroke="#F59E0B" stroke-width="4" stroke-opacity="0.3"/>
  
  <!-- Angkot Car Group -->
  <g filter="url(#shadow)">
    <!-- Badan Angkot -->
    <path d="M110 190 C110 155 135 140 180 140 L332 140 C377 140 402 155 402 190 L402 360 C402 385 385 395 365 395 L345 395 L345 420 C345 432 332 442 318 442 L298 442 C284 442 272 432 272 420 L272 395 L240 395 L240 420 C240 432 228 442 214 442 L194 442 C180 442 167 432 167 420 L167 395 L147 395 C127 395 110 385 110 360 Z" fill="url(#angkotGrad)"/>
    
    <!-- Kaca Depan -->
    <path d="M138 185 C138 170 150 162 180 162 L332 162 C362 162 374 170 374 185 L374 265 L138 265 Z" fill="#0F172A"/>
    
    <!-- Garis wiper / refleksi kaca -->
    <path d="M155 175 L210 250" stroke="#38BDF8" stroke-width="6" stroke-linecap="round" stroke-opacity="0.7"/>
    <path d="M225 175 L280 250" stroke="#38BDF8" stroke-width="6" stroke-linecap="round" stroke-opacity="0.7"/>

    <!-- Jalur / Trayek Angkot Banner -->
    <rect x="176" y="115" width="160" height="34" rx="8" fill="#EF4444"/>
    <text x="256" y="138" font-family="Arial, sans-serif" font-size="16" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">ANGKOT KOTA</text>

    <!-- Grill Depan -->
    <rect x="176" y="285" width="160" height="24" rx="6" fill="#1E293B"/>
    <line x1="190" y1="297" x2="322" y2="297" stroke="#64748B" stroke-width="3" stroke-linecap="round"/>

    <!-- Lampu Depan Kiri & Kanan -->
    <circle cx="150" cy="315" r="22" fill="#FEF08A"/>
    <circle cx="150" cy="315" r="16" fill="#FFFFFF"/>
    <circle cx="362" cy="315" r="22" fill="#FEF08A"/>
    <circle cx="362" cy="315" r="16" fill="#FFFFFF"/>

    <!-- Plat Nomor -->
    <rect x="190" y="325" width="132" height="36" rx="6" fill="#0F172A" stroke="#CBD5E1" stroke-width="2"/>
    <text x="256" y="349" font-family="Arial, sans-serif" font-size="17" font-weight="900" fill="#F8FAFC" text-anchor="middle">D 1945 SETOR</text>

    <!-- Bumper Bawah -->
    <rect x="120" y="370" width="272" height="20" rx="8" fill="#334155"/>

    <!-- Roda Ban Bawah -->
    <circle cx="150" cy="410" r="18" fill="#0F172A"/>
    <circle cx="362" cy="410" r="18" fill="#0F172A"/>
  </g>
</svg>`;

// 2. Foreground SVG (Untuk Android Adaptive Icon - transparan di luar, car centered di 72dp viewport)
const foregroundSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="angkotGradFg" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FCD34D"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </linearGradient>
    <filter id="shadowFg" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#000000" flood-opacity="0.45"/>
    </filter>
  </defs>
  
  <g transform="translate(40, 40) scale(0.84)" filter="url(#shadowFg)">
    <!-- Badan Angkot -->
    <path d="M110 190 C110 155 135 140 180 140 L332 140 C377 140 402 155 402 190 L402 360 C402 385 385 395 365 395 L345 395 L345 420 C345 432 332 442 318 442 L298 442 C284 442 272 432 272 420 L272 395 L240 395 L240 420 C240 432 228 442 214 442 L194 442 C180 442 167 432 167 420 L167 395 L147 395 C127 395 110 385 110 360 Z" fill="url(#angkotGradFg)"/>
    
    <!-- Kaca Depan -->
    <path d="M138 185 C138 170 150 162 180 162 L332 162 C362 162 374 170 374 185 L374 265 L138 265 Z" fill="#0F172A"/>
    
    <!-- Refleksi kaca -->
    <path d="M155 175 L210 250" stroke="#38BDF8" stroke-width="6" stroke-linecap="round" stroke-opacity="0.7"/>
    <path d="M225 175 L280 250" stroke="#38BDF8" stroke-width="6" stroke-linecap="round" stroke-opacity="0.7"/>

    <!-- Jalur Banner -->
    <rect x="176" y="115" width="160" height="34" rx="8" fill="#EF4444"/>
    <text x="256" y="138" font-family="Arial, sans-serif" font-size="16" font-weight="900" fill="#FFFFFF" text-anchor="middle" letter-spacing="1">ANGKOT KOTA</text>

    <!-- Grill Depan -->
    <rect x="176" y="285" width="160" height="24" rx="6" fill="#1E293B"/>
    <line x1="190" y1="297" x2="322" y2="297" stroke="#64748B" stroke-width="3" stroke-linecap="round"/>

    <!-- Lampu Depan Kiri & Kanan -->
    <circle cx="150" cy="315" r="22" fill="#FEF08A"/>
    <circle cx="150" cy="315" r="16" fill="#FFFFFF"/>
    <circle cx="362" cy="315" r="22" fill="#FEF08A"/>
    <circle cx="362" cy="315" r="16" fill="#FFFFFF"/>

    <!-- Plat Nomor -->
    <rect x="190" y="325" width="132" height="36" rx="6" fill="#0F172A" stroke="#CBD5E1" stroke-width="2"/>
    <text x="256" y="349" font-family="Arial, sans-serif" font-size="17" font-weight="900" fill="#F8FAFC" text-anchor="middle">D 1945 SETOR</text>

    <!-- Bumper Bawah -->
    <rect x="120" y="370" width="272" height="20" rx="8" fill="#334155"/>

    <!-- Roda Ban Bawah -->
    <circle cx="150" cy="410" r="18" fill="#0F172A"/>
    <circle cx="362" cy="410" r="18" fill="#0F172A"/>
  </g>
</svg>`;

// 3. Round Icon SVG (Untuk ic_launcher_round.png)
const roundIconSvg = fullIconSvg.replace('rx="110"', 'rx="256"').replace('rx="98"', 'rx="244"');

// Simpan file SVG sumber
fs.writeFileSync('D:/Coding/setoran-angkot/public/icon.svg', fullIconSvg);

const resDir = 'D:/Coding/setoran-angkot/android/app/src/main/res';
const sizes = [
  { folder: 'mipmap-mdpi', size: 48, fgSize: 108 },
  { folder: 'mipmap-hdpi', size: 72, fgSize: 162 },
  { folder: 'mipmap-xhdpi', size: 96, fgSize: 216 },
  { folder: 'mipmap-xxhdpi', size: 144, fgSize: 324 },
  { folder: 'mipmap-xxxhdpi', size: 192, fgSize: 432 }
];

async function generateAll() {
  const fullBuffer = Buffer.from(fullIconSvg);
  const fgBuffer = Buffer.from(foregroundSvg);
  const roundBuffer = Buffer.from(roundIconSvg);

  for (const item of sizes) {
    const dir = path.join(resDir, item.folder);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // ic_launcher.png
    await sharp(fullBuffer)
      .resize(item.size, item.size)
      .toFile(path.join(dir, 'ic_launcher.png'));

    // ic_launcher_round.png
    await sharp(roundBuffer)
      .resize(item.size, item.size)
      .toFile(path.join(dir, 'ic_launcher_round.png'));

    // ic_launcher_foreground.png
    await sharp(fgBuffer)
      .resize(item.fgSize, item.fgSize)
      .toFile(path.join(dir, 'ic_launcher_foreground.png'));

    console.log(`Generated icons for ${item.folder} (${item.size}px, fg: ${item.fgSize}px)`);
  }

  // Update Splash screen logo juga agar konsisten
  await sharp(fullBuffer)
    .resize(512, 512)
    .toFile(path.join(resDir, 'drawable/splash.png'));

  console.log('All launcher icons generated successfully!');
}

generateAll().catch(err => {
  console.error(err);
  process.exit(1);
});
