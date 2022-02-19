/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	i18n: {
		locales: ['en-US', 'de-DE'],
		defaultLocale: 'en-US',
		localeDetection: false,
	},
};

module.exports = nextConfig;
