import { defineConfig } from 'vitepress';

/** GitHub project Pages URL is /<repo>/ ; set only in deploy workflow (see deploy-docs.yml). */
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
const base =
	process.env.GITHUB_PAGES_DEPLOY === 'true' && repo ? `/${repo}/` : '/';

export default defineConfig({
	base,

	title: 'properties2js',
	description:
		'Convert .properties files to JavaScript, TypeScript, or JSON with nesting, flattening, and key transforms.',
	lang: 'en-US',

	head: [
		[
			'meta',
			{
				name: 'theme-color',
				content: '#2a9d72',
			},
		],
	],

	themeConfig: {
		logo: '/logo.svg',

		nav: [
			{ text: 'Home', link: '/' },
			{ text: 'Documentation', link: '/documentation/introduction' },
			{ text: 'Playground', link: '/playground' },
		],

		sidebar: {
			'/documentation/': [
				{
					text: 'Getting started',
					items: [
						{ text: 'Introduction', link: '/documentation/introduction' },
						{ text: 'Installation', link: '/documentation/installation' },
						{ text: '.properties format', link: '/documentation/properties-format' },
					],
				},
				{
					text: 'Usage',
					items: [
						{ text: 'CLI', link: '/documentation/cli' },
						{ text: 'Programmatic API', link: '/documentation/programmatic' },
						{ text: 'Options', link: '/documentation/options' },
						{ text: 'Examples', link: '/documentation/examples' },
					],
				},
				{
					text: 'More',
					items: [
						{ text: 'API reference', link: '/documentation/api' },
						{ text: 'Changelog', link: '/documentation/changelog' },
						{ text: 'License & links', link: '/documentation/license' },
					],
				},
			],
		},

		socialLinks: [
			{ icon: 'github', link: 'https://github.com/yartasdev/properties-to-js' },
		],

		footer: {
			message: 'Released under the ISC License.',
			copyright: 'Copyright © @yartasdev',
		},

		editLink: {
			pattern:
				'https://github.com/yartasdev/properties-to-js/edit/main/docs/:path',
			text: 'Edit this page on GitHub',
		},

		search: {
			provider: 'local',
		},

		outline: {
			label: 'On this page',
		},

		docFooter: {
			prev: 'Previous',
			next: 'Next',
		},
	},
});
