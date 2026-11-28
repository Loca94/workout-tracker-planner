import { z } from 'zod';
import { idSchema, loadKgSchema, nameSchema } from './fields';

const durationSchema = z
	.number()
	.int('Durations must be whole seconds')
	.min(1, 'Duration must be at least 1 second')
	.max(3600, 'Duration must be 1 hour or less');

const restSchema = z
	.number()
	.int('Rest must be whole seconds')
	.min(0, 'Rest cannot be negative')
	.max(3600, 'Rest must be 1 hour or less');

function count(label: string, max: number) {
	return z
		.number()
		.int(`${label} must be a whole number`)
		.min(1, `${label} must be at least 1`)
		.max(max, `${label} must be ${max} or fewer`);
}

const itemBase = {
	exerciseId: idSchema,
	variationId: idSchema,
	loadKg: loadKgSchema.optional(),
	perSide: z.boolean()
};

export const repsItemSchema = z.object({
	kind: z.literal('reps'),
	...itemBase,
	reps: count('Reps', 999)
});

export const holdItemSchema = z.object({
	kind: z.literal('hold'),
	...itemBase,
	holdSec: durationSchema
});

export const workoutItemSchema = z.discriminatedUnion('kind', [repsItemSchema, holdItemSchema]);

export type WorkoutItem = z.infer<typeof workoutItemSchema>;

export const amrapConfigSchema = z.object({
	durationSec: durationSchema
});

export const emomConfigSchema = z.object({
	intervalSec: durationSchema,
	intervals: count('Intervals', 100)
});

export const intervalsConfigSchema = z.object({
	workSec: durationSchema,
	restSec: restSchema,
	rounds: count('Rounds', 100),
	restBetweenRoundsSec: restSchema.optional()
});

export type AmrapConfig = z.infer<typeof amrapConfigSchema>;
export type EmomConfig = z.infer<typeof emomConfigSchema>;
export type IntervalsConfig = z.infer<typeof intervalsConfigSchema>;

const workoutBase = z.object({
	id: idSchema,
	name: nameSchema,
	description: z.string().trim().max(500, 'Description must be 500 characters or fewer').optional(),
	items: z.array(workoutItemSchema).min(1, 'A workout needs at least one exercise')
});

export const workoutSchema = z.discriminatedUnion('mode', [
	workoutBase.extend({ mode: z.literal('amrap'), config: amrapConfigSchema }),
	workoutBase.extend({ mode: z.literal('emom'), config: emomConfigSchema }),
	workoutBase.extend({ mode: z.literal('intervals'), config: intervalsConfigSchema })
]);

export type Workout = z.infer<typeof workoutSchema>;

export type WorkoutMode = Workout['mode'];
