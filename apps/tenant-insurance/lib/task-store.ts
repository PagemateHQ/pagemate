"use client";

import { create } from "zustand";

type TaskStore = {
	label: string | null;
	startedAt: number | null;
	finishedAt: number | null;
	running: boolean;
	start: (label?: string) => void;
	begin: (label: string) => void;
	stop: (label?: string) => void;
	clear: () => void;
};

export const useTaskStore = create<TaskStore>((set, get) => ({
	label: null,
	startedAt: null,
	finishedAt: null,
	running: false,
	start: (label) => {
		const now = Date.now();
		// If already running, ignore additional starts
		if (get().running) return;
		set({
			label: label ?? get().label ?? "Demo Task",
			startedAt: now,
			finishedAt: null,
			running: true,
		});
	},
	begin: (label) => {
		// Force (re)start a task regardless of prior state
		const now = Date.now();
		set({ label, startedAt: now, finishedAt: null, running: true });
	},
	stop: (label) => {
		if (!get().running) return;
		set({
			running: false,
			finishedAt: Date.now(),
			label: label ?? get().label,
		});
	},
	clear: () =>
		set({ label: null, startedAt: null, finishedAt: null, running: false }),
}));
