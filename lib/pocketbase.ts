import PocketBase from "pocketbase";

/** Cliente PocketBase para el navegador. La integración/colecciones las provee otro equipo. */
export const pb = new PocketBase(
  process.env.NEXT_PUBLIC_POCKETBASE_URL ?? "http://127.0.0.1:8090",
);
