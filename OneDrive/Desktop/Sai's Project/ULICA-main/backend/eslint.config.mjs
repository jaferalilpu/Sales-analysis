import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.node,
        NodeJS: "readonly",
        Express: "readonly",
        ABTestVariant: "readonly",
      },
    },
    rules: {
      "no-unused-vars": "warn",
      "no-console": "off",
      "prefer-const": "error",
      "no-var": "error",
      "no-undef": "warn",
      "no-unreachable": "warn",
    },
  },
  {
    files: ["**/*.test.ts", "**/__tests__/**/*.ts"],
    languageOptions: {
      globals: {
        ...globals.jest,
        ...globals.node,
      },
    },
  },
  {
    ignores: ["node_modules/", "dist/", "coverage/"],
  }
);
