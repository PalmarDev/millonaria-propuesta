"use client";

import { useMemo, useState } from "react";
import confetti from "canvas-confetti";

type Question = {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  hint: string;
  isFinal?: boolean;
};

type FiftyState = { eliminate: number[] } | null;

const PRIZES = [
  "$100",
  "$200",
  "$300",
  "$500",
  "$1,000",
  "$2,000",
  "$4,000",
  "$8,000",
  "$16,000",
  "$32,000",
] as const;

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: "Para calentar: ¿Cuál es mi color favorito?",
    options: ["Negro", "Azul", "Rojo", "Verde"],
    correctIndex: 0,
    hint: "Casi siempre lo uso 😄",
  },
  {
    id: 2,
    question: "Si salimos a comer, ¿qué me hace más feliz pedir contigo?",
    options: ["Pizza", "Sushi", "Hamburguesa", "Tacos"],
    correctIndex: 1,
    hint: "Me encantó compartir tu primera vez.",
  },
  {
    id: 3,
    question: "¿Qué prefiero un domingo contigo?",
    options: ["Cine", "Casa + manta", "Salir a caminar", "Viaje improvisado"],
    correctIndex: 1,
    hint: "Plan simple, pero perfecto.",
  },
  {
    id: 4,
    question: "¿Qué cosa me derrite de ti?",
    options: ["Tu risa", "Tus nalgas", "Tu forma de ser", "Todo lo anterior"],
    correctIndex: 3,
    hint: "No puedo escoger solo una.",
  },
  {
    id: 5,
    question: "Nivel medio: ¿Qué me gusta más de programar?",
    options: ["Backend", "Frontend", "Diseño", "Nada 😅"],
    correctIndex: 0,
    hint: "Me encanta que sea seguro y pro.",
  },
  {
    id: 6,
    question: "¿Qué detalle valoro más en una relación?",
    options: ["Lealtad", "Dinero", "Celos", "Competencia"],
    correctIndex: 0,
    hint: "Sin eso, nada tiene sentido.",
  },
  {
    id: 7,
    question: "Si te digo 'vamos a hacer algo simple', ¿qué termina pasando?",
    options: [
      "Terminamos comiéndonos algo rico",
      "Nos reímos demasiado",
      "Se vuelve un plan épico",
      "Todas",
    ],
    correctIndex: 3,
    hint: "Siempre se nos va de las manos 😂",
  },
  {
    id: 8,
    question: "Pregunta difícil: ¿Qué me hace sentir en paz contigo?",
    options: ["Tu presencia", "Tu apoyo", "Tu forma de querer", "Todo junto"],
    correctIndex: 3,
    hint: "Es una mezcla peligrosa 💘",
  },
  {
    id: 9,
    question: "Casi final: ¿Qué palabra describe lo que siento por ti?",
    options: ["Cariño", "Costumbre", "Aventura", "Amor"],
    correctIndex: 3,
    hint: "No es pequeño… es grande.",
  },
  {
    id: 10,
    question: "Última pregunta (la más importante): ¿Quieres ser mi novia? 💖",
    options: [
      "Sí ❤️",
      "Sí, pero con más drama 😄",
      "Obvio que sí ✨",
      "Tengo que pensarlo…",
    ],
    correctIndex: 0,
    hint: "Respira… y elige lo que sientes 😌",
    isFinal: true,
  },
];

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(" ");
}

