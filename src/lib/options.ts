/** Narrows a string from a form control to one of a known set of options. */
export function asOption<T extends string>(options: readonly T[], value: string): T | null {
  return options.find((option) => option === value) ?? null;
}

export function toggleValue<T>(list: readonly T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}
