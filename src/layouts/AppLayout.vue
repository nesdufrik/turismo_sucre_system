<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { useRoute } from 'vue-router'
import { computed, onMounted, watch } from 'vue'
import { useDark, useToggle } from '@vueuse/core'
import { usePermission } from '@/composables/usePermission'
import NavUser from '@/components/NavUser.vue'
import NotificationCenter from '@/components/notifications/NotificationCenter.vue'
import {
	LayoutDashboard,
	Users,
	Package,
	FileText,
	Settings,
	GalleryVerticalEnd,
	Moon,
	Sun,
	ShieldCheck,
	FileClock,
	ShieldUser,
	Building2,
	BadgeDollarSign,
	BookOpen,
} from 'lucide-vue-next'
import {
	SidebarProvider,
	Sidebar,
	SidebarHeader,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarFooter,
	SidebarInset,
	SidebarTrigger,
	SidebarRail,
	SidebarGroupLabel,
} from '@/components/ui/sidebar'
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { Separator } from '@/components/ui/separator'

const authStore = useAuthStore()
const route = useRoute()
const isDark = useDark()
const toggleDark = useToggle(isDark)
const { can } = usePermission()

const platformItems = computed(() => {
	const items = [
		{ title: 'Dashboard', url: '/', icon: LayoutDashboard },
		{
			title: 'Cotizaciones',
			url: '/quotes',
			icon: FileText,
			permission: 'quotes.view',
		},
		{
			title: 'Liquidaciones',
			url: '/liquidations',
			icon: BadgeDollarSign,
			permission: 'quotes.view',
		},
		{ title: 'Clientes', url: '/crm', icon: Users },
		{
			title: 'Inventario',
			url: '/inventory',
			icon: Package,
			permission: 'inventory.view',
		},
		{ title: 'Configuración', url: '/settings', icon: Settings },
	]

	return items.filter((item) => !item.permission || can(item.permission))
})

const systemItems = computed(() => {
	const items = [
		{
			title: 'Agencia',
			url: '/agency',
			icon: Building2,
		},
		{
			title: 'Auditoría',
			url: '/settings/audit',
			icon: FileClock,
			permission: 'audit.view', // Asumimos que quien ve usuarios puede ver auditoría (Admin)
		},
		{
			title: 'Usuarios',
			url: '/users',
			icon: ShieldCheck,
			permission: 'users.view',
		},
		{
			title: 'Roles',
			url: '/users/roles',
			icon: ShieldUser,
			permission: 'users.view',
		},
	]

	return items.filter((item) => !item.permission || can(item.permission))
})

onMounted(() => {
	if (authStore.user && !authStore.profile) {
		authStore.fetchProfile()
	}
})

// Watch for user changes (e.g. reload) to fetch profile
watch(
	() => authStore.user,
	(newUser) => {
		if (newUser && !authStore.profile) {
			authStore.fetchProfile()
		}
	},
)

const userData = computed(() => ({
	name: authStore.profile?.full_name || authStore.user?.email || 'Usuario',
	email: authStore.user?.email || '',
	avatar: authStore.profile?.avatar_url || '',
}))

const userRole = computed(() => {
	const role = authStore.user?.app_metadata?.authorization?.role || 'Invitado'
	return role.charAt(0).toUpperCase() + role.slice(1)
})

const resolvePath = (path: string) => {
	let p = path
	// Basic param replacement
	for (const key in route.params) {
		p = p.replace(`:${key}`, String(route.params[key]))
	}
	return p
}

const breadcrumbs = computed(() => {
	// Filter routes that have a name and aren't the root layout (if it has no name)
	const matched = route.matched.filter((r) => r.name)

	return matched.map((r, index) => {
		const isLast = index === matched.length - 1
		return {
			label: String(r.name),
			path: resolvePath(r.path),
			active: isLast,
		}
	})
})
</script>

<template>
	<SidebarProvider>
		<Sidebar collapsible="icon">
			<SidebarHeader>
				<SidebarMenuButton size="lg">
					<div
						class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground"
					>
						<GalleryVerticalEnd class="size-4" />
					</div>
					<div class="grid flex-1 text-left text-sm leading-tight">
						<span class="truncate font-medium"> Turismo Sucre </span>
						<span class="truncate text-xs text-muted-foreground">{{
							userRole
						}}</span>
					</div>
				</SidebarMenuButton>
			</SidebarHeader>

			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Plataforma</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem v-for="item in platformItems" :key="item.title">
								<SidebarMenuButton
									as-child
									:isActive="route.path === item.url"
									:tooltip="item.title"
								>
									<router-link :to="item.url">
										<component :is="item.icon" />
										<span>{{ item.title }}</span>
									</router-link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>

				<SidebarGroup v-if="systemItems.length > 0">
					<SidebarGroupLabel>Sistema</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem v-for="item in systemItems" :key="item.title">
								<SidebarMenuButton
									as-child
									:isActive="route.path === item.url"
									:tooltip="item.title"
								>
									<router-link :to="item.url">
										<component :is="item.icon" />
										<span>{{ item.title }}</span>
									</router-link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>

			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							as-child
							tooltip="Documentación"
						>
							<a
								href="https://turismo-sucre-system-manual.vercel.app/"
								target="_blank"
								rel="noopener noreferrer"
							>
								<BookOpen />
								<span>Documentación</span>
							</a>
						</SidebarMenuButton>
					</SidebarMenuItem>
					<SidebarMenuItem>
						<SidebarMenuButton @click="toggleDark()">
							<Sun v-if="!isDark" />
							<Moon v-else />
							<span>{{ isDark ? 'Modo Claro' : 'Modo Oscuro' }}</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
				<NavUser :user="userData" />
			</SidebarFooter>
			<SidebarRail />
		</Sidebar>

		<SidebarInset>
			<header
				class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
			>
				<div class="flex items-center gap-2 px-4">
					<SidebarTrigger class="-ml-1" />
					<Separator
						orientation="vertical"
						class="mr-2 data-[orientation=vertical]:h-4"
					/>
					<Breadcrumb>
						<BreadcrumbList>
							<template v-for="(crumb, index) in breadcrumbs" :key="crumb.path">
								<BreadcrumbItem class="hidden md:block">
									<BreadcrumbPage v-if="crumb.active">{{
										crumb.label
									}}</BreadcrumbPage>
									<BreadcrumbLink v-else :href="crumb.path">
										{{ crumb.label }}
									</BreadcrumbLink>
								</BreadcrumbItem>
								<BreadcrumbSeparator
									class="hidden md:block"
									v-if="index < breadcrumbs.length - 1"
								/>
							</template>
						</BreadcrumbList>
					</Breadcrumb>
				</div>
				<div class="ml-auto px-4 flex items-center gap-2">
					<NotificationCenter />
				</div>
			</header>
			<div class="flex flex-1 flex-col gap-4 p-4 pt-0">
				<router-view />
			</div>
		</SidebarInset>
	</SidebarProvider>
</template>
