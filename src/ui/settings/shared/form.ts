import type { SettingControlBase, SettingNumberControl, SettingToggleControl } from 'obsidian';
import type { Bindings } from '@/ui/settings/shared/bindings';

export interface FormOptions<T> {
	bindings: Bindings;
	read: () => T;
	write: (changes: Partial<T>) => Promise<void>;
}

type Fields<T, Value> = Extract<{ [Key in keyof T]-?: T[Key] extends Value ? Key : never }[keyof T], string>;
type ControlOptions<Control> = Omit<Control, 'type' | 'key'>;

export class Form<T extends object> {
	constructor(private readonly options: FormOptions<T>) {}

	toggle(field: Fields<T, boolean>, options: ControlOptions<SettingToggleControl> = {}): SettingToggleControl {
		return this.bind<boolean, SettingToggleControl>(
			{ ...options, type: 'toggle', key: field },
			(value) => typeof value === 'boolean'
		);
	}

	number(
		field: Fields<T, number>,
		accepts: (value: unknown) => value is number,
		options: ControlOptions<SettingNumberControl> = {}
	): SettingNumberControl {
		return this.bind<number, SettingNumberControl>({ ...options, type: 'number', key: field }, accepts);
	}

	private bind<Value, Control extends SettingControlBase<Value>>(
		control: Control,
		accepts: (value: unknown) => value is Value
	): Control {
		const field = control.key as keyof T;

		this.options.bindings.register(control.key, {
			read: () => this.options.read()[field],
			write: async (value) => {
				if (!accepts(value) || (await control.validate?.(value))) return;

				await this.options.write({ [field]: value } as Partial<T>);
			},
		});

		return control;
	}
}
