import { z } from 'zod';

export const idSchema = z.string().min(1, 'Id is required');

export const nameSchema = z
	.string()
	.trim()
	.min(1, 'Name is required')
	.max(60, 'Name must be 60 characters or fewer');

export const loadKgSchema = z
	.number()
	.min(0, 'Load cannot be negative')
	.max(200, 'Load must be 200 kg or less');
