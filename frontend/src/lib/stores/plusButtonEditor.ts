import { writable } from 'svelte/store';
import type { Writable } from 'svelte/store';

export const buttonPosition = writable<{ top: number; left: number }>({ top: 0, left: 0 });
export const displayPlus: Writable<boolean> = writable(false);
export const displayTypeButtons: Writable<boolean> = writable(false);
