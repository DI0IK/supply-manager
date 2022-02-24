import { Session, User, validateSession } from '../../../managers/userManager';
import Layout from '../../../components/layout';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getGroups, Group } from '../../../managers/groupManager';
import { getProducts, GroupProduct } from '../../../managers/groupProductManager';
import { Product } from '../../../managers/openfoodfacts';
import groupPage from '../../../styles/groupPage.module.scss';
import scannerCss from '../../../styles/scanner.module.scss';
//@ts-ignore
import Quagga from 'quagga';
import DatePicker from '../../../components/dateInput';
import Link from 'next/link';

const translations: {
	[key: string]: {
		[key: string]: string;
	};
} = {
	'en-US': {
		Title: 'Group $name',
		Groupname: '$name',
		barcodeEmpty: 'Barcode is empty',
		scanProduct: 'Scan product',
		addToSupply: 'Add to supply',
		removeFromSupply: 'Remove from supply',
		dateInvalid: 'Date is invalid',
		amountlt1: 'Amount must be greater than 0',
		amount: 'Amount',
		barcode: 'Barcode',
		day: 'Day',
		month: 'Month',
		year: 'Year',
	},
	'de-DE': {
		Title: 'Gruppe $name',
		Groupname: '$name',
		barcodeEmpty: 'Barcode ist leer',
		scanProduct: 'Produkt scannen',
		addToSupply: 'Zum Vorratsbestand hinzufügen',
		removeFromSupply: 'Vom Vorratsbestand entfernen',
		dateInvalid: 'Datum ist ungültig',
		amountlt1: 'Menge muss größer als 0 sein',
		amount: 'Menge',
		barcode: 'Barcode',
		day: 'Tag',
		month: 'Monat',
		year: 'Jahr',
	},
};

