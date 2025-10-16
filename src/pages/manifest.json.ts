// src/pages/manifest.json.ts
export const prerender = false;

import type { APIRoute } from 'astro';

const RESTAURANT_ID = import.meta.env.PUBLIC_DEFAULT_RESTAURANT_ID || 'rare-burger';
const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'https://api.cmdola.be/api';

export const GET: APIRoute = async () => {
  try {
    // Récupérer la config du restaurant
    const configResponse = await fetch(`${API_BASE_URL}/$config`);
    const config = await configResponse.json();

    const logoUrl = config.theme?.logo 
      ? `${API_BASE_URL}/images/$${config.theme.logo}`
      : '/favicon.ico';

    const restaurantName = config.nom || 'CMDOLA';

    // Générer le manifest dynamiquement
    const manifest = {
      name: `${restaurantName} - Livraison`,
      short_name: restaurantName,
      description: `Application de livraison pour ${restaurantName}`,
      start_url: '/livraison',
      display: 'standalone',
      background_color: '#1e293b',
      theme_color: '#1e293b',
      orientation: 'portrait',
      icons: [
        {
          src: logoUrl,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: logoUrl,
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: logoUrl,
          sizes: '128x128',
          type: 'image/png'
        }
      ],
      categories: ['business', 'food'],
      lang: 'fr-BE',
      dir: 'ltr'
    };

    return new Response(JSON.stringify(manifest), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600' // Cache 1h
      }
    });

  } catch (error) {
    console.error('Erreur génération manifest:', error);
    
    // Fallback en cas d'erreur
    const fallbackManifest = {
      name: 'CMDOLA Livraison',
      short_name: 'Livraison',
      start_url: '/livraison',
      display: 'standalone',
      background_color: '#1e293b',
      theme_color: '#1e293b',
      icons: [
        {
          src: '/favicon.ico',
          sizes: 'any',
          type: 'image/x-icon'
        }
      ]
    };

    return new Response(JSON.stringify(fallbackManifest), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};