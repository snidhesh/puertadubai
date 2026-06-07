// Bridge file — provides the Next.js global type references that
// `next-env.d.ts` carries, but committed so CI can typecheck before
// `next build` has had a chance to generate `next-env.d.ts`.
//
// Without these, imports like `import logo from './logo.png'` fail
// type-checking in CI: "Cannot find module … or its corresponding
// type declarations." Locally everything works because `pnpm dev`
// generates `next-env.d.ts` on the side, but CI clones fresh.
//
// Picked up automatically via tsconfig.json's "**/*.ts" include glob.

/// <reference types="next" />
/// <reference types="next/image-types/global" />
