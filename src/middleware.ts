// src/middleware.ts
import type { MiddlewareHandler } from 'astro';

// Configuration
const AUTH_COOKIE = 'admin_token';
const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'http://127.0.0.1:5000/api';

// Pages de login autorisées
const LOGIN_PATHS = new Set([
  '/login',
  '/login/',
]);

// Routes protégées et leurs permissions requises
const PROTECTED_ROUTES: Record<string, string[]> = {
  '/admin': ['admin'],
  '/cuisine': ['admin', 'chef'],
  '/livraison': ['admin', 'livreur'],
};

// ==========================================
// Helper pour décoder JWT (sans vérification signature)
// ==========================================
function decodeJWT(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('❌ Erreur décodage JWT:', error);
    return null;
  }
}

// ==========================================
// Vérifier si l'utilisateur a accès à une route
// ==========================================
function hasRouteAccess(userRoles: string[], route: string): boolean {
  // Trouver quelle route protégée correspond
  for (const [protectedRoute, requiredRoles] of Object.entries(PROTECTED_ROUTES)) {
    if (route === protectedRoute || route.startsWith(protectedRoute + '/')) {
      // Vérifier si l'user a au moins un des rôles requis
      return requiredRoles.some((role) => userRoles.includes(role));
    }
  }
  
  // Route non protégée
  return true;
}

// ==========================================
// Middleware Principal
// ==========================================
export const onRequest: MiddlewareHandler = async (ctx, next) => {
  const { cookies, redirect, request } = ctx;
  const { pathname } = new URL(request.url);

  // Ignorer les assets statiques
  if (/\.(png|jpe?g|gif|svg|ico|webp|avif|css|js|map|txt|xml|woff2?)$/i.test(pathname)) {
    return next();
  }

  // Vérifier si c'est une route protégée
  let isProtectedRoute = false;
  let requiredRoles: string[] = [];
  
  for (const [protectedRoute, roles] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname === protectedRoute || pathname.startsWith(protectedRoute + '/')) {
      isProtectedRoute = true;
      requiredRoles = roles;
      break;
    }
  }

  // Si c'est une page de login, laisser passer
  const isLoginPage = LOGIN_PATHS.has(pathname);
  if (isLoginPage) {
    return next();
  }

  // Si route protégée, vérifier l'authentification
  if (isProtectedRoute) {
    const token = cookies.get(AUTH_COOKIE)?.value;
    
    // Pas de token = redirection vers login
    if (!token) {
      console.log(`❌ Pas de token pour accéder à ${pathname}`);
      return redirect('/login', 302);
    }

    // Décoder le token
    const payload = decodeJWT(token);
    
    // Token invalide ou malformé
    if (!payload) {
      console.log(`❌ Token invalide pour ${pathname}`);
      cookies.delete(AUTH_COOKIE, { path: '/' });
      return redirect('/login', 302);
    }

    // Vérifier expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.log(`❌ Token expiré pour ${pathname}`);
      cookies.delete(AUTH_COOKIE, { path: '/' });
      return redirect('/login', 302);
    }

    // Récupérer les rôles
    const userRoles: string[] = payload.roles || [];
    const username: string = payload.username || 'unknown';

    // Vérifier les permissions
    const hasAccess = requiredRoles.some((role) => userRoles.includes(role));
    
    if (!hasAccess) {
      console.log(`❌ ${username} (${userRoles.join(', ')}) n'a pas accès à ${pathname}`);
      console.log(`   Rôles requis: ${requiredRoles.join(', ')}`);
      
      // Rediriger vers la première interface accessible
      if (userRoles.includes('admin')) {
        return redirect('/admin', 302);
      } else if (userRoles.includes('chef')) {
        return redirect('/cuisine', 302);
      } else if (userRoles.includes('livreur')) {
        return redirect('/livraison', 302);
      } else {
        // Aucun rôle valide = déconnexion
        cookies.delete(AUTH_COOKIE, { path: '/' });
        return redirect('/login', 302);
      }
    }

    // ✅ Accès autorisé - Injecter les infos user dans le contexte
    ctx.locals.user = {
      username,
      roles: userRoles,
      name: payload.name || username,
      restaurant: payload.restaurant || 'unknown',
    };

    console.log(`✅ ${username} (${userRoles.join(', ')}) accède à ${pathname}`);
  }

  return next();
};