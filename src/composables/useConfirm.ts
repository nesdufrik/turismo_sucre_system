import { reactive, toRefs } from 'vue'

interface ConfirmOptions {
  title: string
  description?: string
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
}

const state = reactive<{
  isOpen: boolean
  options: ConfirmOptions
}>({
  isOpen: false,
  options: {
    title: '',
    description: '',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    variant: 'default'
  }
})

let resolvePromise: (value: boolean) => void = () => {}

export function useConfirm() {
  const confirm = (opts: ConfirmOptions) => {
    state.options = {
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      variant: 'default',
      ...opts
    }
    state.isOpen = true

    return new Promise<boolean>((resolve) => {
      resolvePromise = resolve
    })
  }

  const handleConfirm = () => {
    state.isOpen = false
    resolvePromise(true)
  }

  const handleCancel = () => {
    state.isOpen = false
    resolvePromise(false)
  }

  return {
    ...toRefs(state),
    confirm,
    handleConfirm,
    handleCancel
  }
}