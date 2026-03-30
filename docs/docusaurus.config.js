// @ts-check
const { themes } = require('prism-react-renderer');

/** @type {import('@docusaurus/types').Config} */
const config = {
    title: 'MeetDesk',
    tagline: 'Competition management for gymnastics meets',
    favicon: 'img/meetdesk.ico',

    url: 'https://meetdesk.app', // replace with your actual URL
    baseUrl: '/',

    onBrokenLinks: 'throw',
    onBrokenMarkdownLinks: 'warn',

    i18n: {
        defaultLocale: 'en',
        locales: ['en'],
    },

    organizationName: 'rjnesspor',
    projectName: 'meetdesk',
    deploymentBranch: 'gh-pages',
    trailingSlash: false,

    presets: [
        [
            'classic',
            /** @type {import('@docusaurus/preset-classic').Options} */
            ({
                docs: {
                    sidebarPath: require.resolve('./sidebars.js'),
                    sidebarCollapsed: false,
                },
                blog: false,
                theme: {
                    customCss: require.resolve('./src/css/custom.css'),
                },
            }),
        ],
    ],

    themeConfig:
        /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
        ({
            colorMode: {
                defaultMode: 'dark',
                disableSwitch: true,
                respectPrefersColorScheme: false,
            },

            navbar: {
                title: 'MeetDesk',
                logo: {
                    alt: 'MeetDesk',
                    src: './img/meetdesk.png',
                },
                items: [
                    {
                        type: 'docSidebar',
                        sidebarId: 'docs',
                        position: 'left',
                        label: 'Docs',
                    },
                ],
            },

            footer: undefined,

            prism: {
                theme: themes.oneDark,
                darkTheme: themes.oneDark,
            },
        }),
};

module.exports = config;
