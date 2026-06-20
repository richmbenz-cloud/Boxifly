import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "@typescript-eslint/no-unused-vars": "off",
      // Deuda técnica preexistente: degradado a warning para no bloquear el CI.
      // Visible en editor/CI; reducir progresivamente y volver a "error".
      "@typescript-eslint/no-explicit-any": "warn",
      // Reglas del React Compiler (eslint-plugin-react-hooks v7): se adoptan de
      // forma incremental como warning para guiar el código nuevo sin bloquear
      // el CI por deuda preexistente. rules-of-hooks se mantiene en "error".
      "react-hooks/refs": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/preserve-manual-memoization": "warn",
      "react-hooks/purity": "warn",
      "react-hooks/static-components": "warn",
      "react-hooks/rules-of-hooks": "error",
    },
  },
);
