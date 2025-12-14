import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Zentro",
  description: "A high-performance, lightweight API Gateway built with Go and React.",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Management UI', link: '/guide/management-ui' },
      { text: 'API', link: '/api/introduction' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Getting Started', link: '/guide/getting-started' },
            { text: 'Configuration', link: '/guide/configuration' },
            { text: 'Management UI', link: '/guide/management-ui' },
            { text: 'Architecture', link: '/guide/architecture' },
            { text: 'Deployment', link: '/guide/deployment' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Introduction', link: '/api/introduction' },
            { text: 'Endpoints', link: '/api/endpoints' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/fike110/zentro' }
    ]
  }
})
