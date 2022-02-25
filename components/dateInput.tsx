import css from '../styles/dateInput.module.scss';

export default function DatePicker({
	id,
	className,
	defaultValue,
	placeholders,
}: {
	id: string;
	className?: string;
	defaultValue?: string;
	placeholders?: string[];
}) {
	const keyUp = (e: any, maxChars: number, nextId: string) => {
		if (e.target.value.length >= maxChars) {
			e.preventDefault();
			const nextElement = document.getElementsByClassName(nextId)[0] as
				| HTMLInputElement
				| HTMLButtonElement;
			if (!nextElement) return;
			nextElement.focus();
			if (nextElement.tagName == 'INPUT') {
				nextElement.value = '';
			}
		}
	};

	return (
		<div id={id} className={(className ?? '') + ' ' + css.dateInput}>
			<input
				className="day"
				type="number"
				defaultValue={(defaultValue || '').split('-')[2]}
				min="1"
				max="31"
				placeholder={placeholders?.[0] ?? 'DD'}
				onKeyUp={(e) => keyUp(e, 2, 'month')}
			/>
			<span>.</span>
			<input
				className="month"
				type="number"
				defaultValue={(defaultValue || '').split('-')[1]}
				min="1"
				max="12"
				placeholder={placeholders?.[1] ?? 'MM'}
				onKeyUp={(e) => keyUp(e, 2, 'year')}
			/>
			<span>.</span>
			<input
				className="year"
				type="number"
				defaultValue={(defaultValue || '').split('-')[0]}
				min="1"
				max="9999"
				placeholder={placeholders?.[2] ?? 'YYYY'}
				onKeyUp={(e) => keyUp(e, 4, 'done')}
			/>
		</div>
	);
}
