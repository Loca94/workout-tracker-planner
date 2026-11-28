import type { ResolvedItem } from '#lib/model/resolveWorkout.ts';
import type { EmomConfig } from '#lib/model/workout.ts';
import { holdSegments } from './holdSegments';
import type { Segment } from './timeline';

/**
 * One item per interval, cycling A → B → C → A. Segments start at 0; buildTimeline() adds the prep.
 * A reps item fills its interval. A hold is timed (left then right when per side), and the rest
 * of the interval becomes a rest segment.
 */
export function emomSegments(config: EmomConfig, items: ResolvedItem[]): Segment[] {
	const intervalMs = config.intervalSec * 1000;
	const segments: Segment[] = [];

	for (let i = 0; i < config.intervals; i++) {
		const itemIndex = i % items.length;
		const item = items[itemIndex];
		const startMs = i * intervalMs;
		const endMs = startMs + intervalMs;

		if (item.kind === 'reps') {
			segments.push({ startMs, endMs, kind: 'work', itemIndex });
			continue;
		}

		const holds = holdSegments(item, itemIndex, startMs);
		segments.push(...holds);

		const holdEndMs = holds[holds.length - 1].endMs;
		if (holdEndMs < endMs) {
			segments.push({ startMs: holdEndMs, endMs, kind: 'rest' });
		}
	}

	return segments;
}