export default function GroupScanPage(props: {
	session: Session;
	user: User;
	group: Group;
	products: (Product & GroupProduct)[];
}) {
	const router = useRouter();
	const translation = translations[router.locale || 'en-US'];

	const ini = () => {
		Quagga.init(
			{
				inputStream: {
					constraints: {
						facingMode: 'environment', // restrict camera type
					},
				},
				decoder: {
					readers: [
						'ean_reader',
						'ean_8_reader',
						'code_128_reader',
						'code_39_reader',
						'codabar_reader',
						'i2of5_reader',
						'2of5_reader',
						'code_93_reader',
					], // restrict code types
				},
			},
			(err: any) => {
				if (err) {
					console.error(err);
				} else {
					Quagga.start();
					Quagga.onDetected((res: any) => {
						(document.getElementById('barcode') as HTMLInputElement).value =
							res.codeResult.code;
						Quagga.stop();
						(document.getElementById('interactive') as HTMLDivElement).innerHTML = '';
					});
					Quagga.onProcessed((result: any) => {
						console.log(result);
					});
				}
			}
		);
	};

	const addToSupply = async (event: any) => {
		event.preventDefault();

		const barcode = (document.getElementById('barcode') as HTMLInputElement).value;
		const day = (document.getElementsByClassName('day')[0] as HTMLInputElement).value;
		const month = (document.getElementsByClassName('month')[0] as HTMLInputElement).value;
		const year = (document.getElementsByClassName('year')[0] as HTMLInputElement).value;
		const expDate = new Date(
			Date.UTC(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
		);
		const amount = (document.getElementById('amount') as HTMLInputElement).value;

		if (barcode === '') {
			alert(translation.barcodeEmpty);
			return;
		}

		if (day === '' || month === '' || year === '' || !expDate.getTime()) {
			alert(translation.dateInvalid);
			return;
		}

		if (amount === '' || Number.parseInt(amount) < 1) {
			alert(translation.amountlt1);
			return;
		}

		fetch('/api/group/addToSupply', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				groupId: props.group.id,
				barcode,
				expDate: expDate.toUTCString(),
				amount: Number.parseInt(amount),
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.success) {
					router.push('/groups/[id]', `/groups/${props.group.id}`);
				} else {
					alert(res.error);
				}
			});
	};

	const removeFromSupply = async (event: any) => {
		event.preventDefault();

		const barcode = (document.getElementById('barcode') as HTMLInputElement).value;
		const day = (document.getElementsByClassName('day')[0] as HTMLInputElement).value;
		const month = (document.getElementsByClassName('month')[0] as HTMLInputElement).value;
		const year = (document.getElementsByClassName('year')[0] as HTMLInputElement).value;
		const expDate = new Date(
			Date.UTC(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day))
		);
		const amount = (document.getElementById('amount') as HTMLInputElement).value;

		if (barcode === '') {
			alert(translation.barcodeEmpty);
			return;
		}

		if (day === '' || month === '' || year === '' || !expDate.getTime()) {
			alert(translation.dateInvalid);
			return;
		}

		if (amount === '' || Number.parseInt(amount) < 1) {
			alert(translation.amountlt1);
			return;
		}

		fetch('/api/group/removeFromSupply', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				groupId: props.group.id,
				barcode,
				expDate: expDate.toUTCString(),
				amount: Number.parseInt(amount),
			}),
		})
			.then((res) => res.json())
			.then((res) => {
				if (res.success) {
					router.push('/groups/[id]', `/groups/${props.group.id}`);
				} else {
					alert(res.error);
				}
			});
	};

	return (
		<>
			<Head>
				<title>{translation.Title.replace('$name', props.group.name)}</title>
			</Head>
			<Layout data={props} className={scannerCss.page}>
				<h1 className={groupPage.header}>
					<Link href="/groups/[id]" as={`/groups/${props.group.id}`}>
						<a>{translation['Groupname'].replace('$name', props.group.name)}</a>
					</Link>
				</h1>
				<div className={groupPage.scanButton}>
					<button className={groupPage.button} onClick={ini}>
						{translation.scanProduct}
					</button>
					<input
						id="barcode"
						className={groupPage.barcode}
						type="text"
						placeholder={translation.barcode}
					/>
					<DatePicker
						id="expiration"
						className={groupPage.expiration}
						placeholders={[translation.day, translation.month, translation.year]}
					/>
					<input
						id="amount"
						className={groupPage.amount}
						type="number"
						placeholder={translation.amount}
					/>

					<button onClick={addToSupply}>{translation.addToSupply}</button>
					<button onClick={removeFromSupply}>{translation.removeFromSupply}</button>
				</div>
				<div id="interactive" className={scannerCss.scanner + ' viewport'}></div>
			</Layout>
		</>
	);
}

export async function getServerSideProps({ req, query }: GetServerSidePropsContext) {
	const { session, user } = (await validateSession(req.cookies.token)) || {};

	if (!session || !user) {
		return {
			props: {
				session: null,
				user: null,
				group: null,
				products: [],
			},
		};
	}

	if (!query.id) {
		return {
			props: {
				session: session,
				user: user,
				group: null,
				products: [],
			},
		};
	}

	const userGroups = await getGroups(user);

	if (!userGroups) {
		return {
			props: {
				session: session,
				user: user,
				group: null,
				products: [],
			},
		};
	}

	let group = userGroups?.find((g) => g.id === Number.parseInt(query.id as string));

	if (!group) {
		return {
			props: {
				session: session,
				user: user,
				group: null,
				products: [],
			},
		};
	}

	group.created_at = group.created_at.toISOString() as any;

	const groupProducts = await getProducts(group);

	if (!groupProducts) {
		return {
			props: {
				session: session,
				user: user,
				group: null,
				products: [],
			},
		};
	}

	return {
		props: {
			session: session,
			user: user,
			group: group,
			products: groupProducts.map((p) => {
				p.expiration_date = p.expiration_date.toISOString() as any;
				p.cached_at = p.cached_at?.toISOString() as any;
				return p;
			}),
		},
	};
}
