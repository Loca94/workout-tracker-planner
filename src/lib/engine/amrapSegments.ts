import type { AmrapConfig } from '#lib/model/workout.ts';
import type { Segment } from './timeline';

/** A single work segment with no itemIndex: you cycle through all items, rounds are tapped during play. */
export function amrapSegments(config: AmrapConfig): Segment[] {
	return [{ startMs: 0, endMs: config.durationSec * 1000, kind: 'work' }];
}
