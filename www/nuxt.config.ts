import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-01-23',
  devtools: { enabled: true },
  modules: ['shadcn-nuxt', '@nuxtjs/color-mode'],
  vite: {
    plugins: [tailwindcss()],
  },
  shadcn: {
    prefix: '',
    componentDir: './components/ui',
  },
  colorMode: {
    classSuffix: '',
  },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Vue & Nuxt Skills for Claude Code',
      meta: [
        {
          name: 'description',
          content:
            'AI agent skills for reactivity, component performance, data fetching, SSR patterns, and full-stack best practices. Built for Vue and Nuxt developers.',
        },
        { property: 'og:title', content: 'Vue & Nuxt Skills for Claude Code' },
        {
          property: 'og:description',
          content:
            'AI agent skills for reactivity, component performance, data fetching, SSR patterns, and full-stack best practices.',
        },
        { property: 'og:type', content: 'website' },
        { name: 'twitter:card', content: 'summary_large_image' },
        {
          name: 'twitter:title',
          content: 'Vue & Nuxt Skills for Claude Code',
        },
        {
          name: 'twitter:description',
          content:
            'AI agent skills for reactivity, component performance, data fetching, SSR patterns, and full-stack best practices.',
        },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: '',
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap',
        },
      ],
    },
  },
})
