<script setup lang="ts">
import { Star, Github } from 'lucide-vue-next'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const GITHUB_URL = 'https://github.com/vinayakkulkarni/vue-nuxt-best-practices'
const INSTALL_COMMAND = 'npx skills add vinayakkulkarni/vue-nuxt-best-practices'

const starCount = ref<number | null>(null)

onMounted(async () => {
  try {
    const response = await fetch(
      'https://api.github.com/repos/vinayakkulkarni/vue-nuxt-best-practices'
    )
    const data = await response.json()
    if (data.stargazers_count) {
      starCount.value = data.stargazers_count
    }
  } catch {
    starCount.value = null
  }
})

function formatStars(count: number) {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`
  }
  return count.toString()
}
</script>

<template>
  <div class="flex min-h-screen flex-col items-center justify-center px-6 py-24">
    <div class="fixed top-4 right-4">
      <ThemeToggle />
    </div>

    <main class="flex max-w-2xl flex-col items-center gap-8 text-center">
      <a
        :href="GITHUB_URL"
        target="_blank"
        rel="noopener noreferrer"
        class="group"
      >
        <Badge
          variant="secondary"
          class="transition-colors group-hover:bg-accent"
        >
          <Star class="h-3.5 w-3.5" aria-hidden="true" />
          <span v-if="starCount !== null">{{ formatStars(starCount) }} stars on GitHub</span>
          <span v-else>Star on GitHub</span>
        </Badge>
      </a>

      <div class="flex flex-col items-center gap-4">
        <h1 class="text-4xl font-bold tracking-tight sm:text-5xl">
          Vue & Nuxt Skills<br />for Claude Code
        </h1>
        <p class="max-w-lg text-lg text-muted-foreground">
          AI agent skills for reactivity, component performance, data fetching,
          SSR patterns, and full-stack best practices. Built for Vue and Nuxt
          developers.
        </p>
      </div>

      <div class="flex w-full max-w-xl flex-col gap-2">
        <CopyCommand :command="INSTALL_COMMAND" />
        <p class="text-xs text-muted-foreground">
          Installs Vue & Nuxt skills to your Claude Code project
        </p>
      </div>

      <Button as="a" :href="GITHUB_URL" target="_blank" rel="noopener noreferrer" size="lg">
        <Github class="mr-2 h-4 w-4" aria-hidden="true" />
        View on GitHub
      </Button>
    </main>

    <footer class="mt-16 flex items-center justify-center gap-2 text-sm text-muted-foreground">
      <span>Built by</span>
      <a
        href="https://vinayakkulkarni.dev"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-foreground"
      >
        Vinayak Kulkarni
      </a>
    </footer>
  </div>
</template>
