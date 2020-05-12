module.exports = {
  title: "前端杂货铺",
  markdown: {
    lineNumbers: true
  },
  head: [
    ['link', { rel: 'icon', href: '/me.png' }]
  ],
  themeConfig: {
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
        text: "X UI",
        link: "https://whu-luojian.github.io/x-ui/#/introduce"
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
            'css-fc'
          ]
        },
        {
          title: 'JavaScript',
          collapsable: false,
          children: [
            'js-execution',
            'js-object-oriented'
          ]
        },
        {
          title: '浏览器',
          collapsable: false,
          children: [
            'browser-frontend-cache'
          ]
        },
        {
          title: 'Vue',
          collapsable: false,
          children: [
            'vue-nextTick'
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
            'rxjs-abc',
            'rxjs-operator-abc'
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
            'handwriting-promise'
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
