import { describe, expect, it } from 'vitest';
import { buildAlerts } from './alerts';
import type { Alert, Segment } from './timeline';

function compact(alerts: Alert[]) {
	return alerts.map((alert) => `${alert.atMs / 1000}s ${alert.type} #${alert.segmentIndex}`);
}

describe('buildAlerts', () => {
	it('matches the 2-minute EMOM example', () => {
		const segments: Segment[] = [
			{ startMs: 0, endMs: 10_000, kind: 'prep' },
			{ startMs: 10_000, endMs: 70_000, kind: 'work', itemIndex: 0 },
			{ startMs: 70_000, endMs: 130_000, kind: 'work', itemIndex: 1 }
		];

		expect(compact(buildAlerts(segments))).toEqual([
			'5s announce #1',
			'7s tick #1',
			'8s tick #1',
			'9s tick #1',
			'10s go #1',
			'40s halfway #1',
			'65s announce #2',
			'67s tick #2',
			'68s tick #2',
			'69s tick #2',
			'70s go #2',
			'100s halfway #2',
			'130s end #2'
		]);
	});

	it('skips halfway on work shorter than 40 seconds', () => {
		const segments: Segment[] = [
			{ startMs: 0, endMs: 10_000, kind: 'prep' },
			{ startMs: 10_000, endMs: 30_000, kind: 'work', itemIndex: 0 },
			{ startMs: 30_000, endMs: 40_000, kind: 'rest' },
			{ startMs: 40_000, endMs: 60_000, kind: 'work', itemIndex: 0 }
		];

		const types = buildAlerts(segments).map((alert) => alert.type);

		expect(types).not.toContain('halfway');
	});

	it('counts down during rest before the next work block', () => {
		const segments: Segment[] = [
			{ startMs: 0, endMs: 20_000, kind: 'work', itemIndex: 0 },
			{ startMs: 20_000, endMs: 30_000, kind: 'rest' },
			{ startMs: 30_000, endMs: 50_000, kind: 'work', itemIndex: 0 }
		];

		expect(compact(buildAlerts(segments))).toEqual([
			'0s go #0',
			'25s announce #2',
			'27s tick #2',
			'28s tick #2',
			'29s tick #2',
			'30s go #2',
			'50s end #2'
		]);
	});

	it('uses switch instead of go between the left and right side of a hold', () => {
		const segments: Segment[] = [
			{ startMs: 0, endMs: 30_000, kind: 'work', itemIndex: 0, side: 'L' },
			{ startMs: 30_000, endMs: 60_000, kind: 'work', itemIndex: 0, side: 'R' }
		];

		expect(compact(buildAlerts(segments))).toEqual(['0s go #0', '30s switch #1', '60s end #1']);
	});

	it('treats the next per-side item as a new start, not a switch', () => {
		const segments: Segment[] = [
			{ startMs: 0, endMs: 30_000, kind: 'work', itemIndex: 0, side: 'R' },
			{ startMs: 30_000, endMs: 60_000, kind: 'work', itemIndex: 1, side: 'L' }
		];

		const typesAt30s = buildAlerts(segments)
			.filter((alert) => alert.atMs === 30_000)
			.map((alert) => alert.type);

		expect(typesAt30s).toEqual(['go']);
	});

	it('never schedules alerts before the workout starts', () => {
		const segments: Segment[] = [{ startMs: 0, endMs: 20_000, kind: 'work', itemIndex: 0 }];

		expect(buildAlerts(segments).every((alert) => alert.atMs >= 0)).toBe(true);
	});

	it('returns alerts sorted by time, important ones first on ties', () => {
		const segments: Segment[] = [
			{ startMs: 0, endMs: 10_000, kind: 'work', itemIndex: 0 },
			{ startMs: 10_000, endMs: 15_000, kind: 'work', itemIndex: 1 },
			{ startMs: 15_000, endMs: 60_000, kind: 'work', itemIndex: 2 }
		];

		const alerts = buildAlerts(segments);
		const times = alerts.map((alert) => alert.atMs);

		expect(times).toEqual([...times].sort((a, b) => a - b));
		expect(compact(alerts.filter((alert) => alert.atMs === 10_000))).toEqual([
			'10s go #1',
			'10s announce #2'
		]);
	});

	it('has no alerts for an empty timeline', () => {
		expect(buildAlerts([])).toEqual([]);
	});
});
