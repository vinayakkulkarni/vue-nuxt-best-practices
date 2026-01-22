<script setup lang="ts">
const colorMode = useColorMode()

useHead({
  htmlAttrs: {
    class: computed(() => colorMode.value),
  },
})
</script>

<template>
  <NuxtPage />
</template>
