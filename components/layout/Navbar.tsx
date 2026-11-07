'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/useAuthStore';
import LoginModal from '@/components/auth/LoginModal';
import { Sparkles, Layers, UserCircle, LogOut } from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, isAuthenticated, ready, logout, openModal, init } = useAuthStore();

  useEffect(() => init(), [init]);

  const navLinks = [
    { href: '/', label: 'Intro', icon: Sparkles },
    { href: '/crear-clase', label: 'Crear Clase', icon: Layers }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-sky-500 via-teal-400 to-indigo-600 text-slate-950 font-bold shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
            Σ
          </div>
          <div className="flex flex-col">
            <span className="font-semibold tracking-wider text-sm text-slate-100 flex items-center gap-1.5">
              ENEISOFT <span className="text-sky-400 text-xs font-mono font-bold">XVI</span>
            </span>
            <span className="text-[10px] text-slate-400 -mt-0.5 tracking-tight">Active Math & Visual Engine</span>
          </div>
        </Link>

        {/* Links principales */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-sky-500/15 text-sky-300 border border-sky-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sesión de PocketBase */}
        <div className="flex items-center gap-3 min-w-[110px] justify-end">
          {!ready ? null : isAuthenticated && user ? (
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full px-3 py-1">
              <UserCircle className="h-4 w-4 text-sky-400" />
              <span className="hidden sm:block text-xs font-medium text-slate-200 max-w-[160px] truncate">
                {user.email}
              </span>
              <button
                onClick={logout}
                title="Cerrar sesión"
                className="ml-1 text-slate-400 hover:text-rose-400 p-0.5 rounded transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={openModal}
              className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold text-xs px-3.5 py-1.5 rounded-full shadow-md shadow-sky-500/20 transition-all hover:scale-102"
            >
              <UserCircle className="h-3.5 w-3.5" />
              <span>Iniciar sesión</span>
            </button>
          )}
        </div>
      </div>
      <LoginModal />
    </header>
  );
};

export default Navbar;
