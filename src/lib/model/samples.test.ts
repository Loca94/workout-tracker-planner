import { describe, expect, it } from 'vitest';
import { exerciseSchema } from './exercise';
import { resolveWorkout } from './resolveWorkout';
import { sampleExercises } from './sampleExercises';
import { sampleWorkouts } from './sampleWorkouts';
import { workoutSchema } from './workout';

describe('sample data', () => {
	it.each(sampleExercises.map((exercise) => [exercise.id, exercise]))(
		'exercise %s is valid',
		(_id, exercise) => {
			expect(exerciseSchema.safeParse(exercise).error?.issues).toBeUndefined();
		}
	);

	it.each(sampleWorkouts.map((workout) => [workout.id, workout]))(
		'workout %s is valid and resolves',
		(_id, workout) => {
			expect(workoutSchema.safeParse(workout).error?.issues).toBeUndefined();
			expect(resolveWorkout(workout, sampleExercises)).toMatchObject({ ok: true });
		}
	);

	it('covers every mode', () => {
		const modes = new Set(sampleWorkouts.map((workout) => workout.mode));

		expect(modes).toEqual(new Set(['amrap', 'emom', 'intervals']));
	});
});
