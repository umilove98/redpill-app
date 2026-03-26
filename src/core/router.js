/**
 * Hash Router — #/path 기반 SPA 라우팅
 *
 * 사용법:
 *   router.on('/home', renderHome)
 *   router.on('/character/:id', renderCharacter)
 *   router.navigate('/character/sora')
 */

const routes = [];
let notFoundHandler = null;

function parsePath(hash) {
  const raw = hash.replace(/^#\/?/, '/').replace(/\/$/, '') || '/';
  const [path, queryString] = raw.split('?');
  const query = Object.fromEntries(new URLSearchParams(queryString || ''));
  return { path, query };
}

function matchRoute(path) {
  for (const route of routes) {
    const params = extractParams(route.pattern, path);
    if (params !== null) {
      return { handler: route.handler, params };
    }
  }
  return null;
}

function extractParams(pattern, path) {
  const patternParts = pattern.split('/');
  const pathParts = path.split('/');

  if (patternParts.length !== pathParts.length) return null;

  const params = {};
  for (let i = 0; i < patternParts.length; i++) {
    if (patternParts[i].startsWith(':')) {
      params[patternParts[i].slice(1)] = decodeURIComponent(pathParts[i]);
    } else if (patternParts[i] !== pathParts[i]) {
      return null;
    }
  }
  return params;
}

function handleRoute() {
  const { path, query } = parsePath(location.hash);
  const matched = matchRoute(path);

  if (matched) {
    matched.handler({ params: matched.params, query });
  } else if (notFoundHandler) {
    notFoundHandler({ path, query });
  }
}

export const router = {
  on(pattern, handler) {
    routes.push({ pattern, handler });
    return this;
  },

  notFound(handler) {
    notFoundHandler = handler;
    return this;
  },

  navigate(path) {
    location.hash = '#' + path;
  },

  back() {
    history.back();
  },

  /** 현재 경로 정보 반환 */
  current() {
    return parsePath(location.hash);
  },

  /** 라우터 시작 — hashchange 리스닝 + 초기 라우트 실행 */
  start() {
    window.addEventListener('hashchange', handleRoute);
    handleRoute();
    return this;
  },

  /** 라우터 정지 */
  stop() {
    window.removeEventListener('hashchange', handleRoute);
  }
};
