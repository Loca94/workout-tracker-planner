import type { ResolvedItem } from '#lib/model/resolveWorkout.ts';
import type { IntervalsConfig } from '#lib/model/workout.ts';
import type { Segment } from './timeline';

/**
 * A round is one pass over all items: work, then rest, for each item.
 * A hold lasts its own holdSec instead of workSec. restBetweenRoundsSec replaces the last
 * rest of each round, and the workout ends on the final work block (no trailing rest).
 */
export function intervalSegments(config: IntervalsConfig, items: ResolvedItem[]): Segment[] {
	const segments: Segment[] = [];
	let cursorMs = 0;

	for (let round = 0; round < config.rounds; round++) {
		for (const [itemIndex, item] of items.entries()) {
			const workMs = (item.kind === 'hold' ? item.holdSec : config.workSec) * 1000;
			segments.push({ startMs: cursorMs, endMs: cursorMs + workMs, kind: 'work', itemIndex });
			cursorMs += workMs;

			const isLastItemOfRound = itemIndex === items.length - 1;
			const isLastRound = round === config.rounds - 1;

			if (isLastItemOfRound && isLastRound) {
				break;
			}

			const restSec =
				isLastItemOfRound && config.restBetweenRoundsSec !== undefined
					? config.restBetweenRoundsSec
					: config.restSec;

			if (restSec > 0) {
				segments.push({ startMs: cursorMs, endMs: cursorMs + restSec * 1000, kind: 'rest' });
				cursorMs += restSec * 1000;
			}
		}
	}

	return segments;
}
