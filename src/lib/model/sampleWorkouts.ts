import type { Workout } from './workout';

export const sampleWorkouts: Workout[] = [
	{
		id: 'sample-emom',
		name: 'Swing, squat, halo EMOM',
		mode: 'emom',
		config: { intervalSec: 60, intervals: 9 },
		items: [
			{
				kind: 'reps',
				exerciseId: 'swing',
				variationId: 'two-hand-swing',
				reps: 15,
				loadKg: 24,
				perSide: false
			},
			{
				kind: 'reps',
				exerciseId: 'goblet-squat',
				variationId: 'goblet-squat',
				reps: 10,
				loadKg: 16,
				perSide: false
			},
			{
				kind: 'reps',
				exerciseId: 'halo',
				variationId: 'halo',
				reps: 5,
				loadKg: 12,
				perSide: true
			}
		]
	},
	{
		id: 'sample-amrap',
		name: '20-minute AMRAP',
		mode: 'amrap',
		config: { durationSec: 1200 },
		items: [
			{
				kind: 'reps',
				exerciseId: 'swing',
				variationId: 'one-arm-swing',
				reps: 10,
				loadKg: 16,
				perSide: true
			},
			{
				kind: 'reps',
				exerciseId: 'goblet-squat',
				variationId: 'goblet-squat',
				reps: 10,
				loadKg: 16,
				perSide: false
			},
			{
				kind: 'reps',
				exerciseId: 'halo',
				variationId: 'squat-halo',
				reps: 6,
				loadKg: 12,
				perSide: false
			}
		]
	},
	{
		id: 'sample-tabata',
		name: 'Swing Tabata',
		mode: 'intervals',
		config: { workSec: 20, restSec: 10, rounds: 8 },
		items: [
			{
				kind: 'reps',
				exerciseId: 'swing',
				variationId: 'two-hand-swing',
				reps: 10,
				loadKg: 16,
				perSide: false
			}
		]
	},
	{
		id: 'sample-mobility',
		name: 'Hip mobility flow',
		mode: 'intervals',
		config: { workSec: 60, restSec: 0, rounds: 1 },
		items: [
			{
				kind: 'hold',
				exerciseId: 'couch-stretch',
				variationId: 'couch-stretch',
				holdSec: 60,
				perSide: true
			},
			{ kind: 'hold', exerciseId: 'pigeon', variationId: 'pigeon', holdSec: 45, perSide: true }
		]
	}
];
