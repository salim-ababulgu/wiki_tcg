/**
 * Logique pure du minuteur de paquets gratuits.
 *
 * Règles produit :
 * - un paquet gratuit toutes les 10 minutes ;
 * - on accumule jusqu'à 10 paquets en réserve ;
 * - réserve pleine → plus de minuteur, plus rien ne s'accumule.
 *
 * Ce module est isolé du stockage et de React pour pouvoir être testé.
 */

export const PACK_RESERVE_MAX = 10;
export const FREE_INTERVAL_MS = 10 * 60 * 1000;

export type PackTimer = {
  packsReady: number;
  /** Date (ms) d'arrivée du prochain paquet. 0 = pas encore initialisé. */
  nextPackAt: number;
};

export type RefillResult = {
  timer: PackTimer;
  /** Nombre de paquets apparus pendant ce rattrapage. */
  gained: number;
  /** true si la réserve est pleine : dans ce cas, aucun minuteur ne court. */
  full: boolean;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Fait avancer la réserve en fonction du temps écoulé.
 * Idempotent : appeler plusieurs fois à la même date ne change rien.
 */
export function refill(timer: PackTimer, now: number, interval: number = FREE_INTERVAL_MS): RefillResult {
  const packsReady = clamp(Math.floor(timer.packsReady) || 0, 0, PACK_RESERVE_MAX);

  // Réserve pleine : le minuteur est figé, on ne capitalise pas au-delà de 10.
  if (packsReady >= PACK_RESERVE_MAX) {
    return { timer: { packsReady: PACK_RESERVE_MAX, nextPackAt: now }, gained: 0, full: true };
  }

  // Jamais initialisé (ou valeur corrompue) : on démarre le compte à rebours maintenant.
  if (!Number.isFinite(timer.nextPackAt) || timer.nextPackAt <= 0) {
    return { timer: { packsReady, nextPackAt: now + interval }, gained: 0, full: false };
  }

  // Horloge dans le futur au-delà d'un intervalle : on recale (horloge modifiée).
  let nextPackAt = timer.nextPackAt;
  if (nextPackAt > now + interval) {
    nextPackAt = now + interval;
  }

  if (now < nextPackAt) {
    return { timer: { packsReady, nextPackAt }, gained: 0, full: false };
  }

  // Rattrapage : on ajoute les paquets manqués, sans dépasser la réserve maximale.
  const elapsedIntervals = Math.floor((now - nextPackAt) / interval) + 1;
  const gained = Math.min(elapsedIntervals, PACK_RESERVE_MAX - packsReady);
  const ready = packsReady + gained;
  const full = ready >= PACK_RESERVE_MAX;

  return {
    timer: {
      packsReady: ready,
      // Réserve pleine : le minuteur s'arrête complètement.
      nextPackAt: full ? now : nextPackAt + elapsedIntervals * interval,
    },
    gained,
    full,
  };
}

/**
 * Consomme un paquet de la réserve.
 * Si la réserve était pleine, le compte à rebours redémarre à cet instant.
 */
export function consume(timer: PackTimer, now: number, interval: number = FREE_INTERVAL_MS): PackTimer {
  const packsReady = clamp(Math.floor(timer.packsReady) || 0, 0, PACK_RESERVE_MAX);
  if (packsReady <= 0) return { packsReady: 0, nextPackAt: timer.nextPackAt || now + interval };

  const wasFull = packsReady >= PACK_RESERVE_MAX;
  return {
    packsReady: packsReady - 1,
    nextPackAt: wasFull || !timer.nextPackAt ? now + interval : timer.nextPackAt,
  };
}

/** Millisecondes restantes avant le prochain paquet, ou null si la réserve est pleine. */
export function timeLeft(timer: PackTimer, now: number): number | null {
  if (timer.packsReady >= PACK_RESERVE_MAX) return null;
  if (!timer.nextPackAt) return null;
  return Math.max(0, timer.nextPackAt - now);
}
