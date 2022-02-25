import { GetServerSidePropsContext } from 'next';
import { getAllGroups, Group } from '../../managers/groupManager';
import { getProducts as getGroupProducts } from '../../managers/groupProductManager';
import { getSessions, getUsers, Session, User, validateSession } from '../../managers/userManager';
import { getProducts } from '../../managers/openfoodfacts';

export default function Admin(props: {
	session: Session | null;
	user: User | null;
	data: {
		users: User[] | undefined;
		sessions: Session[] | undefined;
		groups: Group[] | undefined;
		groupProducts: any[] | undefined;
	};
}) {
	return (
		<pre
			style={{
				overflowX: 'scroll',
				overflowY: 'scroll',
				margin: 0,
				padding: 0,
				height: '100vh',
				width: '100vw',
			}}
		>
			{JSON.stringify(props.data, null, 2)}
		</pre>
	);
}

export async function getServerSideProps({ req, query }: GetServerSidePropsContext) {
	const { session, user } = (await validateSession(req.cookies.token)) || {};

	if (!session || !user) {
		return {
			props: {
				session: null,
				user: null,
				data: {},
			},
		};
	}

	if (user.id !== 1) {
		return {
			props: {
				session: session,
				user: user,
				data: {},
			},
		};
	}

	const users = await getUsers();

	const sessions = await getSessions();

	const groups = await getAllGroups();

	const groupProducts = await Promise.all(
		groups.map((g) =>
			getGroupProducts(g).then((p) => {
				return (p || []).map((p) => {
					return {
						...p,
						cached_at: p.cached_at ? p.cached_at.toISOString() : null,
						expiration_date: p.expiration_date ? p.expiration_date.toISOString() : null,
					};
				});
			})
		)
	);

	const products = (await getProducts()).map((p) => {
		return {
			...p,
			cached_at: p.cached_at ? p.cached_at.toISOString() : null,
		};
	});

	return {
		props: {
			session: session,
			user: user,
			data: {
				users,
				sessions,
				groups,
				products,
				groupProducts,
			},
		},
	};
}
