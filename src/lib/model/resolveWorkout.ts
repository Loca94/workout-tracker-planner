import { findVariation, type Exercise } from './exercise';
import type { Workout, WorkoutItem } from './workout';

export type ResolvedItem = WorkoutItem & {
	exerciseName: string;
	variationName: string;
};

export type ResolvedWorkout = {
	workout: Workout;
	items: ResolvedItem[];
};

export type ResolveResult =
	{ ok: true; resolved: ResolvedWorkout } | { ok: false; problems: string[] };

/**
 * A workout only stores exercise and variation ids, which a schema can't check on its own.
 * This checks them against the exercise list and attaches the names to show.
 */
export function resolveWorkout(workout: Workout, exercises: Exercise[]): ResolveResult {
	const exercisesById = new Map(exercises.map((exercise) => [exercise.id, exercise]));
	const items: ResolvedItem[] = [];
	const problems: string[] = [];

	for (const [index, item] of workout.items.entries()) {
		const row = `Row ${index + 1}`;
		const exercise = exercisesById.get(item.exerciseId);

		if (!exercise) {
			problems.push(`${row}: the exercise "${item.exerciseId}" doesn't exist`);
			continue;
		}

		const variation = findVariation(exercise, item.variationId);

		if (!variation) {
			problems.push(`${row}: ${exercise.name} has no variation "${item.variationId}"`);
			continue;
		}

		items.push({ ...item, exerciseName: exercise.name, variationName: variation.name });
	}

	if (problems.length > 0) {
		return { ok: false, problems };
	}

	return { ok: true, resolved: { workout, items } };
}
