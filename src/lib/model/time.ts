/**
 * Formats a duration in milliseconds as a clock string: `mm:ss`, or `h:mm:ss` from one hour.
 * Partial seconds are rounded up, so a countdown shows `00:01` until it actually reaches zero.
 */
export function formatClock(ms: number): string {
	const totalSec = Math.max(0, Math.ceil(ms / 1000));
	const h = Math.floor(totalSec / 3600);
	const m = Math.floor((totalSec % 3600) / 60);
	const s = totalSec % 60;
	const pad = (n: number) => String(n).padStart(2, '0');
	return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}
