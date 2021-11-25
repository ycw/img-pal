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



export function countPixels(imgData) {
  const data = imgData.data;
  const countMap = new Map();
  for (let i = 0, I = data.length; i < I; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const idx = (r << 16) + (g << 8) + b;
    if (countMap.has(idx)) {
      countMap.set(idx, countMap.get(idx) + 1);
    } else {
      countMap.set(idx, 1);
    }
  }

  return Array.from(countMap)
    .map(([k, count]) => ({
      r: k >> 16 & 0xff,
      g: k >> 8 & 0xff,
      b: k & 0xff,
      count
    }))
    .sort((a, b) => b.count - a.count);
}



// ----
// rawRecords {r,g,b,count} into records (for display) {color,ratio}
// ---

export function intoRecords(rawRecords, colorFormat) {
  const sum = rawRecords.reduce((o, nu) => o + nu.count, 0);
  return rawRecords.map(({ r, g, b, count }) => {
    return {
      color: ColorFormatter[colorFormat](r, g, b),
      ratio: (count / sum * 100).toFixed(5).padStart(8, ' ')
    };
  });
}

const ColorFormatter = {};

ColorFormatter['hex'] = (r, g, b) => {
  const rr = (r).toString(16).padStart(2, '0');
  const gg = (g).toString(16).padStart(2, '0');
  const bb = (b).toString(16).padStart(2, '0');
  return `#${rr}${gg}${bb}`;
};

ColorFormatter['HEX'] = (r, g, b) => {
  return ColorFormatter['hex'](r, g, b).toUpperCase();
}

ColorFormatter['rgb()'] = (r, g, b) => {
  return `rgb(${r}, ${g}, ${b})`;
};

ColorFormatter['hsl()'] = (r, g, b) => {
  const [h, s, l] = rgbToHsl(r, g, b);
  const H = `${(h * 360) | 0}deg`;
  const S = `${(s * 100).toPrecision(3)}%`;
  const L = `${(l * 100).toPrecision(3)}%`;
  return `hsl(${H}, ${S}, ${L})`;
} 

// ---
// rgb to hsl
// https://gist.github.com/emanuel-sanabria-developer/5793377
// ---

/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http://en.wikipedia.org/wiki/HSL_color_space.
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation
 */
function rgbToHsl(r, g, b) {
  r /= 255, g /= 255, b /= 255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h, s, l = (max + min) / 2;

  if (max == min) {
    h = s = 0; // achromatic
  } else {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h, s, l];
}