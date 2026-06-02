import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'index',
    'getting-started',
    {
      type: 'category',
      label: 'Reference',
      collapsed: false,
      items: ['types', 'utils', 'services'],
    },
    'result-contract',
    'changelog',
  ],
};

export default sidebars;
