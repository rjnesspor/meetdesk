/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    {
      type: 'category',
      label: 'Overview',
      collapsed: false,
      items: ['intro', 'installation'],
    },
    {
      type: 'category',
      label: 'Guides',
      collapsed: false,
      items: ['control-panel', 'judge-tablet', 'score-display', 'troubleshooting'],
    },
  ],
};

module.exports = sidebars;
