/**
 * getElementById, shortened. 159 element ids are reached through it with no null check, so a
 * missing id is a TypeError at the call site rather than a silent undefined — which is what
 * you want, and what tests/e2e/boot.spec.ts asserts against the whole list up front.
 */
export const $ = (id: string): HTMLElement => document.getElementById(id) as HTMLElement
