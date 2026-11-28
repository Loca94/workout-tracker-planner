import type { Alert, AlertType, Segment } from './timeline';

const TICK_SECONDS = [3, 2, 1];
const ANNOUNCE_BEFORE_MS = 5_000;
const HALFWAY_MIN_MS = 40_000;

/** When two alerts fall at the same moment, the more important one comes first. */
const TYPE_ORDER: AlertType[] = ['go', 'switch', 'end', 'halfway', 'announce', 'tick'];

export function buildAlerts(segments: Segment[]): Alert[] {
	const alerts: Alert[] = [];

	for (const [segmentIndex, segment] of segments.entries()) {
		if (segment.kind !== 'work') continue;

		const add = (type: AlertType, atMs: number) => {
			if (atMs >= 0) alerts.push({ atMs, segmentIndex, type });
		};

		if (isSideSwitch(segments[segmentIndex - 1], segment)) {
			add('switch', segment.startMs);
		} else {
			add('announce', segment.startMs - ANNOUNCE_BEFORE_MS);
			for (const seconds of TICK_SECONDS) {
				add('tick', segment.startMs - seconds * 1000);
			}
			add('go', segment.startMs);
		}

		const durationMs = segment.endMs - segment.startMs;
		if (durationMs >= HALFWAY_MIN_MS) {
			add('halfway', segment.startMs + durationMs / 2);
		}
	}

	const lastIndex = segments.length - 1;
	if (lastIndex >= 0) {
		alerts.push({ atMs: segments[lastIndex].endMs, segmentIndex: lastIndex, type: 'end' });
	}

	return alerts.sort(
		(a, b) => a.atMs - b.atMs || TYPE_ORDER.indexOf(a.type) - TYPE_ORDER.indexOf(b.type)
	);
}

/** The right half of a per-side hold: same item as the segment just before, other side. */
function isSideSwitch(previous: Segment | undefined, segment: Segment): boolean {
	return (
		previous !== undefined &&
		previous.kind === 'work' &&
		previous.itemIndex === segment.itemIndex &&
		previous.side !== undefined &&
		segment.side !== undefined &&
		previous.side !== segment.side
	);
}
