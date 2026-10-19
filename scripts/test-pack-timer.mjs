/**
 * Tests du minuteur de paquets.
 * Lancement : node scripts/test-pack-timer.mjs
 */
import { consume, refill, timeLeft, FREE_INTERVAL_MS, PACK_RESERVE_MAX } from "../src/lib/pack-timer.ts";

const MIN = 60_000;
const T0 = 1_700_000_000_000;
let failures = 0;

function check(name, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures += 1;
  console.log(`${ok ? "OK  " : "ÉCHEC"} ${name}${ok ? "" : `\n      attendu ${JSON.stringify(expected)}\n      obtenu  ${JSON.stringify(actual)}`}`);
}

// 1. État jamais initialisé : le compte à rebours doit démarrer, et être conservé.
{
  const { timer, gained } = refill({ packsReady: 0, nextPackAt: 0 }, T0);
  check("initialisation : compte à rebours posé", timer.nextPackAt, T0 + FREE_INTERVAL_MS);
  check("initialisation : aucun paquet offert", gained, 0);
  // Le point qui cassait avant : la valeur posée doit être réutilisée, pas recalculée.
  const again = refill(timer, T0 + 1000);
  check("initialisation : valeur conservée au tick suivant", again.timer.nextPackAt, T0 + FREE_INTERVAL_MS);
}

// 2. Juste avant l'échéance : rien.
{
  const start = { packsReady: 0, nextPackAt: T0 + 10 * MIN };
  check("avant l'échéance : aucun paquet", refill(start, T0 + 10 * MIN - 1).gained, 0);
}

// 3. À l'échéance : un paquet, et le minuteur repart.
{
  const start = { packsReady: 0, nextPackAt: T0 + 10 * MIN };
  const { timer, gained } = refill(start, T0 + 10 * MIN);
  check("échéance : un paquet", gained, 1);
  check("échéance : réserve à 1", timer.packsReady, 1);
  check("échéance : minuteur repoussé de 10 min", timer.nextPackAt, T0 + 20 * MIN);
}

// 4. Retour après 35 minutes : trois paquets d'un coup.
{
  const start = { packsReady: 0, nextPackAt: T0 + 10 * MIN };
  const { timer, gained } = refill(start, T0 + 35 * MIN);
  check("retour après 35 min : trois paquets", gained, 3);
  check("retour après 35 min : réserve à 3", timer.packsReady, 3);
  check("retour après 35 min : prochaine échéance", timer.nextPackAt, T0 + 40 * MIN);
}

// 5. Retour après 3 heures : plafonné à 10, et le minuteur s'arrête.
{
  const start = { packsReady: 0, nextPackAt: T0 + 10 * MIN };
  const { timer, gained, full } = refill(start, T0 + 180 * MIN);
  check("après 3 h : plafond atteint", timer.packsReady, PACK_RESERVE_MAX);
  check("après 3 h : 10 paquets gagnés", gained, PACK_RESERVE_MAX);
  check("après 3 h : minuteur arrêté", full, true);
  check("après 3 h : aucun temps restant", timeLeft(timer, T0 + 180 * MIN), null);
}

// 6. Réserve pleine : le minuteur ne tourne plus du tout.
{
  const fullTimer = { packsReady: 10, nextPackAt: T0 };
  const { timer, gained, full } = refill(fullTimer, T0 + 60 * MIN);
  check("réserve pleine : rien de plus", timer.packsReady, 10);
  check("réserve pleine : aucun gain", gained, 0);
  check("réserve pleine : minuteur figé", full, true);
  check("réserve pleine : pas de compte à rebours", timeLeft(timer, T0 + 60 * MIN), null);
}

// 7. Consommation quand la réserve est pleine : le minuteur redémarre.
{
  const now = T0 + 60 * MIN;
  const after = consume({ packsReady: 10, nextPackAt: now }, now);
  check("consommation depuis réserve pleine : 9 restants", after.packsReady, 9);
  check("consommation depuis réserve pleine : compte à rebours relancé", after.nextPackAt, now + FREE_INTERVAL_MS);
}

// 8. Consommation quand la réserve n'est pas pleine : le minuteur continue.
{
  const now = T0;
  const after = consume({ packsReady: 3, nextPackAt: now + 4 * MIN }, now);
  check("consommation normale : 2 restants", after.packsReady, 2);
  check("consommation normale : échéance inchangée", after.nextPackAt, now + 4 * MIN);
}

// 9. Consommation à zéro : on n'ouvre rien.
{
  const after = consume({ packsReady: 0, nextPackAt: T0 + 5 * MIN }, T0);
  check("réserve vide : reste à zéro", after.packsReady, 0);
}

// 10. Horloge modifiée vers le futur : on recale au lieu de donner l'infini.
{
  const start = { packsReady: 0, nextPackAt: T0 + 10 * MIN };
  const farFuture = refill(start, T0 - 5 * MIN);
  check("horloge vers le futur : reculée d'un intervalle", farFuture.timer.nextPackAt, T0 - 5 * MIN + FREE_INTERVAL_MS);
  check("horloge vers le futur : aucun paquet offert", farFuture.gained, 0);
}

// 11. Appels répétés à la même date : idempotent.
{
  const start = { packsReady: 2, nextPackAt: T0 + 10 * MIN };
  const a = refill(start, T0 + 20 * MIN).timer;
  const b = refill(a, T0 + 20 * MIN).timer;
  check("idempotence : second passage sans effet", b, a);
}

console.log(failures === 0 ? "\nTous les tests passent." : `\n${failures} test(s) en échec.`);
process.exit(failures === 0 ? 0 : 1);
