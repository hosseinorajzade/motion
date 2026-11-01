/** 75% keyboard layout: 84 keys, widths in key units (u). */
export type Kind = 'alpha' | 'mod' | 'accent'
export type Key = { id: number; row: number; x: number; z: number; w: number; kind: Kind }

type RowSpec = [number, Kind][]
const A = (n: number, w = 1): RowSpec => Array.from({ length: n }, () => [w, 'alpha'])

const ROWS: RowSpec[] = [
  [[1, 'accent'], ...Array.from({ length: 12 }, (): [number, Kind] => [1, 'mod']), [1, 'mod'], [1, 'mod'], [1, 'mod']],
  [...A(13), [2, 'mod'], [1, 'mod']],
  [[1.5, 'mod'], ...A(12), [1.5, 'mod'], [1, 'mod']],
  [[1.75, 'mod'], ...A(11), [2.25, 'accent'], [1, 'mod']],
  [[2.25, 'mod'], ...A(10), [1.75, 'mod'], [1, 'mod'], [1, 'mod']],
  [[1.25, 'mod'], [1.25, 'mod'], [1.25, 'mod'], [6.25, 'alpha'], [1, 'mod'], [1, 'mod'], [1, 'mod'], [1, 'mod'], [1, 'mod'], [1, 'mod']],
]

export const BOARD_W = 16
export const ROW_GAP_AFTER_F = 0.25
export const BOARD_D = ROWS.length + ROW_GAP_AFTER_F

export const KEYS: Key[] = (() => {
  const keys: Key[] = []
  let id = 0
  ROWS.forEach((row, r) => {
    let x = -BOARD_W / 2
    const z = -BOARD_D / 2 + r + 0.5 + (r > 0 ? ROW_GAP_AFTER_F : 0)
    for (const [w, kind] of row) {
      keys.push({ id: id++, row: r, x: x + w / 2, z, w, kind })
      x += w
    }
  })
  return keys
})()

export const ESC = KEYS[0]
export const ENTER = KEYS.find((k) => k.kind === 'accent' && k.w > 2)!
