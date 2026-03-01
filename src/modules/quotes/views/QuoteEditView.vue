<script setup lang="ts">
import { useRoute } from 'vue-router'
import QuoteEditor from '../components/QuoteEditor.vue'

const route = useRoute()
const id = Number(route.params.id)
</script>

<template>
  <QuoteEditor :quote-id="id" />
</template>
