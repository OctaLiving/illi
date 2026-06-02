// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    // Tooling / generated / scratch — not application source, never lint.
    ignores: ['.remember/**', '.omni/**', '.pi/**', 'prisma/generated/**']
  }
)
