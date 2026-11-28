import prettier from 'eslint-config-prettier';
import path from 'node:path';
import js from '@eslint/js';
import svelte from 'eslint-plugin-svelte';
import { defineConfig, includeIgnoreFile } from 'eslint/config';
import globals from 'globals';
import ts from 'typescript-eslint';

const gitignorePath = path.resolve(import.meta.dirname, '.gitignore');

/*
 * Layer rules for src/lib: dependencies point one way.
 *
 *   model     → nothing from the app (pure domain types and helpers)
 *   engine    → model
 *   storage   → model
 *   ui        → nothing from the app (generic primitives)
 *   features  → everything except server
 *   server    → model only
 *
 * Relative parent imports (../) are banned in src/lib, so every import
 * across folders uses #lib/... and these rules can see it.
 */
const forbiddenLayers = {
	model: ['engine', 'storage', 'ui', 'features', 'server'],
	engine: ['storage', 'ui', 'features', 'server'],
	storage: ['engine', 'ui', 'features', 'server'],
	ui: ['model', 'engine', 'storage', 'features', 'server'],
	features: ['server'],
	server: ['engine', 'storage', 'ui', 'features']
};

/** @typedef {keyof typeof forbiddenLayers} Layer */

/** @type {Layer[]} */
const LAYERS = ['model', 'engine', 'storage', 'ui', 'features', 'server'];

/** @type {Layer[]} */
const frameworkFree = ['model', 'engine'];

const noParentImports = {
	regex: '^\\.\\./',
	message: 'Use #lib/... instead of ../ so the layer rules can check this import.'
};

/**
 * @param {Layer} layer
 * @returns {import('eslint').Linter.Config}
 */
function layerRules(layer) {
	const patterns = [
		noParentImports,
		{
			regex: `^#lib/(${forbiddenLayers[layer].join('|')})(/|$)`,
			message: `${layer}/ must not import from: ${forbiddenLayers[layer].join(', ')}. See the layer rules in eslint.config.js.`
		}
	];

	if (frameworkFree.includes(layer)) {
		patterns.push({
			regex: '^(svelte|\\$app)(/|$)',
			message: `${layer}/ stays framework-free: no svelte or $app imports.`
		});
	}

	return {
		files: [`src/lib/${layer}/**`],
		rules: { 'no-restricted-imports': ['error', { patterns }] }
	};
}

export default defineConfig(
	includeIgnoreFile(gitignorePath),
	js.configs.recommended,
	ts.configs.recommended,
	svelte.configs.recommended,
	prettier,
	svelte.configs.prettier,
	{
		languageOptions: { globals: { ...globals.browser, ...globals.node } },
		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			'no-undef': 'off'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: ts.parser
			}
		}
	},
	{
		// Files directly in src/lib (index.ts, assets) only get the ../ ban.
		files: ['src/lib/**'],
		/** @type {import('eslint').Linter.RulesRecord} */
		rules: { 'no-restricted-imports': ['error', { patterns: [noParentImports] }] }
	},
	// Later blocks override the one above for files inside a layer.
	...LAYERS.map(layerRules)
);
