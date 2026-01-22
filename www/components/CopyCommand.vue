<script setup lang="ts">
import { Terminal, Copy, Check } from 'lucide-vue-next'

interface Props {
  command: string
}

defineProps<Props>()

const copied = ref(false)

async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('Failed to copy:', err)
  }
}
</script>

<template>
  <button
    class="flex w-full items-center gap-2 rounded-lg border bg-muted/50 px-4 py-3 font-mono text-sm transition-colors hover:bg-muted cursor-pointer"
    @click="copyToClipboard(command)"
  >
    <Terminal class="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
    <code class="flex-1 overflow-x-auto text-left">{{ command }}</code>
    <Check
      v-if="copied"
      class="h-4 w-4 shrink-0 text-green-500"
      aria-hidden="true"
    />
    <Copy
      v-else
      class="h-4 w-4 shrink-0 text-muted-foreground"
      aria-hidden="true"
    />
  </button>
</template>
