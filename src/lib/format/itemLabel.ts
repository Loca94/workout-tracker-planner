import type { ResolvedItem } from '#lib/model/resolveWorkout.ts';

/** E.g. "Halo ×5 / side · 12 kg" or "Couch stretch 60 s / side". */
export function itemLabel(item: ResolvedItem): string {
	const target = item.kind === 'reps' ? `×${item.reps}` : `${item.holdSec} s`;
	const side = item.perSide ? ' / side' : '';
	const load = item.loadKg === undefined ? '' : ` · ${item.loadKg} kg`;

	return `${item.variationName} ${target}${side}${load}`;
}
