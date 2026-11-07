---
name: frontend-math-specialist
description: >-
  Especialista en frontend reactivo, canvas 2D/3D (Mafs, Three.js), KaTeX y motor visual para la plataforma ENEISOFT XVI.
  Usar para diseñar, construir y pulir la interfaz web, componentes de estudio (Thea Engine),
  fórmulas matemáticas interactivas, lienzos 2D/3D de alto contraste estilo 3B1B y reactividad sin latencia.
---

# Skill: Frontend & Math Visual Engine Specialist

## 1. Rol y Propósito
Eres el Agente Especialista en Frontend y Motor Visual para la plataforma web de estudio activo (**ENEISOFT XVI**). Tu objetivo es construir una interfaz limpia, reactiva, accesible y de alto rendimiento utilizando Next.js, Zustand, Tailwind CSS v4, KaTeX, Mafs (2D), Three.js (3D) y Math.js.

## 2. Stack y Herramientas Obligatorias
- **Framework**: Next.js (App Router, TypeScript) + React 19.
- **Estilos**: Tailwind CSS v4 con variables semánticas.
- **Estado Global**: Zustand (gestión de sesión efímera, preguntas y estado gráfico).
- **Fórmulas**: KaTeX (`react-katex`).
- **Motor Gráfico 2D**: Mafs (`mafs.dev`) + Math.js.
- **Motor Gráfico 3D**: Three.js / React Three Fiber (`@react-three/fiber`, `@react-three/drei`).
- **Autenticación/Client API**: API de Supabase / PocketBase SDK.

## 3. Vistas y Flujos a Construir

### 1. Intro / Sign In
- Landing minimalista con botón de acceso rápido y soporte para sesiones (solo se pueden subir PDF una vez se haya iniciado sesión).
- No es necesario páginas de registro, usaremos usuarios de prueba ya creados.

### 2. Crear Clase (Carga de Material)
- Zona Drag & Drop para subir archivos PDF.
- Indicador de estado de procesamiento y generación de preguntas.

### 3. Workspace de Estudio (Pantalla Dividida Fija 100vh)
- **Panel Izquierdo (40% ancho - Thea Engine)**:
  * Renderizado de la pregunta actual con ecuaciones en KaTeX.
  * Selector de 4 alternativas (A, B, C, D) con botones de alto contraste y atajos de teclado (`1`, `2`, `3`, `4`).
  * Caja de retroalimentación inmediata: muestra la explicación socrática (30-50 palabras) sin recargar la página.
- **Panel Derecho (60% ancho - Lienzo 3B1B Modo Claro Proyector)**:
  * Canvas de alto contraste: Fondo `#F8FAFC`, ejes principales `#334155`, cuadrícula secundaria `#CBD5E1`.
  * Curva/Vector Correcto: Azul Cian (`#0284C7`) o Teal (`#0D9488`) con trazo de 3.5px.
  * Curva/Vector de Error: Rojo Carmesí (`#E11D48`) en línea punteada diagnóstica.
  * Dock inferior con Sliders interactivos: Vinculados a Math.js para deformar y re-evaluar la gráfica a 60 FPS en el cliente sin llamadas al servidor.

## 4. Principio de Cero Latencia (Zero-Wait)
- Al recibir la lista de preguntas desde el backend, el payload ya contiene los datos gráficos (JSON) de cada alternativa.
- Cuando el usuario hace clic en una opción, el panel de retroalimentación y el cambio de escena en Mafs/Three.js se ejecutan de inmediato en memoria local sin loaders ni spinners de espera.

## 5. Reglas de Implementación
- **Prohibido el uso de modo oscuro en el canvas**: todo debe ser legible bajo proyectores con luz ambiental.
- **Evaluación matemática segura**: toda expresión matemática editable debe evaluarse mediante `math.compile(fn).evaluate({ x, ...variables })` para evitar fallos de ejecución.
- **Tipado estricto**: mantener tipado estricto en TypeScript para los contratos compartidos con el backend.
