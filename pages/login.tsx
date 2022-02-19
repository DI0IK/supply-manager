import css from '../styles/util.module.scss';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Layout from '../components/layout';
import { GetServerSidePropsContext } from 'next';
import { Session, User, validateSession } from '../managers/userManager';

const translations: {
	[key: string]: {
		[key: string]: string;
	};
} = {
	'en-US': {
		Title: 'Login',
		'Username/Email': 'Username/Email',
		Password: 'Password',
		Login: 'Login',
	},
	'de-DE': {
		Title: 'Anmelden',
		'Username/Email': 'Benutzername/Email',
		Password: 'Passwort',
		Login: 'Anmelden',
	},
};

export default function Login(props: { session: Session; user: User }) {
	const router = useRouter();
	const translation = translations[router.locale || 'en-US'];

	const onSubmit = (event: any) => {
		event.preventDefault();

		const { username, password } = event.target.elements;

		fetch('/api/user/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				username: username.value,
				password: password.value,
			}),
		})
			.then((data) => data.text())
			.then((data) => {
				router.push('/', '/', { locale: router.locale });
			});
	};

	return (
		<>
			<Head>
				<title>{translations.Title}</title>
			</Head>
			<Layout data={props}>
				<div className={css.basicPage}>
					<h1>{translation.Login}</h1>
					<form onSubmit={onSubmit}>
						<label htmlFor="username">{translation['Username/Email']}:</label>
						<input type="text" name="username" required />
						<br />
						<label htmlFor="password">{translation.Password}:</label>
						<input type="password" name="password" required />
						<br />
						<button>{translation.Login}</button>
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
