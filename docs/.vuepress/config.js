const path = require('path')
module.exports = {
  title: '',
  description: '',
  plugins: ['autobar'],
  palette: path.resolve(__dirname, 'palette.styl'),
  themeConfig: {
    repo: 'github地址',
    docsDir: 'docs',
    editLinks: true,
    sidebar: 'auto',
    sidebarDepth: 5,
    // editLinkText: 'Edit this page on GitHub',
    nav: [
      { text: '首页', link: '/' },
      {
        text: 'js',
        link: '/config/js/js',
        items: [
          { text: '基础', link: '/config/js/base/index' },
          { text: '设计模式', link: '/config/js/design/index' },
        ],
      },
      {
        text: 'Vue',
        link: '/config/Vue/Vue',
        items: [
          { text: '基础', link: '/config/Vue/base/index' },
          { text: 'SSR', link: '/config/Vue/SSR' },
          { text: 'nuxt', link: '/config/Vue/nuxt' },
          { text: '$message', link: '/config/Vue/$message' },
          { text: 'dom-diff', link: '/config/Vue/domDiff' },
        ],
      },
      {
        text: 'React',
        link: '/config/React/React',
        items: [
          { text: '基础', link: '/config/React/base/index' },
          { text: 'React-Hooks', link: '/config/React/react-hooks/index' },
          { text: 'React-Router', link: '/config/React/react-router/index' },
          { text: 'mobx', link: '/config/React/mobx/index' },
          { text: 'next', link: '/config/React/next' },
          {
            text: 'Redux',
            link: '/config/React/redux',
            items: [
              { text: 'redux', link: '/config/React/redux/index' },
              { text: 'redux-saga', link: '/config/React/redux/redux-saga' },
              {
                text: 'redux-middleware',
                link: '/config/React/redux-middleware',
              },
            ],
          },
          {
            text: 'Fiber',
            link: '/config/React/fiber',
            items: [
              { text: 'fiber机制', link: '/config/React/fiber/index1' },
              { text: 'fiber实现', link: '/config/React/fiber/index2' },
            ],
          },
        ],
      },
      { text: '问题汇总', link: '/config/front-matter1233' },
      { text: '算法&工具函数', link: '/config/front-matter123' },
      {
        text: '工程化',
        link: '/config/moduleTools',
        items: [
          {
            text: 'webpack',
            link: '/config/moduleTools/webpack',
            items: [
              {
                text: 'webpack1-文件分析',
                link: '/config/moduleTools/webpack/webpack1-文件分析',
              },
              {
                text: 'webpack2-loader',
                link: '/config/moduleTools/webpack/webpack2-loader',
              },
              {
                text: 'webpack3-源码流程',
                link: '/config/moduleTools/webpack/webpack3-源码流程',
              },
              {
                text: 'webpack4-plugin',
                link: '/config/moduleTools/webpack/webpack4-plugin',
              },
              {
                text: 'webpack-optimize1',
                link: '/config/moduleTools/webpack/webpack-optimize1',
              },
              {
                text: 'webpack-optimize2',
                link: '/config/moduleTools/webpack/webpack-optimize2',
              },
              {
                text: 'webpack-HMR',
                link: '/config/moduleTools/webpack/webpack-HMR',
              },
            ],
          },
          {
            text: 'rollup',
            link: '/config/moduleTools/rollup',
            items: [
              {
                text: 'rollup',
                link: '/config/moduleTools/rollup/index',
              },
            ],
          },
        ],
      },
      { text: '监控', link: '/config/front-matter123456' },
      { text: 'nginx', link: '/config/nginx/index' },
    ],

    // sidebar: {
    //   // '/config/': [
    //   //   '',
    //   //   // 'js/js'
    //   //   'front-matter',
    //   //   'palette'
    //   // ],
    // },
    smoothScroll: true,
  },
}
