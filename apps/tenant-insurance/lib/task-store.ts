"use client";

import { atom } from "jotai";

// Task state atoms
export const labelAtom = atom<string | null>(null);
export const startedAtAtom = atom<number | null>(null);
export const finishedAtAtom = atom<number | null>(null);
export const runningAtom = atom<boolean>(false);

// Action atoms
export const startAtom = atom(null, (get, set, label?: string) => {
  if (get(runningAtom)) return;
  const now = Date.now();
  const nextLabel = label ?? get(labelAtom) ?? "Demo Task";
  set(labelAtom, nextLabel);
  set(startedAtAtom, now);
  set(finishedAtAtom, null);
  set(runningAtom, true);
});

export const beginAtom = atom(null, (get, set, label: string) => {
  const now = Date.now();
  set(labelAtom, label);
  set(startedAtAtom, now);
  set(finishedAtAtom, null);
  set(runningAtom, true);
});

export const stopAtom = atom(null, (get, set, label?: string) => {
  if (!get(runningAtom)) return;
  set(runningAtom, false);
  set(finishedAtAtom, Date.now());
  set(labelAtom, label ?? get(labelAtom));
});

export const clearAtom = atom(null, (_get, set) => {
  set(labelAtom, null);
  set(startedAtAtom, null);
  set(finishedAtAtom, null);
  set(runningAtom, false);
});
