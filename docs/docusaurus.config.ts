import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import {themes as prismThemes} from 'prism-react-renderer';

const config: Config = {
  title: 'Propeller Core UI',
  tagline: 'Framework-agnostic core for the Propeller Commerce UI packages',
  favicon: 'img/favicon.png',

  url: 'https://propeller-commerce.github.io',
  baseUrl: '/propeller-v2-core-ui/',
  organizationName: 'propeller-commerce',
  projectName: 'propeller-v2-core-ui',
  trailingSlash: false,

  onBrokenLinks: 'warn',
  onBrokenAnchors: 'warn',
  markdown: {hooks: {onBrokenMarkdownLinks: 'warn'}},

  i18n: {defaultLocale: 'en', locales: ['en']},

  presets: [
    [
      'classic',
      {
        docs: {
          path: 'content',
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
        },
        blog: false,
        theme: {customCss: './src/css/custom.css'},
        sitemap: {changefreq: 'weekly', priority: 0.5},
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/social-card.png',
    colorMode: {
      defaultMode: 'light',
      respectPrefersColorScheme: true,
      disableSwitch: false,
    },
    navbar: {
      title: 'Propeller Core UI',
      logo: {
        alt: 'Propeller',
        src: 'img/logo.png',
        srcDark: 'img/logo-dark.png',
        height: 30,
      },
      items: [
        {to: '/getting-started', label: 'Getting started', position: 'left'},
        {to: '/types', label: 'Types', position: 'left'},
        {to: '/utils', label: 'Utilities', position: 'left'},
        {to: '/services', label: 'SDK seam', position: 'left'},
        {to: '/changelog', label: 'Changelog', position: 'left'},
        {
          href: 'https://github.com/propeller-commerce/propeller-v2-core-ui',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {label: 'Getting started', to: '/getting-started'},
            {label: 'Types', to: '/types'},
            {label: 'Utilities', to: '/utils'},
            {label: 'SDK seam', to: '/services'},
          ],
        },
        {
          title: 'Related packages',
          items: [
            {
              label: 'React UI',
              href: 'https://propeller-commerce.github.io/propeller-v2-react-ui/',
            },
            {
              label: 'Vue UI',
              href: 'https://propeller-commerce.github.io/propeller-v2-vue-ui/',
            },
            {
              label: 'SDK',
              href: 'https://propeller-commerce.github.io/propeller-sdk-v2/',
            },
          ],
        },
        {
          title: 'Resources',
          items: [
            {label: 'Changelog', to: '/changelog'},
            {
              label: 'GitHub',
              href: 'https://github.com/propeller-commerce/propeller-v2-core-ui',
            },
            {
              label: 'Propeller Commerce',
              href: 'https://propeller-commerce.com',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Propeller Commerce.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json'],
    },
  } satisfies Preset.ThemeConfig,

  plugins: [
    [
      require.resolve('@easyops-cn/docusaurus-search-local'),
      {
        hashed: true,
        indexDocs: true,
        indexBlog: false,
        docsRouteBasePath: '/',
      },
    ],
  ],
};

export default config;
