import { Session, User, validateSession } from '../../managers/userManager';
import Layout from '../../components/layout';
import { GetServerSidePropsContext } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import utilCss from '../../styles/util.module.scss';

const translations: {
	[key: string]: {
		[key: string]: string;
	};
} = {
	'en-US': {
		Title: 'Create new group',
		'New Group': 'New Group',
		'Create Group': 'Create Group',
		'Group Name': 'Group Name',
	},
	'de-DE': {
		Title: 'Neue Gruppe erstellen',
		'New Group': 'Neue Gruppe',
		'Create Group': 'Gruppe erstellen',
		'Group Name': 'Gruppenname',
	},
};

export default function NewGroup(props: { session: Session; user: User }) {
	const router = useRouter();
	const translation = translations[router.locale || 'en-US'];

	const onSubmit = (event: any) => {
		event.preventDefault();

		const groupName = event.target.elements.name.value;

		if (!groupName) {
			return alert('Please enter a group name');
		}

		return fetch('/api/group/create', {
			body: JSON.stringify({
				name: groupName,
			}),
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST',
		})
			.then((response) => {
				if (response.status === 200) {
					return response.json();
				}

				return response.text().then((text) => {
					throw new Error(text);
				});
			})
			.then((data) => {
				if (data.error) {
					return alert(data.error);
				}

				router.push('/groups/');
			});
	};

	return (
		<>
			<Head>
				<title>{translation.Title}</title>
			</Head>
			<Layout data={props}>
				<div className={utilCss.basicPage}>
					<h1>{translation['New Group']}</h1>
					<form onSubmit={onSubmit}>
						<label>{translation['Group Name']}</label>
						<input type="text" name="name" />
						<button type="submit">{translation['Create Group']}</button>
					</form>
				</div>
			</Layout>
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
