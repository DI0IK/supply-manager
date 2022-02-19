import type { GetServerSidePropsContext } from 'next';
import { Session, User, validateSession } from '../managers/userManager';
import Head from 'next/head';
import Layout from '../components/layout';
import { useRouter } from 'next/router';

const translations: {
	[key: string]: {
		[key: string]: string;
	};
} = {
	'en-US': {
		Title: 'Supply Manager',
	},
	'de-DE': {
		Title: 'Produktverwaltung',
	},
};

export default function Home(props: { session: Session; user: User }) {
	const router = useRouter();
	const translation = translations[router.locale || 'en-US'];

	return (
		<>
			<Head>
				<title>{translation.Title}</title>
			</Head>
			<Layout data={props}></Layout>
		</>
	);
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
	const { session, user } = (await validateSession(req.cookies.token)) || {};

	return {
		props: {
			session: session || null,
			user: user || null,
		},
	};
}
