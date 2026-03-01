import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'
import { toast } from 'vue-sonner'

export interface Notification {
	id: string
	usuario_id: string
	titulo: string
	mensaje: string
	link: string | null
	leida: boolean
	tipo: string
	metadata: any
	fecha_creacion: string | null
}

export const useNotificationStore = defineStore('notifications', () => {
	const notifications = ref<Notification[]>([])
	const unreadCount = ref(0)
	const loading = ref(false)
	let subscription: any = null

	async function fetchNotifications() {
		loading.value = true
		try {
			const { data, error } = await supabase
				.from('notificaciones')
				.select('*')
				.order('fecha_creacion', { ascending: false })
				.limit(20)

			if (error) throw error
			notifications.value = (data || []) as Notification[]
			updateUnreadCount()
		} catch (error) {
			console.error('Error fetching notifications:', error)
		} finally {
			loading.value = false
		}
	}

	function updateUnreadCount() {
		unreadCount.value = notifications.value.filter((n) => !n.leida).length
	}

	async function markAsRead(id: string) {
		try {
			const { error } = await supabase
				.from('notificaciones')
				.update({ leida: true })
				.eq('id', id)

			if (error) throw error

			const index = notifications.value.findIndex((n) => n.id === id)
			if (index !== -1 && notifications.value[index]) {
				notifications.value[index].leida = true
				updateUnreadCount()
			}
		} catch (error) {
			console.error('Error marking notification as read:', error)
		}
	}

	async function markAllAsRead() {
		try {
			const { error } = await supabase
				.from('notificaciones')
				.update({ leida: true })
				.eq('leida', false)

			if (error) throw error

			notifications.value.forEach((n) => (n.leida = true))
			unreadCount.value = 0
		} catch (error) {
			console.error('Error marking all as read:', error)
		}
	}

	function subscribe() {
		if (subscription) return

		subscription = supabase
			.channel('public:notificaciones')
			.on(
				'postgres_changes',
				{ event: 'INSERT', schema: 'public', table: 'notificaciones' },
				(payload) => {
					const newNotif = payload.new as Notification
					notifications.value.unshift(newNotif)
					updateUnreadCount()

					// Show toast
					toast.info(newNotif.titulo, {
						description: newNotif.mensaje,
						duration: 5000,
					})
				},
			)
			.subscribe()
	}

	function unsubscribe() {
		if (subscription) {
			supabase.removeChannel(subscription)
			subscription = null
		}
	}

	return {
		notifications,
		unreadCount,
		loading,
		fetchNotifications,
		markAsRead,
		markAllAsRead,
		subscribe,
		unsubscribe,
	}
})
