<script setup lang="ts">
import 'vue-sonner/style.css'
import { Toaster } from '@/components/ui/sonner'
import { useRoute } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import GlobalConfirmDialog from '@/components/GlobalConfirmDialog.vue'
import { Analytics } from '@vercel/analytics/vue'

const route = useRoute()
</script>

<template>
	<Analytics />
	<component :is="route.meta.layout === 'auth' ? AuthLayout : 'div'">
		<router-view />
	</component>
	<Toaster />
    <GlobalConfirmDialog />
</template>