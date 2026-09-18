import sharp from 'sharp';

const SRC = 'globe-icon.png';
const BRAND = { r: 45, g: 106, b: 79, alpha: 255 };
const SPLASH_BG = { r: 220, g: 227, b: 212, alpha: 255 };
const SPLASH_BG_DARK = { r: 11, g: 18, b: 32, alpha: 255 };

await sharp(SRC).resize(1024, 1024, { fit: 'cover' }).png().toFile('assets/icon.png');

const fg = await sharp({
  create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
});
await fg
  .composite([{ input: await sharp(SRC).resize(600, 600).toBuffer(), left: 212, top: 212 }])
  .png()
  .toFile('assets/icon-foreground.png');
await sharp({
  create: { width: 1024, height: 1024, channels: 4, background: BRAND },
})
  .png()
  .toFile('assets/icon-background.png');

const SP = 2732;
const logoSize = 1200;
const logoBuf = await sharp(SRC).resize(logoSize, logoSize).toBuffer();
for (const [name, bg] of [['splash.png', SPLASH_BG], ['splash-dark.png', SPLASH_BG_DARK]]) {
  await sharp({
    create: { width: SP, height: SP, channels: 4, background: bg },
  })
    .composite([{ input: logoBuf, left: (SP - logoSize) / 2, top: (SP - logoSize) / 2 }])
    .png()
    .toFile('assets/' + name);
}

console.log('assets prepared');