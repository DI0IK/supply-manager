import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState } from 'react';
import { Session, User } from '../managers/userManager';
import utilCss from '../styles/util.module.scss';

const translations: {
	[key: string]: {
		[key: string]: string;
	};
} = {
	'en-US': {
		Home: 'Home',
		'My Groups': 'My Groups',
		Logout: 'Logout',
		Login: 'Login',
		Register: 'Register',
		Settings: 'Settings',
		darkMode: 'Dark Mode',
		lightMode: 'Light Mode',
	},
	'de-DE': {
		Home: 'Hauptseite',
		'My Groups': 'Meine Gruppen',
		Logout: 'Abmelden',
		Login: 'Anmelden',
		Register: 'Registrieren',
		Settings: 'Einstellungen',
		darkMode: 'Dunkler Modus',
		lightMode: 'Heller Modus',
	},
};

export default function Header({
	data,
	children,
	className,
}: {
	data: { user: User; session: Session };
	children?: any;
	className?: string;
}) {
	const router = useRouter();
	const translation = translations[router.locale || 'en-US'];

	const initialValueDarkMode =
		typeof window === 'undefined'
			? 'light'
			: document.cookie.split('style=')[1]?.split(';')[0] || 'light';

	let [style, _setStyle] = useState(initialValueDarkMode);
	const styles = ['dark', 'light'];

	function iterateStyle() {
		let index = styles.indexOf(style);
		if (index === -1) {
			index = 0;
		}
		const indexNew = (index + 1) % styles.length;
		_setStyle(styles[indexNew]);
		document.cookie = `style=${styles[indexNew]}; path=/`;
		if (typeof window !== 'undefined') {
			document.body.parentElement?.classList.remove(styles[index] + 'Mode');
			document.body.parentElement?.classList.add(styles[indexNew] + 'Mode');
		}
	}
	function getNextStyle() {
		return styles[(styles.indexOf(style) + 1) % styles.length];
	}

	if (typeof window !== 'undefined') {
		document.body.parentElement?.classList.add(`${style}Mode`);
	}

	return (
		<div className={className || ''}>
			<div>
				<ul id="header">
					<li>
						<Link href="/">
							<a>{translation['Home']}</a>
						</Link>
					</li>
					{data && data.user && data.session ? (
						<>
							<li>
								<Link href="/groups">
									<a>{translation['My Groups']}</a>
								</Link>
							</li>
							<li>
								<div className={utilCss.dropdown}>
									<div>{data.user.username}</div>
									<div>
										<ul>
											<li>
												<Link href="/api/user/logout" prefetch={false}>
													<a>{translation['Logout']}</a>
												</Link>
											</li>
											<li>
												<Link href="/settings">
													<a>{translation['Settings']}</a>
												</Link>
											</li>
										</ul>
									</div>
								</div>
							</li>
						</>
					) : (
						<>
							<li>
								<Link href="/login">
									<a>{translation['Login']}</a>
								</Link>
							</li>
							<li>
								<Link href="/register">
									<a>{translation['Register']}</a>
								</Link>
							</li>
						</>
					)}
					<li>
						<div className={utilCss.dropdown}>
							<div>{router.locale}</div>
							<div>
								<ul>
									{router.locales?.map((locale) => (
										<li
											key={locale}
											className={locale === router.locale ? utilCss.selected : ''}
										>
											<Link locale={locale} href={router.asPath}>
												<a>{locale}</a>
											</Link>
										</li>
									))}
								</ul>
							</div>
						</div>
					</li>
					<li>
						<a onClick={() => iterateStyle()}>{translation[getNextStyle() + 'Mode']}</a>
					</li>
				</ul>
			</div>
			{children}
		</div>
	);
}
