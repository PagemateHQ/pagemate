// Lightweight confetti helper using js-confetti. Safe on SSR via dynamic import.

type JSConfetti = {
	addConfetti: (options?: Record<string, unknown>) => Promise<void> | void;
};
let instance: JSConfetti | null = null;

export async function fireConfetti(options?: Record<string, unknown>) {
	if (typeof window === "undefined") return;
	try {
		if (!instance) {
			const mod = (await import("js-confetti")) as {
				default: new () => JSConfetti;
			};
			instance = new mod.default();
		}
		await instance.addConfetti({
			// Nice defaults; callers can override via `options`.
			emojis: ["🎉", "🎊", "✨", "🎈"],
			confettiNumber: 120,
			confettiRadius: 4,
			...options,
		});
	} catch {
		// Best-effort visual; ignore failures silently.
	}
}
