import { Session, User, validateSession } from '../../../managers/userManager';
import Layout from '../../../components/layout';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getGroups, Group } from '../../../managers/groupManager';
import { getProducts, GroupProduct } from '../../../managers/groupProductManager';
import { Product } from '../../../managers/openfoodfacts';
import groupPage from '../../../styles/groupPage.module.scss';
import Link from 'next/link';
import { useState } from 'react';

const translations: {
	[key: string]: {
		[key: string]: string;
	};
} = {
	'en-US': {
		Title: 'Group $name',
		Groupname: '$name',
		confirmDeleteGroup: 'Are you sure you want to delete this group?',

		barcode: 'Barcode',
		name: 'Name',
		quantity: 'Quantity',
		amountPerUnit: 'Amount per unit',
		expirationDate: 'Expiration date',

		scanProduct: 'Scan product',
		deleteGroup: 'Delete group',
	},
	'de-DE': {
		Title: 'Gruppe $name',
		Groupname: '$name',
		confirmDeleteGroup: 'Sind Sie sicher, dass Sie diese Gruppe löschen wollen?',

		barcode: 'Barcode',
		name: 'Name',
		quantity: 'Menge',
		amountPerUnit: 'Menge pro Einheit',
		expirationDate: 'Ablaufdatum',

		scanProduct: 'Produkt scannen',
		deleteGroup: 'Gruppe löschen',
	},
};

export default function GroupPage(props: {
	session: Session;
	user: User;
	group: Group;
	products: (Product & GroupProduct)[];
}) {
	const router = useRouter();
	const translation = translations[router.locale || 'en-US'];

	const [state, setState] = useState('barcode');

	const deleteGroup = (e: any) => {
		e.preventDefault();

		const confirm = window.confirm(translation.confirmDeleteGroup);

		if (confirm) {
			fetch('/api/group/delete', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					id: props.group.id,
				}),
			})
				.then((data) => data.json())
				.then((data) => {
					if (data.success) {
						router.push('/groups');
					} else {
						alert(data.error);
					}
				});
		}
	};

	return (
		<>
			<Head>
				<title>{translation.Title.replace('$name', props.group.name)}</title>
			</Head>
			<Layout data={props}>
				<h1 className={groupPage.header}>
					<Link href="/groups/[id]" as={`/groups/${props.group.id}`}>
						<a>{translation['Groupname'].replace('$name', props.group.name)}</a>
					</Link>
				</h1>
				<div className={groupPage.scanButton}>
					<Link href={`/groups/${props.group.id}/scan`}>
						<a className={groupPage.button}>{translation.scanProduct}</a>
					</Link>
					{props.group.owner_id === props.user.id ? (
						<button onClick={deleteGroup}>{translation.deleteGroup}</button>
					) : null}
				</div>
				<div className={groupPage.tableWrapper}>
					<table className={groupPage.table}>
						<thead>
							<tr>
								<th onClick={() => setState('barcode')}>{translation.barcode}</th>
								<th onClick={() => setState('name')}>{translation.name}</th>
								<th onClick={() => setState('quantity')}>{translation.quantity}</th>
								<th onClick={() => setState('expirationDate')}>
									{translation.expirationDate}
								</th>
								<th onClick={() => setState('amountPerUnit')}>
									{translation.amountPerUnit}
								</th>
								<th onClick={() => setState('nutriscore')}>Nutriscore</th>
							</tr>
						</thead>
						<tbody>
							{props.products
								.sort((a, b) => {
									if ((a as any)[state] < (b as any)[state]) {
										return -1;
									}
									if ((a as any)[state] > (b as any)[state]) {
										return 1;
									}
									return 0;
								})
								.map((product) => (
									<tr key={product.barcode}>
										<td>{product.barcode}</td>
										<td>{product.product_name}</td>
										<td>{product.quantity}</td>
										<td
											className={
												new Date(product.expiration_date).getTime() - Date.now() <= 0
													? groupPage.expired
													: new Date(product.expiration_date).getTime() - Date.now() <
													  7 * 24 * 60 * 60 * 1000
													? groupPage.expiresSoon
													: groupPage.notExpired
											}
										>
											{new Date(
												new Date(product.expiration_date).valueOf() +
													new Date(product.expiration_date).getTimezoneOffset() * 60000
											).toLocaleDateString()}
										</td>
										<td>{product.quantity_per_unit}</td>
										<td className={groupPage['nutriscore_' + product.nutriscore]}>
											{product.nutriscore.toUpperCase()}
										</td>
									</tr>
								))}
						</tbody>
					</table>
				</div>
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