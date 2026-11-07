'use client';

import { create } from 'zustand';
import { pb } from '@/lib/pocketbase';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** true cuando ya se leyó la sesión persistida de PocketBase (evita parpadeos en SSR). */
  ready: boolean;
  modalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  /** Sincroniza el store con pb.authStore. Llamar una vez al montar la app. */
  init: () => () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

function toUser(): AuthUser | null {
  const m = pb.authStore.record;
  if (!pb.authStore.isValid || !m) return null;
  const email = String(m.email ?? '');
  return { id: m.id, email, name: String(m.username ?? m.name ?? email.split('@')[0]) };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  ready: false,
  modalOpen: false,
  openModal: () => set({ modalOpen: true }),
  closeModal: () => set({ modalOpen: false }),

  init: () => {
    const sync = () => {
      const user = toUser();
      set({ user, isAuthenticated: !!user, ready: true });
    };
    sync();
    // Valida/renueva el token persistido; si ya no sirve, cierra la sesión.
    if (pb.authStore.isValid) {
      pb.collection('users')
        .authRefresh()
        .catch(() => pb.collection('_superusers').authRefresh())
        .catch(() => pb.authStore.clear());
    }
    return pb.authStore.onChange(sync);
  },

  login: async (email, password) => {
    try {
      await pb.collection('users').authWithPassword(email.trim(), password);
      set({ modalOpen: false });
      return { success: true };
    } catch {
      try {
        await pb.collection('_superusers').authWithPassword(email.trim(), password);
        set({ modalOpen: false });
        return { success: true };
      } catch {
        return { success: false, error: 'Correo o contraseña incorrectos' };
      }
    }
  },

  logout: () => pb.authStore.clear(),
}));
