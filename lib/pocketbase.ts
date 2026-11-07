import PocketBase from 'pocketbase';

/**
 * Cliente de PocketBase para la plataforma ENEISOFT XVI.
 * Permite la persistencia de preguntas y autenticación en servidor si se habilita PocketBase,
 * manteniendo compatibilidad transparente con la sesión efímera en memoria de Zustand.
 */
const POCKETBASE_URL = process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://eneisoft-pocketbase.pockethost.io';

export const pb = new PocketBase(POCKETBASE_URL);

// Desactivar auto-cancelación para peticiones simultáneas de recursos
pb.autoCancellation(false);

export default pb;
