import { dev } from '$app/env';
import { DEV_PAGES } from '$app/env/public';
import { error } from '@sveltejs/kit';

export function load() {
	if (!dev && !DEV_PAGES) {
		error(404, 'Not found');
	}
}
