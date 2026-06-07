import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

/**
 * RTL discipline — directional Tailwind utilities (pl-/pr-/ml-/mr-/left-/right-)
 * mirror incorrectly under dir="rtl". Use logical equivalents (ps-/pe-/ms-/me-/
 * start-/end-) so layouts flip automatically on Arabic pages.
 */
const RTL_FORBIDDEN_CLASS_PATTERN =
  /\b(?:p|m)(?:l|r)-|(?:^|\s)(?:left|right)-|\b(?:border|rounded)-(?:l|r|tl|tr|bl|br)-/;

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      "no-restricted-syntax": [
        "warn",
        {
          // Block raw directional Tailwind utilities in JSX className strings.
          selector: `JSXAttribute[name.name='className'] > Literal[value=/${RTL_FORBIDDEN_CLASS_PATTERN.source}/]`,
          message:
            "Use Tailwind logical-property utilities (ps-/pe-/ms-/me-/start-/end-) instead of directional ones (pl-/pr-/ml-/mr-/left-/right-) so layouts mirror correctly under dir=\"rtl\" for Arabic.",
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
