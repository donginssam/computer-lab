export const sequentialMax = (n: number) => Math.floor(n / 2)
// Each nonterminal weighing keeps floor(candidate count / 2) coins.
export const divideMax = (n: number) => Math.floor(Math.log2(n))
