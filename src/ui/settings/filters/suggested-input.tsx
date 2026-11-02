import { AbstractInputSuggest, setIcon, type App } from 'obsidian';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { FilterChoice } from '@/ui/settings/filters/filter-choice';
import { useFilters } from '@/ui/settings/filters/filter-context';

type Props = {
	label: string;
	value: string;
	placeholder?: string;
	icon?: string;
	disabled?: boolean;
	className?: string;
	choices: (query: string) => readonly FilterChoice[];
	onCommit: (value: string, choice?: FilterChoice) => void;
};

export function SuggestedInput({ label, value, placeholder, icon, disabled = false, className, choices, onCommit }: Props) {
	const { app } = useFilters();
	const input = useRef<HTMLInputElement>(null);
	const iconEl = useRef<HTMLSpanElement>(null);
	const choicesRef = useRef(choices);
	const onCommitRef = useRef(onCommit);
	const suggester = useRef<NativeFilterSuggest | null>(null);
	const selectedValue = useRef<{ value: string; label: string } | null>(null);
	const selectedRevision = useRef(0);
	const blurTimer = useRef<number | undefined>(undefined);
	const dirty = useRef(false);
	const committedDraft = useRef(value);
	const draftRef = useRef(value);
	const [draft, setDraft] = useState(value);
	const setLocalDraft = useCallback((next: string): void => {
		draftRef.current = next;
		setDraft(next);
	}, []);

	useEffect(() => {
		choicesRef.current = choices;
	}, [choices]);
	useEffect(() => {
		onCommitRef.current = onCommit;
	}, [onCommit]);
	useEffect(() => {
		const selected = selectedValue.current;
		if (selected?.value === value) {
			setLocalDraft(selected.label);
			committedDraft.current = selected.label;
			dirty.current = false;
			return;
		}
		const element = input.current;
		if (element?.ownerDocument.activeElement === element && draftRef.current !== committedDraft.current) {
			return;
		}
		selectedValue.current = null;
		setLocalDraft(value);
		committedDraft.current = value;
		dirty.current = false;
	}, [setLocalDraft, value]);
	useEffect(() => {
		if (iconEl.current) {
			iconEl.current.replaceChildren();
			if (icon) setIcon(iconEl.current, icon);
		}
	}, [icon]);
	useEffect(() => {
		const element = input.current;
		if (!element || disabled) return;

		const instance = new NativeFilterSuggest(
			app,
			element,
			(query) => choicesRef.current(query),
			(choice) => {
				selectedRevision.current += 1;
				dirty.current = false;
				selectedValue.current = { value: choice.value, label: choice.label };
				committedDraft.current = choice.label;
				setLocalDraft(choice.label);
				onCommitRef.current(choice.value, choice);
			}
		);
		suggester.current = instance;
		return () => {
			if (blurTimer.current !== undefined) element.ownerDocument.defaultView?.clearTimeout(blurTimer.current);
			instance.close();
			if (suggester.current === instance) suggester.current = null;
		};
	}, [app, disabled]);

	const commitText = (text: string): void => {
		if (!dirty.current && text === committedDraft.current) return;
		selectedValue.current = null;
		dirty.current = false;
		committedDraft.current = text;
		onCommitRef.current(text);
	};

	return (
		<label className={['shard-suggested-input', className].filter(Boolean).join(' ')}>
			<span className='shard-suggested-input-label'>{label}</span>
			<span className='shard-suggested-input-control'>
				{icon && <span ref={iconEl} className='shard-suggested-input-icon' aria-hidden='true' />}
				<input
					ref={input}
					className='shard-suggested-input-field'
					aria-label={label}
					value={draft}
					placeholder={placeholder}
					disabled={disabled}
					autoComplete='off'
					onChange={(event) => {
						selectedValue.current = null;
						dirty.current = true;
						setLocalDraft(event.currentTarget.value);
					}}
					onFocusCapture={() => {
						const current = input.current?.value ?? draftRef.current;
						const preferred = selectedValue.current?.value ?? value;
						suggester.current?.showAllOnFocus(current, preferred, current);
						input.current?.select();
					}}
					onBlur={() => {
						const revision = selectedRevision.current;
						const view = input.current?.ownerDocument.defaultView;
						if (!view) return;
						if (blurTimer.current !== undefined) view.clearTimeout(blurTimer.current);
						blurTimer.current = view.setTimeout(() => {
							blurTimer.current = undefined;
							if (selectedRevision.current !== revision) return;
							commitText(input.current?.value ?? draftRef.current);
						}, 0);
					}}
					onKeyDown={(event) => {
						if (event.key !== 'Enter' || event.defaultPrevented) return;
						if (choicesRef.current(draftRef.current).length > 0) return;
						event.preventDefault();
						commitText(draftRef.current);
					}}
				/>
			</span>
		</label>
	);
}

class NativeFilterSuggest extends AbstractInputSuggest<FilterChoice> {
	private focusedQuery: string | undefined;
	private preferredValue: string | undefined;

	constructor(
		app: App,
		input: HTMLInputElement,
		private readonly choices: (query: string) => readonly FilterChoice[],
		private readonly onChoice: (choice: FilterChoice) => void
	) {
		super(app, input);
		this.limit = 50;
	}

	showAllOnFocus(query: string, preferredValue: string, preferredLabel: string): void {
		this.focusedQuery = query;
		this.preferredValue = preferredValue || preferredLabel;
	}

	protected getSuggestions(query: string): FilterChoice[] {
		if (this.focusedQuery === query) {
			const choices = [...this.choices('')];
			const selectedIndex = choices.findIndex(
				(choice) => choice.value === this.preferredValue || choice.label === this.preferredValue
			);
			if (selectedIndex > 0) {
				const [selected] = choices.splice(selectedIndex, 1);
				if (selected) choices.unshift(selected);
			}
			return choices;
		}
		this.focusedQuery = undefined;
		return [...this.choices(query)];
	}

	renderSuggestion(choice: FilterChoice, element: HTMLElement): void {
		element.addClass('shard-filter-choice');
		if (choice.icon) {
			const icon = element.createSpan({ cls: 'shard-filter-choice-icon' });
			setIcon(icon, choice.icon);
		}
		const text = element.createSpan({ cls: 'shard-filter-choice-text' });
		text.createSpan({ cls: 'shard-filter-choice-label', text: choice.label });
		if (choice.detail) text.createSpan({ cls: 'shard-filter-choice-detail', text: choice.detail });
	}

	selectSuggestion(choice: FilterChoice, _event: MouseEvent | KeyboardEvent): void {
		this.setValue(choice.label);
		this.close();
		this.onChoice(choice);
	}
}
