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
	return (
		<div id={id} className={(className ?? '') + ' ' + css.dateInput}>
			<input
				className="day"
				type="number"
				defaultValue={(defaultValue || '').split('-')[2]}
				min="1"
				max="31"
				placeholder={placeholders?.[0] ?? 'DD'}
			/>
			<span>.</span>
			<input
				className="month"
				type="number"
				defaultValue={(defaultValue || '').split('-')[1]}
				min="1"
				max="12"
				placeholder={placeholders?.[1] ?? 'MM'}
			/>
			<span>.</span>
			<input
				className="year"
				type="number"
				defaultValue={(defaultValue || '').split('-')[0]}
				min="1"
				max="9999"
				placeholder={placeholders?.[2] ?? 'YYYY'}
			/>
		</div>
	);
}
