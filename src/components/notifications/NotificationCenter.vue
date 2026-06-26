<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useNotificationStore } from '@/stores/notifications'
import { useAuthStore } from '@/stores/auth'
import { Bell } from 'lucide-vue-next'
import { Button } from '@/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { formatDistance } from '@/lib/date-utils'
import { useRouter } from 'vue-router'

const notificationStore = useNotificationStore()
const authStore = useAuthStore()
const router = useRouter()

onMounted(() => {
	if (authStore.user) {
		notificationStore.fetchNotifications()
		notificationStore.subscribe()
	}
})

onUnmounted(() => {
	notificationStore.unsubscribe()
})

const handleNotificationClick = (notification: any) => {
	notificationStore.markAsRead(notification.id)
	if (notification.link) {
		router.push(notification.link)
	}
}
</script>

<template>
	<DropdownMenu>
		<DropdownMenuTrigger as-child>
			<Button variant="ghost" size="icon" class="relative">
				<Bell class="h-5 w-5" />
				<Badge
					v-if="notificationStore.unreadCount > 0"
					class="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-destructive text-destructive-foreground border-2 border-background"
				>
					{{
						notificationStore.unreadCount > 9
							? '9+'
							: notificationStore.unreadCount
					}}
				</Badge>
			</Button>
		</DropdownMenuTrigger>
		<DropdownMenuContent align="end" class="w-80 p-0">
			<div class="flex items-center justify-between p-4 border-b">
				<h3 class="font-semibold text-sm">Notificaciones</h3>
				<Button
					v-if="notificationStore.unreadCount > 0"
					variant="ghost"
					size="sm"
					class="text-xs h-auto p-0 hover:bg-transparent text-primary hover:text-primary/80"
					@click="notificationStore.markAllAsRead"
				>
					Marcar todo como leído
				</Button>
			</div>

			<ScrollArea class="h-[400px]">
				<div
					v-if="notificationStore.notifications.length === 0"
					class="p-8 text-center text-muted-foreground text-sm"
				>
					No tienes notificaciones
				</div>
				<div v-else class="flex flex-col">
					<button
						v-for="notif in notificationStore.notifications"
						:key="notif.id"
						class="flex flex-col gap-1 p-4 text-left hover:bg-muted transition-colors border-b last:border-0 relative"
						@click="handleNotificationClick(notif)"
					>
						<div class="flex items-start justify-between gap-2">
							<span
								:class="[
									'font-medium text-sm',
									!notif.leida ? 'text-foreground' : 'text-muted-foreground',
								]"
							>
								{{ notif.titulo }}
							</span>
							<span
								v-if="!notif.leida"
								class="min-w-2 h-2 rounded-full bg-primary mt-1.5"
							/>
						</div>
						<p class="text-xs text-muted-foreground line-clamp-2">
							{{ notif.mensaje }}
						</p>
						<span class="text-[10px] text-muted-foreground mt-1">
							{{ formatDistance(notif.fecha_creacion) }}
						</span>
					</button>
				</div>
			</ScrollArea>
		</DropdownMenuContent>
	</DropdownMenu>
</template>
