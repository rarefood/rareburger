// src/lib/api.ts
// ============================================
// 🚀 CMDOLA API Client - Version simplifiée
// ============================================

// ============================================
// 🎯 CONFIGURATION - Change ici le restaurant !
// ============================================
const API_BASE_URL = import.meta.env.PUBLIC_API_URL || 'https://api.rareburger.be/api';
const RESTAURANT_ID = import.meta.env.PUBLIC_DEFAULT_RESTAURANT_ID || 'rare-burger';

// Helper pour obtenir le restaurant ID
function getRestaurantId(override?: string): string {
  return override || RESTAURANT_ID;
}

// ============================================
// Helper pour les requêtes fetch
// ============================================
async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  console.log('🔍 Tentative fetch:', url);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    console.log('✅ Fetch réussi:', response.status);

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`,
      }));
      throw new Error(error.error || error.message || 'Erreur API');
    }

    return await response.json();
  } catch (error) {
    console.error('❌ API Error détaillée:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      cause: error instanceof Error ? error.cause : undefined,
      stack: error instanceof Error ? error.stack : undefined,
      url: url
    });
    
    if (error instanceof Error && error.message.includes('fetch failed')) {
      console.warn('⚠️  Serveur API non accessible depuis Node.js');
      return {} as T;
    }
    throw error;
  }
}

// ============================================
// 🔐 AUTH - Authentification
// ============================================
export const auth = {
  login: async (username: string, password: string, restaurantId?: string) => {
    const id = getRestaurantId(restaurantId);
    return apiFetch(`${API_BASE_URL}/${id}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  },
};

