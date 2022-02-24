import css from '../styles/settings.module.scss';
import Head from 'next/head';
import Layout from '../components/layout';
import { GetServerSidePropsContext } from 'next';
import { Session, User, validateSession } from '../managers/userManager';
import { useRouter } from 'next/router';

const translations: {
	[key: string]: {
		[key: string]: string;
	};
} = {
	'en-US': {
		Title: 'Settings',
		Settings: 'Settings',
		deleteAccount: 'Delete account',
		changePassword: 'Change password',
		confirmDelete: 'Are you sure you want to delete your account? This action cannot be undone.',
		changePasswordConfirmIncorrect: 'The passwords do not match.',
		newPassword: 'New Password',
		confirmNewPassword: 'Confirm new Password',
	},
	'de-DE': {
		Title: 'Einstellungen',
		Settings: 'Einstellungen',
		deleteAccount: 'Konto löschen',
		changePassword: 'Passwort ändern',
		confirmDelete:
			'Möchtest du dein Konto wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
		changePasswordConfirmIncorrect: 'Die Passwörter stimmen nicht überein.',
		newPassword: 'Neues Passwort',
		confirmNewPassword: 'Neues Passwort wiederholen',
	},
};

export default function Login(props: { session: Session; user: User }) {
	const router = useRouter();
	const translation = translations[router.locale || 'en-US'];

	const deleteUserAccount = (event: any) => {
		event.preventDefault();

		const confirm = window.confirm(translation['confirmDelete']);

		if (!confirm) {
			return;
		}

		fetch('/api/user/delete', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then((data) => data.text())
			.then((data) => {
				router.push('/');
			});
	};

	const changePassword = (event: any) => {
		event.preventDefault();

		const { passwordNew, passwordNewConfirm } = event.target;

		if (passwordNew.value !== passwordNewConfirm.value) {
			alert(translation['changePasswordConfirmIncorrect']);
			return;
		}

		fetch('/api/user/changePassword', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				passwordNew: passwordNew.value,
			}),
		})
			.then((data) => data.text())
			.then((data) => {
				router.push('/');
			});
	};

	return (
		<>
			<Head>
				<title>{translation.Title}</title>
			</Head>
			<Layout data={props}>
				<div className={css.main}>
					<h1>{translation.Settings}</h1>
					<form onSubmit={deleteUserAccount}>
						<button>{translation.deleteAccount}</button>
					</form>
					<span />
					<form onSubmit={changePassword}>
						<input type="password" placeholder={translation.newPassword} name="passwordNew" />
						<input
							type="password"
							placeholder={translation.confirmNewPassword}
							name="passwordNewConfirm"
						/>
						<button>{translation.changePassword}</button>
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
