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
		Title: 'Register',
		Username: 'Username',
		Email: 'Email',
		Password: 'Password',
		'Repeat Password': 'Repeat Password',
		Register: 'Register',
	},
	'de-DE': {
		Title: 'Registrieren',
		Username: 'Benutzername',
		Email: 'Email',
		Password: 'Passwort',
		'Repeat Password': 'Passwort wiederholen',
		Register: 'Registrieren',
	},
};

export default function Register(props: { session: Session; user: User }) {
	const router = useRouter();
	const translation = translations[router.locale || 'en-US'];

	const onSubmit = (event: any) => {
		event.preventDefault();

		const { username, password, email, password2 } = event.target.elements;

		if (password.value !== password2.value) {
			alert('Passwords do not match!');
			return;
		}

		fetch('/api/user/register', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				username: username.value,
				password: password.value,
				email: email.value,
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
				<title>{translation.Title}</title>
			</Head>
			<Layout data={props}>
				<div className={css.basicPage}>
					<h1>{translation.Register}</h1>
					<form onSubmit={onSubmit}>
						<label htmlFor="username">{translation.Username}:</label>
						<input type="text" name="username" required />
						<br />
						<label htmlFor="email">{translation.Email}:</label>
						<input type="email" name="email" required />
						<br />
						<label htmlFor="password">{translation.Password}:</label>
						<input type="password" name="password" required />
						<br />
						<label htmlFor="password2">{translation['Repeat Password']}:</label>
						<input type="password" name="password2" required />
						<br />
						<button>{translation.Register}</button>
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
