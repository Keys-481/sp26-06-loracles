import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";
import css from "@eslint/css";
import { defineConfig } from "eslint/config";
import stylistic from "@stylistic/eslint-plugin";

export default defineConfig([
  { 
    files: ["**/*.{js,mjs,cjs,jsx}"], 
    plugins: { 
      js,
      "@stylistic": stylistic
    }, 
    extends: ["js/recommended"], 
    languageOptions: { 
      globals: globals.browser    
    },
    rules: {
      "@stylistic/indent": ['error', 2]
    }
  },
  pluginReact.configs.flat.recommended,
  { 
    files: ["**/*.css"], 
    plugins: { 
      css,
      "@stylistic": stylistic
    }, 
    language: "css/css", 
    extends: ["css/recommended"],
    rules: {
      "@stylistic/indent": ['error', 2]
    }
  },
]);
