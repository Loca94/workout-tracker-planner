import type { Exercise } from './exercise';

export const sampleExercises: Exercise[] = [
	{
		id: 'swing',
		name: 'Swing',
		category: 'kettlebell',
		defaultLoadKg: 24,
		muscles: { primary: ['glutes', 'hamstrings'], secondary: ['grip', 'core', 'upper-back'] },
		variations: [
			{
				id: 'two-hand-swing',
				name: 'Two-hand swing',
				perSide: false,
				tips: ['Hips back, then snap them forward', 'Let the bell float, don’t lift it']
			},
			{ id: 'one-arm-swing', name: 'One-arm swing', perSide: true },
			{ id: 'hand-to-hand-swing', name: 'Hand-to-hand swing', perSide: false }
		],
		defaultVariationId: 'two-hand-swing'
	},
	{
		id: 'goblet-squat',
		name: 'Goblet squat',
		category: 'kettlebell',
		defaultLoadKg: 16,
		muscles: { primary: ['quads', 'glutes'], secondary: ['core', 'upper-back'] },
		variations: [
			{
				id: 'goblet-squat',
				name: 'Goblet squat',
				perSide: false,
				tips: ['Elbows inside the knees at the bottom']
			}
		],
		defaultVariationId: 'goblet-squat'
	},
	{
		id: 'halo',
		name: 'Halo',
		category: 'kettlebell',
		defaultLoadKg: 12,
		muscles: { primary: ['shoulders'], secondary: ['grip', 'core'] },
		variations: [
			{ id: 'halo', name: 'Halo', perSide: false, tips: ['Keep the bell close to your head'] },
			{
				id: 'squat-halo',
				name: 'Squat halo',
				perSide: false,
				addsMuscles: { primary: ['quads', 'glutes'] }
			},
			{
				id: 'half-kneeling-rotation-halo',
				name: 'Half-kneeling halo with rotation',
				perSide: true,
				addsMuscles: { primary: ['core'], secondary: ['hips'] }
			},
			{ id: 'kneeling-halo', name: 'Kneeling halo', perSide: false }
		],
		defaultVariationId: 'halo'
	},
	{
		id: 'couch-stretch',
		name: 'Couch stretch',
		category: 'mobility',
		muscles: { primary: ['hips', 'quads'], secondary: [] },
		variations: [
			{
				id: 'couch-stretch',
				name: 'Couch stretch',
				perSide: true,
				tips: ['Squeeze the glute of the back leg']
			}
		],
		defaultVariationId: 'couch-stretch'
	},
	{
		id: 'pigeon',
		name: 'Pigeon',
		category: 'mobility',
		muscles: { primary: ['hips', 'glutes'], secondary: [] },
		variations: [{ id: 'pigeon', name: 'Pigeon', perSide: true }],
		defaultVariationId: 'pigeon'
	}
];
