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
import { TRUE } from 'sass';

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
		amountWanted: 'Amount wanted',

		scanProduct: 'Scan product',
		deleteGroup: 'Delete group',
		manageUsers: 'Manage users',

		actions: 'Actions',
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
		amountWanted: 'Gewünschte Menge',

		scanProduct: 'Produkt scannen',
		deleteGroup: 'Gruppe löschen',
		manageUsers: 'Benutzer verwalten',

		actions: 'Aktionen',
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

	const [sort, setSorting] = useState('barcode');
	const [sortDirection, setSortDirection] = useState(1);

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

	function changeSorting(sortAfter: string) {
		if (sort === sortAfter) {
			setSortDirection(-1 * sortDirection);
		} else {
			setSortDirection(1);
			setSorting(sortAfter);
		}
	}

	function updateAmountWanted(e: any, barcode: string, expDate: Date) {
		e.preventDefault();

		const amountWanted = e.target.value;

		fetch('/api/group/updateAmountWanted', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				groupId: props.group.id,
				barcode,
				amountWanted,
				expDate: expDate.toISOString(),
			}),
		})
			.then((data) => data.json())
			.then((data) => {
				if (data.success) {
					e.target.value = amountWanted;
				} else {
					alert(data.error);
				}
			});
	}

	const add1ToSupply = (e: any, barcode: string, expDate: Date) => {
		e.preventDefault();

		fetch('/api/group/addToSupply', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				groupId: props.group.id,
				barcode,
				expDate: expDate.toISOString(),
				amount: 1,
			}),
		})
			.then((data) => data.json())
			.then((data) => {
				if (data.success) {
					router.reload();
				} else {
					alert(data.error);
				}
			});
	};

	const remove1FromSupply = (e: any, barcode: string, expDate: Date) => {
		e.preventDefault();

		fetch('/api/group/removeFromSupply', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				groupId: props.group.id,
				barcode,
				expDate: expDate.toISOString(),
				amount: 1,
			}),
		})
			.then((data) => data.json())
			.then((data) => {
				if (data.success) {
					router.reload();
				} else {
					alert(data.error);
				}
			});
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
						<>
							<button onClick={deleteGroup}>{translation.deleteGroup}</button>
							<Link href={`/groups/${props.group.id}/manageUsers`}>
								<a className={groupPage.button}>{translation.manageUsers}</a>
							</Link>
						</>
					) : null}
				</div>
				<div className={groupPage.tableWrapper}>
					<table className={groupPage.table}>
						<thead>
							<tr>
								<th
									onClick={() => changeSorting('barcode')}
									className={
										sort === 'barcode'
											? groupPage['sortDirection_' + sortDirection]
											: undefined
									}
								>
									{translation.barcode}
								</th>
								<th
									onClick={() => changeSorting('name')}
									className={
										sort === 'name'
											? groupPage['sortDirection_' + sortDirection]
											: undefined
									}
								>
									{translation.name}
								</th>
								<th
									onClick={() => changeSorting('quantity')}
									className={
										sort === 'quantity'
											? groupPage['sortDirection_' + sortDirection]
											: undefined
									}
								>
									{translation.quantity}
								</th>
								<th
									onClick={() => changeSorting('expirationDate')}
									className={
										sort === 'expirationDate'
											? groupPage['sortDirection_' + sortDirection]
											: undefined
									}
								>
									{translation.expirationDate}
								</th>
								<th
									onClick={() => changeSorting('amountPerUnit')}
									className={
										sort === 'amountPerUnit'
											? groupPage['sortDirection_' + sortDirection]
											: undefined
									}
								>
									{translation.amountPerUnit}
								</th>
								<th
									onClick={() => changeSorting('nutriscore')}
									className={
										sort === 'nutriscore'
											? groupPage['sortDirection_' + sortDirection]
											: undefined
									}
								>
									Nutriscore
								</th>
								<th
									onClick={() => changeSorting('amountWanted')}
									className={
										sort === 'amountWanted'
											? groupPage['sortDirection_' + sortDirection]
											: undefined
									}
								>
									{translation.amountWanted}
								</th>
								<th>{translation.actions}</th>
							</tr>
						</thead>
						<tbody>
							{props.products
								.sort((a, b) => {
									if ((a as any)[sort] < (b as any)[sort]) {
										return -1;
									}
									if ((a as any)[sort] > (b as any)[sort]) {
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
										<td>
											{
												<input
													type="number"
													value={product.amount_wanted}
													onChange={(e) =>
														updateAmountWanted(
															e,
															product.barcode,
															new Date(product.expiration_date)
														)
													}
													onKeyPress={(e) => e.preventDefault()}
													min={0}
												/>
											}
										</td>
										<td>
											<button
												onClick={(e) =>
													add1ToSupply(
														e,
														product.barcode,
														new Date(product.expiration_date)
													)
												}
											>
												+
											</button>
											<button
												onClick={(e) =>
													remove1FromSupply(
														e,
														product.barcode,
														new Date(product.expiration_date)
													)
												}
											>
												—
											</button>
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
