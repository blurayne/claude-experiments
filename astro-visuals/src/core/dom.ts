/**
 * getElementById, shortened. 159 element ids are reached through it with no null check, so a
 * missing id is a TypeError at the call site rather than a silent undefined — which is what
 * you want, and what tests/e2e/boot.spec.ts asserts against the whole list up front.
 */
export const $ = (id: string): HTMLElement => document.getElementById(id) as HTMLElement

/**
 * The same lookup, typed for a control that carries a value.
 *
 * Most of the interface is read and written through `.value`, `.checked` and
 * `.selectedOptions`, and `HTMLElement` has none of those. This is one cast in one place
 * instead of one at every call site — and it stays a cast rather than a runtime check because
 * the id list is asserted whole by the boot suite: if the element is there, it is the control
 * the markup says it is.
 */
export const $v = (id: string): HTMLInputElement & HTMLSelectElement =>
  document.getElementById(id) as HTMLInputElement & HTMLSelectElement
