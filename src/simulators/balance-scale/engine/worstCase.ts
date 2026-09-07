export const sequentialWorst = (n: number) => (n % 2 === 0 ? n - 1 : n - 2)
export function divideWorst(n: number): number {
  let start = 0
  while (n > 1) {
    n = Math.floor(n / 2)
    start += n
  }
  return start
}
