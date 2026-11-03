export const Num = {
	clamp(value: number, min: number, max: number): number {
		return Math.max(min, Math.min(value, max));
	},

	between(value: number, min: number, max: number): boolean {
		return value >= min && value <= max;
	},
};
