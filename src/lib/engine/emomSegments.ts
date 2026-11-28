import type { ResolvedItem } from '#lib/model/resolveWorkout.ts';
import type { EmomConfig } from '#lib/model/workout.ts';
import type { Segment } from './timeline';

/** One item per interval, cycling A → B → C → A. Segments start at 0; buildTimeline() adds the prep. */
export function emomSegments(config: EmomConfig, items: ResolvedItem[]): Segment[] {
	const intervalMs = config.intervalSec * 1000;
	const segments: Segment[] = [];

	for (let i = 0; i < config.intervals; i++) {
		const itemIndex = i % items.length;

		segments.push({
			startMs: i * intervalMs,
			endMs: (i + 1) * intervalMs,
			kind: 'work',
			itemIndex
		});
	}

	return segments;
}
