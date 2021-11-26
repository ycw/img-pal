import { ColorFmt, RatioFmt } from "./fmt.js";



export function loadImage(imgUrl) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = rej;
    img.crossOrigin = '';
    img.src = imgUrl;
  });
}



export function getImageData(img) {
  const can = document.createElement('canvas');
  can.width = img.width;
  can.height = img.height;
  const ctx = can.getContext('2d');
  ctx.drawImage(img, 0, 0);
  return ctx.getImageData(0, 0, can.width, can.height);
}



// ---
// Gen records; return arrbuf holding ui32 in form [r,g,b,count, r,g ...] 
// ---

export function genAbRecords({ data }) {
  const countsTbl = new Map(); // Map<idx, count>
  for (let i = 0, I = data.length; i < I; i += 4) {
    const idx = (data[i] << 16) + (data[i + 1] << 8) + data[i + 2];
    if (countsTbl.has(idx)) countsTbl.set(idx, countsTbl.get(idx) + 1);
    else countsTbl.set(idx, 1);
  }

  const sorted = Array.from(countsTbl).sort((a, b) => b[3] - a[3]);
  const records = new Uint32Array(countsTbl.size * 4); // 4 for r,g,b,count
  for (const [i, [k, count]] of sorted.entries()) {
    records[i * 4] = k >> 16 & 0xff;
    records[i * 4 + 1] = k >> 8 & 0xff;
    records[i * 4 + 2] = k & 0xff;
    records[i * 4 + 3] = count;
  }
  return records.buffer;
}



// ----
// Gen records for display
// ---

export function intoRecords(abRecords, sum, fmt) {
  const arr = new Uint32Array(abRecords);
  const records = [];
  for (let i = 0, I = arr.length; i < I; i += 4) {
    const color = ColorFmt[fmt](...arr.subarray(i, i + 3));
    const ratio = RatioFmt['%'](arr[i + 3], sum);
    records.push({ color, ratio });
  }
  return records;
}



// ---
// Group similar
// ---

const wk = new Worker('./worker.js');

export function groupAbRecords(abRecords, similarity) {
  return new Promise((res, rej) => {
    wk.onmessage = (e) => res(e.data);
    wk.onerror = rej;
    wk.postMessage({ abRecords, similarity }, [abRecords]);
  });
}