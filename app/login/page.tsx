'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import { UsuarioPrueba } from '@/types';
import {
  UserCheck,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  LogIn,
  KeyRound,
  Mail
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { user, isAuthenticated, loginAs, login, usuariosDisponibles } = useAuthStore();
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    await login(emailInput, passwordInput);
    router.push('/crear-clase');
  };

  const handleSelectUser = (u: UsuarioPrueba) => {
    loginAs(u);
    router.push('/crear-clase');
  };

  return (
    <main className="min-h-[calc(100vh-3.5rem)] w-full flex items-center justify-center p-4 bg-slate-950">
      <div className="w-full max-w-md space-y-6">
        {/* Cabecera */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-mono">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Vista 2: Autenticación Efímera</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">
            Acceso Rápido ENEISOFT XVI
          </h1>
          <p className="text-xs text-slate-400">
            Selecciona un perfil de prueba preconfigurado con un solo clic.
          </p>
        </div>

        {/* Perfiles de Prueba Preconfigurados */}
        <div className="space-y-2.5">
          <span className="text-xs font-semibold text-slate-300 block">
            Usuarios de Prueba Disponibles:
          </span>

          <div className="space-y-2">
            {usuariosDisponibles.map((u) => {
              const esActivo = isAuthenticated && user?.id === u.id;

              return (
                <button
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between group ${
                    esActivo
                      ? 'bg-sky-500/15 border-sky-500 text-sky-100 ring-2 ring-sky-500/30'
                      : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800 hover:border-slate-700 text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl p-1 bg-slate-950 rounded-lg border border-slate-800">
                      {u.avatar}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-100 group-hover:text-sky-300 transition-colors">
                          {u.nombre}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-sky-400 border border-slate-800">
                          {u.rol}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 block truncate">
                        {u.email}
                      </span>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {esActivo ? (
                      <CheckCircle2 className="h-5 w-5 text-teal-400" />
                    ) : (
                      <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Formulario Manual Opcional */}
        <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 space-y-3">
          <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
            O ingrese con otro correo institucional:
          </span>

          <form onSubmit={handleCustomLogin} className="space-y-2.5">
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="email"
                placeholder="ejemplo@eneisoft.edu.pe"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="relative">
              <KeyRound className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
              <input
                type="password"
                placeholder="•••••••• (opcional en demo)"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-2 rounded-lg transition-colors border border-slate-700"
            >
              <LogIn className="h-3.5 w-3.5" />
              <span>Entrar con Credenciales</span>
            </button>
          </form>
        </div>

        {/* Aviso de Sesión Efímera */}
        <p className="text-[11px] text-center text-slate-500 leading-relaxed">
          Sesión efímera gestionada localmente por Zustand. No se requiere registro en base de datos para evaluar el prototipo.
        </p>
      </div>
    </main>
  );
}
