module.exports = {
  title: "烟罗的前端博客",
  themeConfig: {
    repo: "lmjben/blog",
    nav: [
      {
        text: "博客",
        link: "/blog/"
      },
      {
        text: "面试题",
        link: "/interview/"
      },
      {
        text: "阅读",
        link: "/book/"
      }
    ],
    sidebar: {
      "/blog/": [
        {
          title: 'DevOps',
          collapsable: false,
          children: []
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
