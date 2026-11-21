import { describe, expect, it } from 'vitest';
import { formatClock } from './time';

describe('formatClock', () => {
	it('formats zero', () => {
		expect(formatClock(0)).toBe('00:00');
	});

	it('formats minutes and seconds', () => {
		expect(formatClock(65_000)).toBe('01:05');
		expect(formatClock(20 * 60_000)).toBe('20:00');
	});

	it('rounds partial seconds up', () => {
		expect(formatClock(1)).toBe('00:01');
		expect(formatClock(59_001)).toBe('01:00');
	});

	it('adds hours from one hour', () => {
		expect(formatClock(3_600_000)).toBe('1:00:00');
		expect(formatClock(3_725_000)).toBe('1:02:05');
	});

	it('clamps negative values to zero', () => {
		expect(formatClock(-500)).toBe('00:00');
	});
});
