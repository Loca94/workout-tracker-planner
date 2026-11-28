import type { ResolvedWorkout } from '#lib/model/resolveWorkout.ts';
import { amrapSegments } from './amrapSegments';
import { emomSegments } from './emomSegments';
import type { Segment, Timeline } from './timeline';

export type TimelineOptions = {
	prepSec?: number;
};

const DEFAULT_PREP_SEC = 10;

export function buildTimeline(resolved: ResolvedWorkout, options: TimelineOptions = {}): Timeline {
	const prepMs = (options.prepSec ?? DEFAULT_PREP_SEC) * 1000;
	const segments: Segment[] = [];

	if (prepMs > 0) {
		segments.push({ startMs: 0, endMs: prepMs, kind: 'prep' });
	}

	for (const segment of modeSegments(resolved)) {
		segments.push({ ...segment, startMs: segment.startMs + prepMs, endMs: segment.endMs + prepMs });
	}

	return {
		totalMs: segments[segments.length - 1].endMs,
		segments,
		alerts: []
	};
}

function modeSegments({ workout, items }: ResolvedWorkout): Segment[] {
	switch (workout.mode) {
		case 'emom':
			return emomSegments(workout.config, items);
		case 'amrap':
			return amrapSegments(workout.config);
		case 'intervals':
			throw new Error('Timelines for intervals workouts are not supported yet');
	}
}
