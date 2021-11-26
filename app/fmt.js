import { rgbToHsl } from './rgb2hsl.js'

export const RatioFmt = {};

RatioFmt['%'] = (count, sum) => {
  return (count / sum * 100).toFixed(5).padStart(8, ' ');
};

export const ColorFmt = {};

ColorFmt['hex'] = (r, g, b) => {
  const rr = (r).toString(16).padStart(2, '0');
  const gg = (g).toString(16).padStart(2, '0');
  const bb = (b).toString(16).padStart(2, '0');
  return `#${rr}${gg}${bb}`;
};

ColorFmt['HEX'] = (r, g, b) => {
  return ColorFmt['hex'](r, g, b).toUpperCase();
}

ColorFmt['rgb()'] = (r, g, b) => {
  return `rgb(${r}, ${g}, ${b})`;
};

ColorFmt['hsl()'] = (r, g, b) => {
  const [h, s, l] = rgbToHsl(r, g, b);
  const H = `${(h * 360) | 0}deg`;
  const S = `${(s * 100).toPrecision(3)}%`;
  const L = `${(l * 100).toPrecision(3)}%`;
  return `hsl(${H}, ${S}, ${L})`;
}