const THUMB = {
  sora: '#4facfe, #00f2fe',
  leon: '#a855f7, #6366f1',
  miru: '#f472b6, #fb923c'
};

const BANNER = {
  sora: '#1a3a5c, #0d2137',
  leon: '#2d1b4e, #1a1030',
  miru: '#4a2030, #2d1520'
};

export function thumbGradient(id) { return THUMB[id] || '#666, #999'; }
export function bannerGradient(id) { return BANNER[id] || '#333, #1a1a1a'; }
