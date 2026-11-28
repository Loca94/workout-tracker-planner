import type { ResolvedItem } from '#lib/model/resolveWorkout.ts';
import type { Segment } from './timeline';

export type ResolvedHold = Extract<ResolvedItem, { kind: 'hold' }>;

/** A per-side hold becomes two segments, left then right, each lasting holdSec. */
export function holdSegments(hold: ResolvedHold, itemIndex: number, startMs: number): Segment[] {
	const holdMs = hold.holdSec * 1000;

	if (!hold.perSide) {
		return [{ startMs, endMs: startMs + holdMs, kind: 'work', itemIndex }];
	}

	return [
		{ startMs, endMs: startMs + holdMs, kind: 'work', itemIndex, side: 'L' },
		{ startMs: startMs + holdMs, endMs: startMs + 2 * holdMs, kind: 'work', itemIndex, side: 'R' }
	];
}
