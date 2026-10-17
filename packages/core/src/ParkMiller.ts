/**
 * A repeatable stream of random numbers from 0 up to 1:  Park and Miller's "minimal standard" generator.
 * - Each number comes from the one before, so the same seed gives the same numbers in the same order.
 * - What every random thing in the core draws from:  `spellCore.random()`, `seedRandom()`, `shuffled()` ...
 * - Python's core has the very same one (`ParkMiller`, in `py/spell_core/seeded_random.py`),
 *   so one seed deals the same cards on every target (epic page python-target, Q13).
 *
 * ```ts
 * const generator = new ParkMiller(1)
 * generator.random() // 0.000007825903601782307, then 0.13153778773875702 ...
 * ```
 */
export class ParkMiller {
  /** The last number made, from which the next one comes:  starts as the seed. */
  state: number

  /**
   * A generator starting from `seed`:  a whole number from 1 to 2,147,483,646.
   * - NOT checked, as Python's isn't:  0 gives only 0s, and a negative seed gives negative numbers.
   */
  constructor(seed: number) {
    this.state = seed
  }

  /**
   * A seed picked with `Math.random()`:  where the core starts when nothing seeds it,
   * so an unseeded program deals differently every run.
   */
  static randomSeed(): number {
    return 1 + Math.floor(Math.random() * (PARK_MILLER_MODULUS - 1))
  }

  /** The next number:  at least 0 and less than 1. */
  random(): number {
    this.state = (this.state * PARK_MILLER_MULTIPLIER) % PARK_MILLER_MODULUS
    return (this.state - 1) / (PARK_MILLER_MODULUS - 1)
  }
}

/** What the generator divides by:  2,147,483,647 is 2 ** 31 - 1, a prime. */
const PARK_MILLER_MODULUS = 2147483647

/** What the generator multiplies by. */
const PARK_MILLER_MULTIPLIER = 16807
