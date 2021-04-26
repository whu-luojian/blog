module.exports = {
  title: "前端杂货铺",
  markdown: {
    lineNumbers: true
  },
  head: [
    ['link', { rel: 'icon', href: '/me.png' }]
  ],
  theme: 'antdesign',
  themeConfig: {
    logo: '/me.png',
    repo: "whu-luojian/blog",
    nav: [
      {
        text: "博客",
        link: "/blog/"
      },
      {
        text: "阅读",
        link: "/book/"
      },
      {
        text: "面试",
        link: "/interview/"
      },
      {
        text: '工具库',
        items: [
          { text: 'x-cli', link: 'https://github.com/whu-luojian/x-cli' },
          { text: 'gojs-vue', link: 'https://github.com/whu-luojian/gojs-vue' },
          { text: 'vuepress-theme-antdesign', link: 'https://github.com/whu-luojian/vuepress-theme-antdesign'},
          { text: 'template-vue-component', link: 'https://github.com/whu-luojian/template-vue-component'}
        ]
      }
    ],
    sidebar: {
      "/blog/": [
        {
          title: 'Linux',
          collapsable: false,
          children: [
            'linux-command'
          ]
        },
        {
          title: 'Git',
          collapsable: false,
          children: [
            'git-version-control',
            'git-account-config',
            'git-advance'
          ]
        },
        {
          title: 'HTML',
          collapsable: false,
          children: [
            'html-you-not-know'
          ]
        },
        {
          title: 'CSS',
          collapsable: false,
          children: [
            'css-cup-and-wing',
            'css-fc',
            'css-compatibility'
          ]
        },
        {
          title: 'JavaScript',
          collapsable: false,
          children: [
            'js-execution',
            'js-object-oriented',
            'tail-recursion',
            'functional-programming'
          ]
        },
        {
          title: '浏览器',
          collapsable: false,
          children: [
            'browser-frontend-cache',
            'browser-fps'
          ]
        },
        {
          title: 'Vue',
          collapsable: false,
          children: [
            'vue-nextTick',
            'vue-vuex',
            'vue-vue3',
            'vue-tracker'
          ]
        },
        {
          title: '工程化',
          collapsable: false,
          children: [
            'webpack',
            'webpack-optimize',
            'webpack-snippet',
            'npm',
            'yarn',
            'core-js'
          ]
        },
        {
          title: '其它',
          collapsable: false,
          children: [
            'other-navigation',
            'wonderful-article',
            'other-daily'
          ]
        }
      ],
      "/book/": [
        {
          title: '深入浅出Rxjs',
          collapsable: false,
          children: [
            'rxjs/introduction',
            'rxjs/operator'
          ]
        },
        {
          title: '深入浅出 Node.js',
          collapsable: false,
          children: [
            'node/introduction',
            'node/eventloop',
            'node/v8'
          ]
        },
        {
          title: 'WebGL 入门和实践',
          collapsable: false,
          children: [
            'WebGL/introduction',
            'WebGL/draw-point',
            'WebGL/draw-triangle'
          ]
        },
      ],
      "/interview/": [
        {
          title: '手写代码',
          collapsable: false,
          children: [
            'handwriting-bind',
            'handwriting-cloneDeep',
            'handwriting-promise',
            'handwriting-stringify'
          ]
        },
      ]
    },
    lastUpdated: "更新时间",
    docsDir: "docs",
    editLinks: true,
    editLinkText: "本文源码地址"
  },
  plugins: {
    '@vuepress/medium-zoom': {
      selector: 'img',
      options: {
          margin: 16
      }
    },
    '@vuepress/back-to-top':true
  }
}
