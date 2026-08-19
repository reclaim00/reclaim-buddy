// Generates simple branded placeholder screenshots for the PWA install prompt.
// Pure Node (no deps): writes RGBA pixels and encodes PNG via zlib.
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

// ---- PNG encoding ----
function crc32(buf) {
  if (!crc32.table) {
    crc32.table = new Int32Array(256);
    for (let n = 0; n < 256; n++) {
      let c = n;
      for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      crc32.table[n] = c;
    }
  }
  let crc = -1;
  for (let i = 0; i < buf.length; i++) crc = (crc >>> 8) ^ crc32.table[(crc ^ buf[i]) & 0xff];
  return (crc ^ -1) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
}
function encodePNG(w, h, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6; // 8-bit RGBA
  const raw = Buffer.alloc((w * 4 + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (w * 4 + 1)] = 0;
    rgba.copy(raw, y * (w * 4 + 1) + 1, y * w * 4, (y + 1) * w * 4);
  }
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}

// ---- Canvas ----
function hex(c) { return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)]; }
function Canvas(w, h, bg) {
  this.w = w; this.h = h;
  this.buf = Buffer.alloc(w * h * 4);
  this.fill(hex(bg));
}
Canvas.prototype.fill = function (rgb) {
  for (let i = 0; i < this.buf.length; i += 4) { this.buf[i] = rgb[0]; this.buf[i + 1] = rgb[1]; this.buf[i + 2] = rgb[2]; this.buf[i + 3] = 255; }
};
Canvas.prototype.px = function (x, y, rgb) {
  if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
  const i = (y * this.w + x) * 4;
  this.buf[i] = rgb[0]; this.buf[i + 1] = rgb[1]; this.buf[i + 2] = rgb[2];
  this.buf[i + 3] = rgb.length > 3 ? rgb[3] : 255;
};
Canvas.prototype.rect = function (x0, y0, x1, y1, rgb) {
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) this.px(x, y, rgb);
};
Canvas.prototype.roundRect = function (x0, y0, x1, y1, r, rgb) {
  const rr = Math.min(r, (x1 - x0) / 2, (y1 - y0) / 2);
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const cx = Math.max(x0 + rr, Math.min(x, x1 - rr - 1));
    const cy = Math.max(y0 + rr, Math.min(y, y1 - rr - 1));
    const dx = x - cx, dy = y - cy;
    if (dx * dx + dy * dy <= rr * rr) this.px(x, y, rgb);
  }
};
Canvas.prototype.circle = function (cx, cy, r, rgb) {
  for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) {
    const dx = x - cx, dy = y - cy;
    if (dx * dx + dy * dy <= r * r) this.px(x, y, rgb);
  }
};
// horizontal "text" bar
Canvas.prototype.bar = function (x, y, w, h, rgb) { this.roundRect(x, y, x + w, y + h, h / 2, rgb); };

// ---- Theme ----
const BG = '#dce3d4';
const PRIMARY = '#2a5a1e';
const PRIMARY_DARK = '#1f4716';
const PRIMARY_LIGHT = '#cfe0c9';
const CARD = '#ffffff';
const GOLD = '#d9a441';
const INK = '#2c332a';
const SOFT = '#aeb8a4';
const SOFT2 = '#c4ccba';

const PALETTE = {
  bg: hex(BG), primary: hex(PRIMARY), primaryDark: hex(PRIMARY_DARK),
  primaryLight: hex(PRIMARY_LIGHT), card: hex(CARD), gold: hex(GOLD),
  muted: hex('#8a9382'), ink: hex(INK), soft: hex(SOFT), soft2: hex(SOFT2),
};

const W = 750, H = 1334;

function topBar(c) {
  c.rect(0, 0, W, 100, PALETTE.primary);
  c.rect(0, 92, W, 8, PALETTE.primaryDark);
  c.circle(56, 50, 22, PALETTE.gold);
  c.bar(110, 34, 210, 14, hex('#ffffff').concat([200]));
  c.bar(110, 58, 140, 10, hex('#ffffff').concat([140]));
  c.bar(W - 190, 40, 130, 20, hex('#000000').concat([28]));
}

function navBar(c) {
  c.roundRect(0, H - 160, W, H, 34, PALETTE.card);
  c.rect(0, H - 160, W, 26, hex('#ffffff'));
  const centers = [112, 262, 375, 488, 638];
  for (let i = 0; i < centers.length; i++) {
    c.circle(centers[i], H - 80, 26, i === 0 ? PALETTE.primary : hex('#d8ded0'));
  }
  if (centers.length) c.circle(375, H - 80, 34, PALETTE.gold);
}

