// src/middleware.ts
import type { MiddlewareHandler } from 'astro';

const ADMIN_BASE  = '/admin';
const LOGIN_PATHS = new Set([ '/admin', '/admin/' ]); // <- login accepté avec & sans slash
const AUTH_COOKIE = 'admin_token';

export const onRequest: MiddlewareHandler = async (ctx, next) => {
  const { cookies, redirect, request } = ctx;
  const { pathname } = new URL(request.url);

  // Ignorer les assets statiques
  if (/\.(png|jpe?g|gif|svg|ico|webp|avif|css|js|map|txt|xml|woff2?)$/i.test(pathname)) {
    return next();
  }

  const isAdminRoute =
    pathname === ADMIN_BASE || pathname.startsWith(ADMIN_BASE + '/');

  const isLoginPage = LOGIN_PATHS.has(pathname);

  if (isAdminRoute && !isLoginPage) {
    const token = cookies.get(AUTH_COOKIE)?.value;
    if (!token) return redirect('/admin', 302);
  }

  return next();
};
