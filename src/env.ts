import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	DEV_PAGES: {
		public: true,
		static: true,
		description:
			'Set to "true" to serve the /dev pages outside local development (Vercel previews).',
		schema: (value) => value === 'true'
	}
});
