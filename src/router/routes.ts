import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
	{
		path: '/login',
		name: 'Login',
		component: () => import('@/modules/auth/views/LoginView.vue'),
		meta: { layout: 'auth' },
	},
	{
		path: '/forgot-password',
		name: 'ForgotPassword',
		component: () => import('@/modules/auth/views/ForgotPasswordView.vue'),
		meta: { layout: 'auth' },
	},
	{
		path: '/update-password',
		name: 'UpdatePassword',
		component: () => import('@/modules/auth/views/UpdatePasswordView.vue'),
		meta: { layout: 'auth' },
	},
	{
		path: '/register-invite',
		name: 'RegisterInvite',
		component: () => import('@/modules/auth/views/RegisterInviteView.vue'),
		meta: { layout: 'auth' },
	},
	{
		path: '/',
		component: () => import('@/layouts/AppLayout.vue'),
		meta: { requiresAuth: true },
		children: [
			{
				path: '',
				name: 'Dashboard',
				component: () => import('@/modules/dashboard/views/DashboardView.vue'),
			},
			{
				path: 'quotes',
				name: 'Quotes',
				component: () => import('@/modules/quotes/views/QuoteListView.vue'),
			},
			{
				path: 'quotes/new',
				name: 'QuoteCreate',
				component: () => import('@/modules/quotes/views/QuoteCreateView.vue'),
			},
			{
				path: 'quotes/:id',
				name: 'QuoteEdit',
				component: () => import('@/modules/quotes/views/QuoteEditView.vue'),
			},
			{
				path: 'crm',
				name: 'CRM',
				component: () => import('@/modules/crm/views/ClientManagerView.vue'),
			},
			{
				path: 'inventory',
				name: 'Inventory',
				component: () => import('@/modules/inventory/views/InventoryView.vue'),
			},
			// Users Module
			{
				path: 'users',
				name: 'Users',
				component: () => import('@/modules/users/views/UsersView.vue'),
			},
			{
				path: 'users/roles',
				name: 'Roles',
				component: () => import('@/modules/users/views/RolesView.vue'),
			},
			{
				path: 'profile',
				name: 'Profile',
				component: () => import('@/modules/users/views/ProfileView.vue'),
			},
			{
				path: 'settings',
				name: 'Settings',
				component: () => import('@/modules/settings/views/SettingsView.vue'),
			},
			{
				path: 'agency',
				name: 'AgencyProfile',
				component: () => import('@/modules/agency/views/AgencyProfileView.vue'),
			},
			{
				path: 'settings/audit',
				name: 'Audit',
				component: () => import('@/modules/settings/views/AuditView.vue'),
			},
		],
	},
	// Fallback
	{
		path: '/:pathMatch(.*)*',
		redirect: '/',
	},
]
