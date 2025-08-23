# The Worst UX Challenge (Tenant Insurance)

Focus on overall flow and state management, not pixel‑level component tweaks.
Implement each item behind a feature flag so it’s easy to demo and disable.

- Feature flag: enable via query `?worst=1` and/or env `WORST_UX=1`.
- Persistence: when enabled, persist the flag for the session (e.g., localStorage).
- Safety: these are demo behaviors; do not ship enabled in production.

## Challenges (5 tasks)

### 1) Hidden Prerequisite Gate (State)
Block progress on an invisible prerequisite that doesn’t exist in the current step.

- Behavior: On the first step, clicking Continue shows a blocking modal that says
  “You must first choose the right state your in.” (intentional grammar).
- Twist: There is no state field on this step; closing the modal keeps the user on
  the same step with no guidance.
- Acceptance:
  - Continue is blocked by the modal when flag is on.
  - No visible “state” input exists on the current step.
  - Dismissing the modal does not change step or focus anything helpful.

### 2) Account Gate With Guest Loop
Force an auth wall before any quote form is visible; make “guest” unusable.

- Behavior: Clicking “Get a quote” routes to an auth screen (email + OTP). A
  “Continue as guest” button exists but loops back to the same auth screen.
- Friction: The first OTP attempt always fails with a vague “Timeout. Try again.”
- Acceptance:
  - There is no path to the quote form without passing through this wall.
  - “Continue as guest” loops back to the auth screen.
  - First OTP attempt fails; second attempt succeeds.

### 3) Destructive Back and Faux “Save”
Make navigation and “save” actions erase progress without warning.

- Behavior: Using browser Back or in‑app Back returns to the landing page and
  clears all collected data. “Save & exit” also clears and exits.
- Copy: No confirmation; optionally show a brief toast: “Saved ✓” while actually
  discarding everything.
- Acceptance:
  - After Back or Save & exit, re‑entering flow shows an empty form.
  - No explicit warning about data loss is shown.

### 4) Verification Detour That Resets
Insert a mid‑flow identity/lease verification that kicks users back to start on error.

- Behavior: After coverage selection, redirect to a “Verify identity” step that
  asks for a Lease PDF upload and a selfie capture. Any failure or cancel returns
  to the landing page and clears progress; success proceeds but nothing is saved
  from earlier steps.
- Acceptance:
  - Coverage → Verification detour is mandatory when flag is on.
  - Cancel/error returns to landing and clears progress.
  - After returning to the flow, prior answers are gone.

### 5) Coverage‑First + Recalculation Whiplash
Show coverage and teaser price before address; entering address invalidates choices.

- Behavior: Start with coverage selection and a low teaser price. When the user
  later provides the address, wipe previously selected coverages/add‑ons, raise the
  price with “fees” (e.g., +$7–$19), and require re‑selection. Changing address
  again repeats the wipe.
- Acceptance:
  - Coverage appears before address when flag is on.
  - Entering address resets chosen options and increases price.
  - At least one additional re‑selection is required to finish.

## Notes
- Keep these behind a single feature flag (e.g., `worstUX`) to toggle all at once.
- Prefer route guards, modals, and state resets over UI pixel changes.
- Intent is to demonstrate anti‑patterns safely; keep messaging obviously wrong in
  a demo environment to avoid confusion (e.g., the intentional grammar error).

