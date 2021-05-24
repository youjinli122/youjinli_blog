module.exports = {
  title: '尤锦利',
  description: '努力者的时代',
  themeConfig: {
    repo: 'github地址', 
    docsDir: 'docs',
    editLinks: true,
    // editLinkText: 'Edit this page on GitHub',
    nav: [
      { text: '首页', link: '/'},
      { text: 'js', link: '/config/js/js', items: [
          {text: '基础', link: '/config/js/base/index'},
          {text: '设计模式', link: '/config/js/design/index'}
        ] 
      },
      { text: 'Vue', link: '/config/vue/vue' },
      { text: 'React', link: '/config/front-matter' },
      { text: '问题汇总', link: '/config/front-matter1233' },
      { text: '算法&工具函数', link: '/config/front-matter123' },
      { text: '工程化', link: '/config/front-matter1' },
      { text: '监控', link: '/config/front-matter123456' },
      { text: 'nginx', link: '/config/front-matter12' },
    ],
    // sidebarDepth: 4,
    sidebar: {
      // '/config/': [
      //   '',
      //   // 'js/js'
      //   'front-matter',
      //   'palette'
      // ],
    },
    smoothScroll: true,
  },
}