export default function Page() {
  const total = QUESTIONS.length;

  const [index, setIndex] = useState<number>(0);
  const [locked, setLocked] = useState<boolean>(false);
  const [selected, setSelected] = useState<number | null>(null);

  const [status, setStatus] = useState<"PLAYING" | "LOSE" | "WIN">("PLAYING");
  const [showConfirm, setShowConfirm] = useState<boolean>(false);

  // Lifelines
  const [used5050, setUsed5050] = useState<boolean>(false);
  const [usedHint, setUsedHint] = useState<boolean>(false);
  const [usedSecondChance, setUsedSecondChance] = useState<boolean>(false);
  const [secondChanceArmed, setSecondChanceArmed] = useState<boolean>(false);

  const q = QUESTIONS[index];
  const prize = PRIZES[index] ?? "$∞";

  const [fiftyState, setFiftyState] = useState<FiftyState>(null);

  const availableOptions = useMemo(() => {
    if (!fiftyState) return q.options.map((t, i) => ({ t, i, hidden: false }));
    const hidden = new Set<number>(fiftyState.eliminate);
    return q.options.map((t, i) => ({ t, i, hidden: hidden.has(i) }));
  }, [q.options, fiftyState]);

  function resetForNext() {
    setLocked(false);
    setSelected(null);
    setShowConfirm(false);
    setSecondChanceArmed(false);
    setFiftyState(null);
  }

  function goNext() {
    if (index + 1 >= total) return;
    setIndex((x) => x + 1);
    resetForNext();
  }

  function loseGame() {
    setStatus("LOSE");
    setLocked(true);
  }

  function winGame() {
    setStatus("WIN");
    setLocked(true);
    confetti({
      particleCount: 180,
      spread: 70,
      origin: { y: 0.7 },
    });
  }

  function onPick(i: number) {
    if (locked || status !== "PLAYING") return;
    if (fiftyState?.eliminate?.includes(i)) return;

    setSelected(i);
    setShowConfirm(true);
  }

  function confirmAnswer() {
    if (selected === null) return;

    setShowConfirm(false);
    setLocked(true);

    // Final romántico
    if (q.isFinal) {
      const pickedText = q.options[selected];
      const isYes =
        pickedText.toLowerCase().includes("sí") ||
        pickedText.toLowerCase().includes("si") ||
        pickedText.toLowerCase().includes("obvio");

      if (isYes) {
        winGame();
      } else {
        setTimeout(() => {
          setLocked(false);
          setSelected(null);
          alert(
            "Te entiendo 😌 Solo quería que supieras que me encantas. Cuando estés lista… vuelve a elegir 💖",
          );
        }, 250);
      }
      return;
    }

    const correct = selected === q.correctIndex;

    setTimeout(() => {
      if (correct) {
        if (index === total - 1) winGame();
        else goNext();
      } else {
        if (secondChanceArmed) {
          setSecondChanceArmed(false);
          setUsedSecondChance(true);
          setLocked(false);
          setSelected(null);
          alert("¡Segunda oportunidad! 😄 Intenta de nuevo.");
          return;
        }
        loseGame();
      }
    }, 350);
  }

  function use5050() {
    if (used5050 || locked || status !== "PLAYING") return;
    setUsed5050(true);

    // Elimina 2 opciones incorrectas al azar
    const wrongs = q.options.map((_, i) => i).filter((i) => i !== q.correctIndex);

    for (let i = wrongs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [wrongs[i], wrongs[j]] = [wrongs[j], wrongs[i]];
    }

    const eliminate = wrongs.slice(0, 2);
    setFiftyState({ eliminate });
  }

  function useHint() {
    if (usedHint || locked || status !== "PLAYING") return;
    setUsedHint(true);
    alert(`Pista: ${q.hint}`);
  }

  function armSecondChance() {
    if (usedSecondChance || secondChanceArmed || locked || status !== "PLAYING") return;
    setSecondChanceArmed(true);
    alert("Segunda oportunidad activada ✅ Si fallas esta, te dejo reintentar una vez.");
  }

  function restart() {
    setIndex(0);
    setStatus("PLAYING");
    setLocked(false);
    setSelected(null);
    setShowConfirm(false);
    setUsed5050(false);
    setUsedHint(false);
    setUsedSecondChance(false);
    setSecondChanceArmed(false);
    setFiftyState(null);
  }

  return (
    <main className='min-h-screen bg-gradient-to-b from-black via-slate-950 to-slate-900 text-white flex items-center justify-center p-4'>
      <div className='w-full max-w-md'>
        <header className='mb-4'>
          <div className='flex items-center justify-between'>
            <div className='text-sm text-slate-300'>
              Pregunta <span className='font-semibold'>{index + 1}</span> / {total}
            </div>
            <div className='text-sm text-slate-300'>
              Premio: <span className='font-semibold'>{prize}</span>
            </div>
          </div>

          <h1 className='mt-3 text-xl font-bold tracking-tight'>
            ¿Quién quiere ser… <span className='line-through'>Millo</span> Mi Novia? 😄
          </h1>

          <div className='mt-3 flex gap-2'>
            <button
              onClick={use5050}
              disabled={used5050 || locked || status !== "PLAYING"}
              className={classNames(
                "px-3 py-2 rounded-xl text-sm border",
                used5050
                  ? "opacity-40 border-slate-700"
                  : "border-slate-600 hover:border-slate-400",
              )}>
              50/50
            </button>

            <button
              onClick={useHint}
              disabled={usedHint || locked || status !== "PLAYING"}
              className={classNames(
                "px-3 py-2 rounded-xl text-sm border",
                usedHint
                  ? "opacity-40 border-slate-700"
                  : "border-slate-600 hover:border-slate-400",
              )}>
              Pista
            </button>

            <button
              onClick={armSecondChance}
              disabled={
                usedSecondChance || secondChanceArmed || locked || status !== "PLAYING"
              }
              className={classNames(
                "px-3 py-2 rounded-xl text-sm border",
                usedSecondChance
                  ? "opacity-40 border-slate-700"
                  : "border-slate-600 hover:border-slate-400",
              )}>
              {secondChanceArmed ? "2ª oportunidad ✅" : "2ª oportunidad"}
            </button>
          </div>
        </header>

        <section className='rounded-2xl border border-slate-700 bg-slate-950/50 p-4 shadow-xl'>
          <div className='text-sm text-slate-300 mb-2'>
            {q.isFinal ? "🔥 Pregunta FINAL" : "Responde con calma…"}
          </div>

          <h2 className='text-lg font-semibold leading-snug'>{q.question}</h2>

          <div className='mt-4 grid gap-3'>
            {availableOptions.map((opt) => {
              if (opt.hidden) {
                return (
                  <button
                    key={opt.i}
                    disabled
                    className='rounded-xl border border-slate-800 bg-slate-900/30 px-4 py-3 text-left opacity-30'>
                    —
                  </button>
                );
              }

              const isPicked = selected === opt.i;

              return (
                <button
                  key={opt.i}
                  onClick={() => onPick(opt.i)}
                  disabled={locked || status !== "PLAYING"}
                  className={classNames(
                    "rounded-xl border px-4 py-3 text-left transition",
                    isPicked
                      ? "border-white bg-slate-800"
                      : "border-slate-700 bg-slate-900/30 hover:border-slate-400",
                  )}>
                  <span className='mr-2 font-bold'>
                    {String.fromCharCode(65 + opt.i)}.
                  </span>
                  {opt.t}
                </button>
              );
            })}
          </div>

          {status === "LOSE" && (
            <div className='mt-4 rounded-xl border border-red-500/40 bg-red-950/40 p-3'>
              <div className='font-semibold'>Oh no 😅</div>
              <div className='text-sm text-slate-200'>
                Te doy revancha. Dale “Reiniciar”.
              </div>
            </div>
          )}

          {status === "WIN" && (
            <div className='mt-4 rounded-xl border border-pink-500/40 bg-pink-950/30 p-3'>
              <div className='font-semibold text-lg'>¡SÍÍÍ! 💘</div>
              <div className='text-sm text-slate-200'>
                Oficialmente… me hiciste el más feliz.
              </div>
            </div>
          )}

          <div className='mt-4 flex gap-2'>
            <button
              onClick={restart}
              className='flex-1 rounded-xl border border-slate-700 bg-slate-900/30 px-4 py-3 hover:border-slate-400'>
              Reiniciar
            </button>

            <button
              onClick={() => alert("Tip: Diviértete y mira lo que puedo hacer... 😄")}
              className='rounded-xl border border-slate-700 bg-slate-900/30 px-4 py-3 hover:border-slate-400'>
              ℹ️
            </button>
          </div>
        </section>

        {showConfirm && selected !== null && (
          <div className='fixed inset-0 bg-black/70 flex items-center justify-center p-4'>
            <div className='w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-950 p-4'>
              <div className='text-sm text-slate-300'>Confirmación</div>
              <div className='mt-2 font-semibold'>
                ¿Seguro que eliges:{" "}
                <span className='text-white'>
                  {String.fromCharCode(65 + selected)}. {q.options[selected]}
                </span>
                ?
              </div>

              <div className='mt-4 flex gap-2'>
                <button
                  onClick={() => setShowConfirm(false)}
                  className='flex-1 rounded-xl border border-slate-700 bg-slate-900/30 px-4 py-3 hover:border-slate-400'>
                  Cambiar
                </button>
                <button
                  onClick={confirmAnswer}
                  className='flex-1 rounded-xl border border-pink-500/60 bg-pink-600/20 px-4 py-3 hover:border-pink-300'>
                  Confirmar
                </button>
              </div>

              <div className='mt-3 text-xs text-slate-400'>
                *Si activaste 2ª oportunidad, te salva una vez 😄
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
