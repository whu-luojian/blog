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
            'css-cup-and-wing'
          ]
        }
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
