import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import css from "@eslint/css";
import { defineConfig } from "eslint/config";
import stylistic from "@stylistic/eslint-plugin";

export default defineConfig([
  {
    files: ["**/*.{mjs,cjs,jsx}"],
    plugins: {
      react,
      js,
      "@stylistic": stylistic
    },
    extends: ["js/recommended"],
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        ...globals.browser
      },
    },
    rules: {
      // Force 2 spaces for indents
      "@stylistic/indent": ["error", 2],
      "react/jsx-uses-react": "error",
      "react/jsx-uses-vars": "error",
    }
  },
  {
    files: ["**/*.js"],
    plugins: {
      js,
      "@stylistic": stylistic
    },
    rules: {
      // Force 2 spaces for indents
      "@stylistic/indent": ['error', 2]
    }
  },
  {
    files: ["**/*.css"],
    plugins: { css },
    language: "css/css",
    extends: ["css/recommended"]
  },
]);
