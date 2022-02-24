import Link from 'next/link';
import { useRouter } from 'next/router';
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
	},
	'de-DE': {
		Home: 'Hauptseite',
		'My Groups': 'Meine Gruppen',
		Logout: 'Abmelden',
		Login: 'Anmelden',
		Register: 'Registrieren',
		Settings: 'Einstellungen',
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
				</ul>
			</div>
			{children}
		</div>
	);
}
