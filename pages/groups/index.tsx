import type { GetServerSidePropsContext } from 'next';
import { Session, User, validateSession } from '../../managers/userManager';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/layout';
import { getGroups, Group } from '../../managers/groupManager';
import css from '../../styles/groups.module.scss';
import { useRouter } from 'next/router';

const translations: {
	[key: string]: {
		[key: string]: string;
	};
} = {
	'en-US': {
		newGroup: 'Create new group',
		Title: 'Groups',
	},
	'de-DE': {
		newGroup: 'Neue Gruppe erstellen',
		Title: 'Gruppen',
	},
};

export default function Home(props: { session: Session; user: User; groups: Group[] }) {
	const router = useRouter();
	const translation = translations[router.locale || 'en-US'];

	return (
		<>
			<Head>
				<title>{translation.Title}</title>
			</Head>
			<Layout data={props}>
				<ul className={css.groupList}>
					{props.groups.map((group) => (
						<li
							key={group.id}
							className={group.owner_id === props.user.id ? css.isOwner : css.isNotOwner}
						>
							<Link href={`/groups/${group.id}`}>
								<a>{group.name}</a>
							</Link>
						</li>
					))}
					<li className={css.createNew}>
						<Link href="/groups/new">
							<a>{translation['newGroup']}</a>
						</Link>
					</li>
				</ul>
			</Layout>
		</>
	);
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
	const { session, user } = (await validateSession(req.cookies.token)) || {};

	if (user) {
		const groups = await getGroups(user);
		return {
			props: {
				session: session || null,
				user: user || null,
				groups:
					groups?.map((g) => {
						return {
							...g,
							created_at: g.created_at.toISOString(),
						};
					}) || null,
			},
		};
	} else {
		return {
			props: {
				session: session || null,
				user: user || null,
				groups: [],
			},
		};
	}
}
