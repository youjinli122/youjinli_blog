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
    sidebarDepth: 6,
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
          { text: 'vue', link: '/config/Vue/base/vue' },
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
          { text: 'React18', link: '/config/React/React18' },
          { text: 'mobx', link: '/config/React/mobx/index' },
          { text: 'next', link: '/config/React/next' },
          {
            text: 'React-Router',
            link: '/config/React/react-router/',
            items: [
              { text: 'router5', link: '/config/React/react-router/index' },
              {
                text: 'router6',
                link: '/config/React/react-router/react-router6',
              },
            ],
          },
          {
            text: 'react源码',
            link: '/config/React/react源码',
            items: [
              { text: 'react1', link: '/config/React/react源码/react1' },
              { text: 'react2', link: '/config/React/react源码/react2' },
              { text: 'react3', link: '/config/React/react源码/react3' },
              { text: 'react4', link: '/config/React/react源码/react4' },
              { text: 'react5', link: '/config/React/react源码/react5' },
              { text: 'react6', link: '/config/React/react源码/react6' },
            ],
          },
          {
            text: 'Redux',
            link: '/config/React/redux',
            items: [
              { text: 'redux', link: '/config/React/redux/index' },
              { text: 'redux-saga', link: '/config/React/redux/redux-saga' },
              {
                text: 'redux-middleware',
                link: '/config/React/redux/redux-middleware',
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
      { text: '微前端', link: '/config/微前端/index' },
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
              {
                text: 'webpack-tapable',
                link: '/config/moduleTools/webpack/webpack-tapable',
              },
              {
                text: 'webpack5',
                link: '/config/moduleTools/webpack/webpack5',
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
          {
            text: 'vite',
            link: '/config/moduleTools/vite',
            items: [
              {
                text: 'vite',
                link: '/config/moduleTools/vite/index',
              },
            ],
          },
        ],
      },
      {
        text: '性能/监控',
        link: '/config/性能监控',
        items: [
          {
            text: '性能',
            link: '/config/性能监控/性能',
            items: [
              {
                text: 'Lighthouse',
                link: '/config/性能监控/性能/Lighthouse',
              },
            ],
          },
        ],
      },
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
