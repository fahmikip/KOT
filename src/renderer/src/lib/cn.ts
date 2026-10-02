/** Gabungkan class name, abaikan nilai falsy. Tanpa dependensi eksternal. */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ')
}