function screen(name, draw) {
  const c = new Canvas(W, H, BG);
  draw(c);
  fs.writeFileSync(path.join(__dirname, '..', 'screenshots', name), encodePNG(W, H, c.buf));
  console.log('wrote ' + name);
}

// Home
screen('screenshot-home.png', (c) => {
  topBar(c);
  c.roundRect(40, 140, 710, 300, 24, PALETTE.card);
  c.bar(76, 180, 190, 18, PALETTE.primary);
  c.bar(76, 220, 420, 12, PALETTE.soft);
  c.bar(76, 244, 360, 12, PALETTE.soft);
  c.bar(76, 268, 300, 12, PALETTE.soft2);
  const stats = [[50, 340, 260], [265, 340, 475], [480, 340, 690]];
  for (let i = 0; i < stats.length; i++) {
    const [x0, y0, x1] = stats[i];
    c.roundRect(x0, y0, x1, y0 + 150, 18, PALETTE.card);
    c.circle((x0 + x1) / 2, y0 + 52, 26, i === 1 ? PALETTE.gold : PALETTE.primaryLight);
    c.bar((x0 + x1) / 2 - 40, y0 + 96, 80, 10, PALETTE.soft);
  }
  c.roundRect(40, 520, 710, 700, 24, PALETTE.card);
  c.bar(76, 560, 220, 16, PALETTE.ink);
  c.roundRect(76, 600, 634, 634, 10, PALETTE.primaryLight);
  c.rect(76, 600, 634, 634, PALETTE.primaryLight);
  c.roundRect(76, 600, 600, 634, 10, PALETTE.primary);
  c.bar(76, 668, 520, 12, PALETTE.soft);
  c.bar(76, 692, 460, 12, PALETTE.soft);
  c.roundRect(40, 730, 710, 960, 24, PALETTE.card);
  for (let r = 0; r < 3; r++) {
    c.bar(76, 770 + r * 62, 160, 12, r === 0 ? PALETTE.primary : PALETTE.soft);
    c.bar(76, 792 + r * 62, 540, 10, PALETTE.soft2);
  }
  c.roundRect(40, 1000, 710, 1110, 24, PALETTE.card);
  c.circle(120, 1055, 28, PALETTE.gold);
  c.bar(180, 1038, 250, 14, PALETTE.ink);
  c.bar(180, 1062, 380, 10, PALETTE.soft2);
  navBar(c);
});

// Journal
screen('screenshot-journal.png', (c) => {
  topBar(c);
  c.roundRect(40, 140, 710, 300, 24, PALETTE.primaryLight);
  c.bar(76, 176, 180, 14, PALETTE.primary);
  c.bar(76, 204, 540, 11, PALETTE.muted);
  c.bar(76, 226, 500, 11, PALETTE.muted);
  c.bar(76, 248, 460, 11, PALETTE.muted);
  c.roundRect(40, 330, 710, 880, 24, PALETTE.card);
  c.bar(76, 370, 220, 16, PALETTE.ink);
  for (let r = 0; r < 8; r++) {
    c.bar(76, 414 + r * 52, 560 - (r % 3) * 70, 11, PALETTE.soft2);
  }
  c.circle(375, 1130, 46, PALETTE.primary);
  c.circle(375, 1130, 22, PALETTE.card);
  navBar(c);
});

// Buddy chat
screen('screenshot-buddy.png', (c) => {
  topBar(c);
  c.circle(375, 50, 24, PALETTE.gold);
  c.roundRect(40, 160, 560, 280, 20, PALETTE.card);
  c.bar(76, 196, 70, 10, PALETTE.primary);
  c.bar(76, 220, 380, 11, PALETTE.soft);
  c.bar(76, 242, 330, 11, PALETTE.soft);
  c.roundRect(190, 310, 710, 430, 20, PALETTE.primaryLight);
  c.bar(226, 346, 70, 10, PALETTE.primary);
  c.bar(226, 370, 400, 11, PALETTE.muted);
  c.bar(226, 392, 360, 11, PALETTE.muted);
  c.roundRect(40, 460, 620, 580, 20, PALETTE.card);
  c.bar(76, 496, 70, 10, PALETTE.primary);
  c.bar(76, 520, 440, 11, PALETTE.soft);
  c.bar(76, 542, 400, 11, PALETTE.soft);
  c.roundRect(130, 610, 710, 730, 20, PALETTE.primaryLight);
  c.bar(166, 646, 70, 10, PALETTE.primary);
  c.bar(166, 670, 450, 11, PALETTE.muted);
  c.bar(166, 692, 360, 11, PALETTE.muted);
  c.roundRect(40, 1080, 710, 1140, 26, PALETTE.card);
  c.bar(80, 1106, 540, 14, PALETTE.soft2);
  c.circle(632, 1110, 24, PALETTE.primary);
  navBar(c);
});