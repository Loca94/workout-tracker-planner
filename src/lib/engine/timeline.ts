export type SegmentKind = 'prep' | 'work' | 'rest';

export type Side = 'L' | 'R';

export type Segment = {
	startMs: number;
	endMs: number;
	kind: SegmentKind;
	itemIndex?: number;
	side?: Side;
	label: string;
};

export type AlertType = 'tick' | 'go' | 'switch' | 'halfway' | 'end' | 'announce';

export type Alert = {
	atMs: number;
	segmentIndex: number;
	type: AlertType;
	text?: string;
};

/** All times are milliseconds from the start of the workout. Alerts are sorted by atMs. */
export type Timeline = {
	totalMs: number;
	segments: Segment[];
	alerts: Alert[];
};

export type SegmentPosition = {
	segmentIndex: number;
	elapsedInSegmentMs: number;
};

/**
 * A segment includes its start and excludes its end, so a boundary belongs to the next segment.
 * Times outside the workout are clamped: the end of the workout belongs to the last segment.
 */
export function segmentAt(timeline: Timeline, ms: number): SegmentPosition {
	const { segments, totalMs } = timeline;

	if (segments.length === 0) {
		throw new Error('The timeline has no segments');
	}

	const clampedMs = Math.min(Math.max(ms, 0), totalMs);

	for (const [index, segment] of segments.entries()) {
		if (clampedMs < segment.endMs) {
			return { segmentIndex: index, elapsedInSegmentMs: clampedMs - segment.startMs };
		}
	}

	const lastIndex = segments.length - 1;
	const last = segments[lastIndex];

	return { segmentIndex: lastIndex, elapsedInSegmentMs: last.endMs - last.startMs };
}
