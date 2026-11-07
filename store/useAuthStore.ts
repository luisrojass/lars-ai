'use client';

import { create } from 'zustand';
import { UsuarioPrueba } from '@/types';
import { USUARIOS_PRUEBA } from '@/data/mockQuestions';

interface AuthState {
  user: UsuarioPrueba | null;
  isAuthenticated: boolean;
  usuariosDisponibles: UsuarioPrueba[];
  loginAs: (usuario: UsuarioPrueba) => void;
  login: (email: string, clave?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: USUARIOS_PRUEBA[0], // Por conveniencia para la demo inicial dejamos al docente o null según preferencia
  isAuthenticated: true,
  usuariosDisponibles: USUARIOS_PRUEBA,

  loginAs: (usuario: UsuarioPrueba) => {
    set({
      user: usuario,
      isAuthenticated: true
    });
  },

  login: async (email: string) => {
    const encontrado = USUARIOS_PRUEBA.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (encontrado) {
      set({
        user: encontrado,
        isAuthenticated: true
      });
      return { success: true };
    }

    // Permitir cualquier usuario de prueba genérico
    const nuevoUsuario: UsuarioPrueba = {
      id: `usr_${Date.now()}`,
      nombre: email.split('@')[0],
      email: email,
      rol: 'Estudiante',
      avatar: '🎓',
      descripcion: 'Usuario en sesión efímera'
    };

    set({
      user: nuevoUsuario,
      isAuthenticated: true
    });
    return { success: true };
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false
    });
  }
}));
