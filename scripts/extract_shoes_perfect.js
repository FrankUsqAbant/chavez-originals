import { execSync } from 'child_process';
import fs from 'fs';

// Helper to convert an image region to raw RGBA
function processShoe({
  name,
  crop,
  keepPolygon, // points [x, y] defining the polygon of the shoe
  outputPng,
}) {
  const tmpBmp = `/tmp/${name}.ppm`;
  const rawRgba = `/tmp/${name}.rgba`;

  // 1. Crop to PPM
  execSync(
    `convert public/assets/aistudio/Gemini_Generated_Image_ozscopozscopozsc_322cbea3.jfif -crop ${crop} +repage ${tmpBmp}`
  );

  // Read PPM
  const buffer = fs.readFileSync(tmpBmp);
  // Parse P6 header
  let offset = 0;
  function readLine() {
    let line = '';
    while (offset < buffer.length) {
      const char = String.fromCharCode(buffer[offset++]);
      if (char === '\n') break;
      line += char;
    }
    return line.trim();
  }

  const magic = readLine();
  let dimensions = readLine();
  while (dimensions.startsWith('#')) dimensions = readLine();
  const [widthStr, heightStr] = dimensions.split(/\s+/);
  const width = parseInt(widthStr, 10);
  const height = parseInt(heightStr, 10);
  const maxVal = parseInt(readLine(), 10);

  const rgbData = buffer.slice(offset);

  // Point in polygon test
  function isInsidePoly(x, y, poly) {
    if (!poly || poly.length === 0) return true;
    let inside = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1];
      const xj = poly[j][0], yj = poly[j][1];
      const intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  }

  // Flood fill background from corners
  const visited = new Uint8Array(width * height);
  const isBg = new Uint8Array(width * height);

  // A pixel is candidate background if it's near-white or floor reflection outside shoe
  function isBgPixel(x, y) {
    const idx = (y * width + x) * 3;
    const r = rgbData[idx];
    const g = rgbData[idx + 1];
    const b = rgbData[idx + 2];

    // Check if inside shoe polygon
    if (!isInsidePoly(x, y, keepPolygon)) {
      return true; // outside shoe is always background!
    }

    // Inside keep polygon: only very bright white (> 242 on all channels) and near edges
    const isVeryWhite = r >= 242 && g >= 242 && b >= 242;
    return isVeryWhite;
  }

  // Queue for BFS floodfill
  const queue = [];
  function enqueue(x, y) {
    if (x < 0 || x >= width || y < 0 || y >= height) return;
    const pos = y * width + x;
    if (visited[pos]) return;
    visited[pos] = 1;
    if (isBgPixel(x, y)) {
      isBg[pos] = 1;
      queue.push(pos);
    }
  }

  // Enqueue all borders
  for (let x = 0; x < width; x++) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  let head = 0;
  while (head < queue.length) {
    const pos = queue[head++];
    const x = pos % width;
    const y = Math.floor(pos / width);

    enqueue(x + 1, y);
    enqueue(x - 1, y);
    enqueue(x, y + 1);
    enqueue(x, y - 1);
  }

  // Build RGBA output
  const rgba = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pos = y * width + x;
      const rgbIdx = pos * 3;
      const rgbaIdx = pos * 4;

      const r = rgbData[rgbIdx];
      const g = rgbData[rgbIdx + 1];
      const b = rgbData[rgbIdx + 2];

      rgba[rgbaIdx] = r;
      rgba[rgbaIdx + 1] = g;
      rgba[rgbaIdx + 2] = b;

      if (isBg[pos]) {
        rgba[rgbaIdx + 3] = 0; // transparent
      } else {
        // Soften edge if close to background
        rgba[rgbaIdx + 3] = 255;
      }
    }
  }

  fs.writeFileSync(rawRgba, rgba);

  // Convert raw RGBA to PNG with trim
  execSync(
    `convert -size ${width}x${height} -depth 8 rgba:${rawRgba} -trim +repage ${outputPng}`
  );

  console.log(`Saved ${outputPng}`);
}

// 1. Shoe 1: Urban Low (clean white with pastel mint badge)
processShoe({
  name: 'shoe1',
  crop: '640x550+25+735',
  keepPolygon: [
    [0, 0],
    [640, 0],
    [640, 240],
    [580, 270],
    [530, 340],
    [480, 380],
    [455, 430],
    [440, 480],
    [440, 550],
    [0, 550],
  ],
  outputPng: 'public/assets/aistudio/hero_model_urban_low.png',
});

// 2. Shoe 2: Air Glow Tech (white with green air bubble and red tongue)
processShoe({
  name: 'shoe2',
  crop: '650x550+495+735',
  keepPolygon: [
    [180, 0],
    [650, 0],
    [650, 260],
    [580, 260],
    [530, 320],
    [480, 360],
    [470, 550],
    [30, 550],
    [25, 410],
    [60, 370],
    [110, 330],
    [150, 280],
    [180, 0],
  ],
  outputPng: 'public/assets/aistudio/hero_model_air_glow_tech.png',
});

// 3. Shoe 3: Chunky Lavender (white with purple heel clip)
processShoe({
  name: 'shoe3',
  crop: '650x550+1030+735',
  keepPolygon: [
    [80, 0],
    [650, 0],
    [650, 260],
    [570, 260],
    [520, 320],
    [475, 360],
    [450, 420],
    [450, 550],
    [20, 550],
    [18, 410],
    [40, 360],
    [80, 320],
    [80, 0],
  ],
  outputPng: 'public/assets/aistudio/hero_model_chunky_lavender.png',
});

// 4. Shoe 4: Velocity Silver (metallic silver runner on right)
processShoe({
  name: 'shoe4',
  crop: '650x550+1520+735',
  keepPolygon: [
    [120, 0],
    [650, 0],
    [650, 550],
    [0, 550],
    [0, 370],
    [60, 340],
    [100, 290],
    [120, 200],
    [120, 0],
  ],
  outputPng: 'public/assets/aistudio/hero_model_velocity_silver.png',
});