// ============================================
// ⚙️ CONFIG - Configuration
// ============================================
export const config = {
  get: async (restaurantId?: string) => {
    const id = getRestaurantId(restaurantId);
    return apiFetch(`${API_BASE_URL}/${id}/config`);
  },

  update: async (data: any, restaurantId?: string) => {
    const id = getRestaurantId(restaurantId);
    return apiFetch(`${API_BASE_URL}/${id}/config`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// ============================================
// 🍽️ MENU - Gestion du menu
// ============================================
export const menu = {
  get: async (restaurantId?: string) => {
    const id = getRestaurantId(restaurantId);
    return apiFetch(`${API_BASE_URL}/${id}/menu`);
  },

  addProduct: async (product: any, restaurantId?: string) => {
    const id = getRestaurantId(restaurantId);
    return apiFetch(`${API_BASE_URL}/${id}/menu`, {
      method: 'POST',
      body: JSON.stringify(product),
    });
  },

  getProduct: async (productId: string, restaurantId?: string) => {
    const id = getRestaurantId(restaurantId);
    return apiFetch(`${API_BASE_URL}/${id}/menu/${productId}`);
  },

  updateProduct: async (productId: string, data: any, restaurantId?: string) => {
    const id = getRestaurantId(restaurantId);
    return apiFetch(`${API_BASE_URL}/${id}/menu/${productId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteProduct: async (productId: string, restaurantId?: string) => {
    const id = getRestaurantId(restaurantId);
    return apiFetch(`${API_BASE_URL}/${id}/menu/${productId}`, {
      method: 'DELETE',
    });
  },
};

// ============================================
// 📦 COMMANDES - Gestion des commandes
// ============================================
export const commandes = {
  list: async (restaurantId?: string) => {
    const id = getRestaurantId(restaurantId);
    return apiFetch(`${API_BASE_URL}/${id}/commandes`);
  },

  create: async (data: any, restaurantId?: string) => {
    const id = getRestaurantId(restaurantId);
    return apiFetch(`${API_BASE_URL}/${id}/commandes`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  get: async (commandeId: string, restaurantId?: string) => {
    const id = getRestaurantId(restaurantId);
    return apiFetch(`${API_BASE_URL}/${id}/commandes/${commandeId}`);
  },

  update: async (commandeId: string, data: any, restaurantId?: string) => {
    const id = getRestaurantId(restaurantId);
    return apiFetch(`${API_BASE_URL}/${id}/commandes/${commandeId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete: async (commandeId: string, restaurantId?: string) => {
    const id = getRestaurantId(restaurantId);
    return apiFetch(`${API_BASE_URL}/${id}/commandes/${commandeId}`, {
      method: 'DELETE',
    });
  },

  updateStatus: async (commandeId: string, statut: string, restaurantId?: string) => {
    const id = getRestaurantId(restaurantId);
    return apiFetch(`${API_BASE_URL}/${id}/commandes/${commandeId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ statut }),
    });
  },

  print: async (commandeId: string, restaurantId?: string) => {
    const id = getRestaurantId(restaurantId);
    return apiFetch(`${API_BASE_URL}/${id}/commandes/${commandeId}/print`, {
      method: 'POST',
    });
  },
};

// ============================================
// 🖼️ IMAGES - Gestion des images
// ============================================
export const images = {
  upload: async (file: File, restaurantId?: string) => {
    const id = getRestaurantId(restaurantId);
    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/${id}/upload-image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Erreur upload');
    }

    return response.json();
  },

  delete: async (filename: string, restaurantId?: string) => {
    const id = getRestaurantId(restaurantId);
    return apiFetch(`${API_BASE_URL}/${id}/delete-image/${filename}`, {
      method: 'DELETE',
    });
  },

  list: async (restaurantId?: string) => {
    const id = getRestaurantId(restaurantId);
    return apiFetch(`${API_BASE_URL}/${id}/images`);
  },

  getUrl: (filename: string, restaurantId?: string) => {
    const id = getRestaurantId(restaurantId);
    return `${API_BASE_URL}/images/${id}/${filename}`;
  },
};

// ============================================
// 📊 STATS - Statistiques
// ============================================
export const stats = {
  general: async (restaurantId?: string) => {
    const id = getRestaurantId(restaurantId);
    return apiFetch(`${API_BASE_URL}/${id}/stats`);
  },

  period: async (period: 'today' | 'week' | 'month', restaurantId?: string) => {
    const id = getRestaurantId(restaurantId);
    return apiFetch(`${API_BASE_URL}/${id}/stats/${period}`);
  },

  hours: async (restaurantId?: string) => {
    const id = getRestaurantId(restaurantId);
    return apiFetch(`${API_BASE_URL}/${id}/analytics/hours`);
  },

  days: async (restaurantId?: string) => {
    const id = getRestaurantId(restaurantId);
    return apiFetch(`${API_BASE_URL}/${id}/analytics/days`);
  },
};

// ============================================
// 📥 EXPORT - Export des données
// ============================================
export const exportData = {
  csv: async (period: 'today' | 'week' | 'month' | 'all', restaurantId?: string) => {
    const id = getRestaurantId(restaurantId);
    const url = `${API_BASE_URL}/${id}/export/${period}`;
    window.open(url, '_blank');
  },

  getUrl: (period: 'today' | 'week' | 'month' | 'all', restaurantId?: string) => {
    const id = getRestaurantId(restaurantId);
    return `${API_BASE_URL}/${id}/export/${period}`;
  },
};

// ============================================
// 👥 CLIENT - API publique
// ============================================
export const client = {
  getMenu: async (restaurantId?: string) => {
    const id = getRestaurantId(restaurantId);
    return apiFetch(`${API_BASE_URL}/${id}/client/menu`);
  },

  createOrder: async (data: any, restaurantId?: string) => {
    const id = getRestaurantId(restaurantId);
    return apiFetch(`${API_BASE_URL}/${id}/client/commande`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// ============================================
// 🏥 HEALTH - Vérification santé
// ============================================
export const health = {
  check: async () => {
    return apiFetch(`${API_BASE_URL}/health`);
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
  exportData,
  client,
  health,
  
  // Export du restaurant ID actuel
  getRestaurantId,
  RESTAURANT_ID,
};

export default api;