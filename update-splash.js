const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const resDir = 'D:/Coding/setoran-angkot/android/app/src/main/res';
const splashDirs = [
  'drawable',
  'drawable-land-hdpi',
  'drawable-land-mdpi',
  'drawable-land-xhdpi',
  'drawable-land-xxhdpi',
  'drawable-land-xxxhdpi',
  'drawable-port-hdpi',
  'drawable-port-mdpi',
  'drawable-port-xhdpi',
  'drawable-port-xxhdpi',
  'drawable-port-xxxhdpi'
];

async function updateSplash() {
  const fullBuffer = fs.readFileSync('D:/Coding/setoran-angkot/public/icon.svg');
  for (const d of splashDirs) {
    const filePath = path.join(resDir, d, 'splash.png');
    if (fs.existsSync(filePath)) {
      await sharp(fullBuffer)
        .resize(300, 300)
        .toFile(filePath);
      console.log(`Updated splash in ${d}`);
    }
  }
}

updateSplash().catch(console.error);
