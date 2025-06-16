/**
 * Utility function para combinar classes CSS condicionalmente
 * Similar ao clsx/classnames mas mais simples
 */

export function cn(...classes) {
  return classes
    .filter(Boolean)
    .join(' ')
    .trim()
}

/**
 * Versão mais avançada que suporta objetos condicionais
 */
export function clsx(...args) {
  const classes = []

  for (const arg of args) {
    if (!arg) continue

    if (typeof arg === 'string' || typeof arg === 'number') {
      classes.push(arg)
    } else if (Array.isArray(arg)) {
      const inner = clsx(...arg)
      if (inner) classes.push(inner)
    } else if (typeof arg === 'object') {
      for (const key in arg) {
        if (arg[key]) classes.push(key)
      }
    }
  }

  return classes.join(' ')
}

// Export both for compatibility
export default cn