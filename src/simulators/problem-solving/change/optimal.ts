export interface ChangeSolution {
  count: number
  coins: number[]
}

export function optimalChange(amount: number, coins: readonly number[]): ChangeSolution | null {
  if (
    !Number.isInteger(amount) ||
    amount < 0 ||
    !coins.length ||
    coins.some(coin => !Number.isInteger(coin) || coin <= 0)
  )
    return null
  if (amount === 0) return { count: 0, coins: [] }

  const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : a)
  const scale = coins.reduce((common, coin) => gcd(common, coin), amount)
  const target = amount / scale
  const scaledCoins = coins.map(coin => coin / scale)
  const best = Array<number>(target + 1).fill(Number.POSITIVE_INFINITY)
  const previous = Array<number>(target + 1).fill(-1)
  best[0] = 0
  for (let value = 1; value <= target; value += 1) {
    for (const coin of scaledCoins) {
      if (coin <= value && best[value - coin] + 1 < best[value]) {
        best[value] = best[value - coin] + 1
        previous[value] = coin
      }
    }
  }
  if (!Number.isFinite(best[target])) return null
  const result: number[] = []
  for (let value = target; value > 0; value -= previous[value]) result.push(previous[value] * scale)
  return { count: best[target], coins: result }
}
