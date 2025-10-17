// src/lib/api.ts
// ============================================
// 🚀 CMDOLA API Client - Version Complète
// ============================================

// ============================================
// 🎯 CONFIGURATION
// ============================================
const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'https://api.rareburger.be/api';

// ============================================
// Helper pour récupérer le token JWT
// ============================================
function getAuthToken(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'admin_token') {
      return value;
    }
  }
  return null;
}

// ============================================
// Helper pour les requêtes fetch
// ============================================
async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  console.log('🔍 API Fetch:', url);
  
  try {
    // Ajouter le token d'authentification si disponible
    const token = getAuthToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    console.log('✅ Response:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.error || error.message || 'Erreur API');
    }

    return await response.json();
  } catch (error) {
    console.error('❌ API Error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      url: url
    });
    throw error;
  }
}

// ============================================
// 🔐 AUTH - Authentification
// ============================================
export const auth = {
  /**
   * Connexion avec username/password
   * Retourne le token JWT et les rôles
   */
  login: async (username: string, password: string) => {
    return apiFetch<{
      success: boolean;
      token: string;
      username: string;
      name: string;
      roles: string[];
      restaurant: { id: string; nom: string };
    }>(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },

  /**
   * Vérifier si le token est valide
   */
  verify: async () => {
    return apiFetch<{
      valid: boolean;
      username?: string;
      roles?: string[];
      restaurant?: string;
    }>(`${API_BASE_URL}/auth/verify`);
  },

  /**
   * Récupérer les infos de l'utilisateur connecté
   */
  me: async () => {
    return apiFetch<{
      username: string;
      roles: string[];
      name: string;
      restaurant: string;
    }>(`${API_BASE_URL}/auth/me`);
  },
};

// ============================================
// ⚙️ CONFIG - Configuration
// ============================================
export const config = {
  /**
   * Récupérer la configuration du restaurant
   */
  get: async () => {
    return apiFetch(`${API_BASE_URL}/config`);
  },

  /**
   * Mettre à jour la configuration (admin uniquement)
   */
  update: async (data: any) => {
    return apiFetch(`${API_BASE_URL}/config`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// ============================================
// 🍽️ MENU - Gestion du menu
// ============================================
export const menu = {
  get: async () => {
    return apiFetch(`${API_BASE_URL}/menu`);
  },

  addProduct: async (product: any) => {
    return apiFetch(`${API_BASE_URL}/menu`, {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  getProduct: async (productId: string) => {
    return apiFetch(`${API_BASE_URL}/menu/${productId}`);
  },

  updateProduct: async (productId: string, data: any) => {
    return apiFetch(`${API_BASE_URL}/menu/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteProduct: async (productId: string) => {
    return apiFetch(`${API_BASE_URL}/menu/${productId}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// 📦 COMMANDES - Gestion des commandes
// ============================================
export const commandes = {
  /**
   * Liste toutes les commandes (admin uniquement)
   */
  list: async () => {
    return apiFetch(`${API_BASE_URL}/commandes`);
  },


  /**
  * Liste des commandes archivées (terminées ou annulées)
  * Accessible aux admins et chefs avec filtres
  */
  listArchives: async (period?: 'today' | 'week' | 'month' | 'all', statut?: 'terminee' | 'annulee' | 'all') => {
    const params = new URLSearchParams();
    if (period) params.append('period', period);
    if (statut) params.append('statut', statut);
  
    const query = params.toString() ? `?${params.toString()}` : '';
  
    return apiFetch<{
      commandes: any[];
      total: number;
    }>(`${API_BASE_URL}/commandes/archives${query}`);
  },


  /**
   * Liste des commandes actives (public - pour cuisine)
   * Exclut terminées, annulées et paiements en attente
   */
  listActives: async () => {
    return apiFetch<{
      commandes: any[];
      total: number;
    }>(`${API_BASE_URL}/commandes/actives`);
  },

  /**
   * Créer une nouvelle commande (public - depuis le site)
   */
  create: async (data: any) => {
    return apiFetch(`${API_BASE_URL}/commandes`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Récupérer une commande par son ID (admin uniquement)
   */
  get: async (commandeId: string) => {
    return apiFetch(`${API_BASE_URL}/commandes/${commandeId}`);
  },

  /**
   * Récupérer une commande publiquement (par ID)
   */
  getPublic: async (commandeId: string) => {
    return apiFetch(`${API_BASE_URL}/commandes/public/${commandeId}`);
  },

  /**
   * Tracker une commande par son numéro (public)
   */
  track: async (numero: string) => {
    return apiFetch(`${API_BASE_URL}/commandes/track/${numero}`);
  },

  /**
   * Mettre à jour une commande (admin uniquement)
   */
  update: async (commandeId: string, data: any) => {
    return apiFetch(`${API_BASE_URL}/commandes/${commandeId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Supprimer une commande (admin uniquement)
   */
  delete: async (commandeId: string) => {
    return apiFetch(`${API_BASE_URL}/commandes/${commandeId}`, {
      method: 'DELETE',
    });
  },

  /**
   * Changer le statut d'une commande (admin ou chef)
   */
  updateStatus: async (commandeId: string, statut: string) => {
    return apiFetch(`${API_BASE_URL}/commandes/${commandeId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ statut }),
    });
  },
};

// ============================================
// 🖼️ IMAGES - Gestion des images
// ============================================
export const images = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const token = getAuthToken();

    const response = await fetch(`${API_BASE_URL}/upload-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur upload');
    }

    return response.json();
  },

  delete: async (filename: string) => {
    return apiFetch(`${API_BASE_URL}/delete-image/${filename}`, {
      method: 'DELETE',
    });
  },

  list: async () => {
    return apiFetch(`${API_BASE_URL}/images`);
  },

  getUrl: (filename: string) => {
    return `${API_BASE_URL}/images/${filename}`;
  },
};

// ============================================
// 📊 STATS - Statistiques
// ============================================
export const stats = {
  general: async () => {
    return apiFetch(`${API_BASE_URL}/stats`);
  },

  getExportUrl: (period: 'today' | 'week' | 'month' | 'all') => {
    const token = getAuthToken();
    return `${API_BASE_URL}/export/${period}?token=${token}`;
  },
};

// ============================================
// 🏥 HEALTH - Vérification santé
// ============================================
export const health = {
  check: async () => {
    return apiFetch(`${API_BASE_URL}/health`);
  },

  checkDeep: async () => {
    return apiFetch(`${API_BASE_URL}/health?deep=true`);
  },
};

// ============================================
// 💳 STRIPE - Paiement en ligne
// ============================================
export const stripe = {
  createCheckoutSession: async (orderId: string) => {
    return apiFetch<{
      session_id: string;
      url: string;
    }>(`${API_BASE_URL}/stripe/create-checkout-session`, {
      method: 'POST',
      body: JSON.stringify({ order_id: orderId }),
    });
  },
};

// ============================================
// 🎯 Export par défaut
// ============================================
export const api = {
  auth,
  config,
  menu,
  commandes,
  images,
  stats,
  health,
  stripe,
  API_BASE_URL,
};

export default api;