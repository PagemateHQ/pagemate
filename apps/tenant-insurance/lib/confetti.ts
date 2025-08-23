// Lightweight confetti helper using js-confetti with sensible performance defaults.
// - Safe on SSR via dynamic import
// - Preloads on idle to avoid first-use jank
// - Uses low-cost shapes by default (no emojis)
// - Respects prefers-reduced-motion

type JSConfetti = {
	addConfetti: (options?: Record<string, unknown>) => Promise<void> | void;
	clearCanvas?: () => void;
};
let instance: JSConfetti | null = null;

export async function fireConfetti(options?: Record<string, unknown>) {
	if (typeof window === "undefined") return;

	// Respect reduced motion: either skip or drastically reduce load.
	const prefersReducedMotion =
		typeof window !== "undefined" &&
		window.matchMedia &&
		window.matchMedia("(prefers-reduced-motion: reduce)").matches;
	try {
		if (!instance) {
			const mod = (await import("js-confetti")) as {
				default: new () => JSConfetti;
			};
			instance = new mod.default();
		}
		await instance.addConfetti({
			// Use vector shapes (cheaper than emojis) by default.
			// Callers can still pass `emojis: [...]` to override.
			emojis: [],
			// Keep particle count modest; tune for smoothness.
			confettiNumber: prefersReducedMotion ? 0 : 60,
			// Slightly larger radius reduces draw calls for the same screen coverage.
			confettiRadius: 5,
			...options,
		});

		// End animations sooner to limit total rAF time (safety valve).
		if (instance.clearCanvas && !prefersReducedMotion) {
			window.setTimeout(() => instance?.clearCanvas?.(), 1400);
		}
	} catch {
		// Best-effort visual; ignore failures silently.
	}
}

// Preload and instantiate on idle to avoid first-use jank.
if (typeof window !== "undefined") {
	const prewarm = () => {
		// If already created, skip.
		if (instance) return;
		import("js-confetti")
			.then((mod: { default: new () => JSConfetti }) => {
				if (!instance) instance = new mod.default();
			})
			.catch(() => {});
	};
	// Use requestIdleCallback if available, otherwise a short timeout.
	if (typeof (window as any).requestIdleCallback === "function") {
		(window as any).requestIdleCallback(prewarm);
	} else {
		window.setTimeout(prewarm, 500);
	}
}
