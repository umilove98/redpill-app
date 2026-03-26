const STRENGTH = { weak: '약', medium: '중', strong: '강', killer: '결정적', neutral: '중립', trap: '함정', real_clue: '단서' };
const TYPE = { real: '진짜 단서', noise: '노이즈', trap: '함정' };

export function strengthLabel(s) { return STRENGTH[s] || s; }
export function typeLabel(t) { return TYPE[t] || t; }
export function strengthBadge(s) { return `<span class="badge-${s}">${strengthLabel(s)}</span>`; }
