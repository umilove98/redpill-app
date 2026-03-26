let timer;

export function toast(text) {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  clearTimeout(timer);
  el.textContent = text;
  el.classList.add('show');
  timer = setTimeout(() => el.classList.remove('show'), 1800);
}
