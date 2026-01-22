<script setup lang="ts">
import { Sun, Moon } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'

const colorMode = useColorMode()

function toggleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>

<template>
  <Button
    variant="ghost"
    size="icon"
    @click="toggleTheme"
    aria-label="Toggle theme"
  >
    <Sun v-if="colorMode.value === 'dark'" class="h-5 w-5" />
    <Moon v-else class="h-5 w-5" />
  </Button>
</template>
