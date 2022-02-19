import { Session, User, validateSession } from '../../../managers/userManager';
import Layout from '../../../components/layout';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { getGroups, Group } from '../../../managers/groupManager';
import { getProducts, GroupProduct } from '../../../managers/groupProductManager';
import { Product } from '../../../managers/openfoodfacts';
import groupPage from '../../../styles/groupPage.module.scss';

const translations: {
	[key: string]: {
		[key: string]: string;
	};
} = {
	'en-US': {
		Title: 'Group $name',
		Groupname: '$name',
	},
	'de-DE': {
		Title: 'Gruppe $name',
		Groupname: '$name',
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

	return (
		<>
			<Head>
				<title>{translation.Title.replace('$name', props.group.name)}</title>
			</Head>
			<Layout data={props}>
				<h1 className={groupPage.header}>
					{translation['Groupname'].replace('$name', props.group.name)}
				</h1>
				<table className={groupPage.tableFullWidth}>
					<thead>
						<tr>
							<th>Barcode</th>
							<th>Name</th>
							<th>Quantity</th>
							<th>Amount per unit</th>
							<th>Expiration Date</th>
						</tr>
					</thead>
					<tbody>
						{props.products.map((product) => (
							<tr key={product.barcode}>
								<td>{product.product_name}</td>
								<td>{product.quantity}</td>
								<td>{product.amount}</td>
								<td>{new Date(product.expiration_date).toLocaleDateString()}</td>
							</tr>
						))}
					</tbody>
				</table>
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
			products: groupProducts,
		},
	};
}
