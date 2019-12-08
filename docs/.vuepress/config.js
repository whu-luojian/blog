module.exports = {
  title: "烟罗的前端笔记",
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
            'git-version-control'
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
          title: '其它',
          collapsable: false,
          children: [
            'other-navigation'
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
