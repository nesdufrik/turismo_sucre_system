<script setup lang="ts">
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useConfirm } from '@/composables/useConfirm'

const { isOpen, options, handleConfirm, handleCancel } = useConfirm()
</script>

<template>
  <AlertDialog :open="isOpen" @update:open="(val) => !val && handleCancel()">
    <AlertDialogContent class="z-[100]">
      <AlertDialogHeader>
        <AlertDialogTitle>{{ options.title }}</AlertDialogTitle>
        <AlertDialogDescription v-if="options.description">
          {{ options.description }}
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <Button variant="outline" @click="handleCancel">
          {{ options.cancelText }}
        </Button>
        <Button 
          @click="handleConfirm" 
          :variant="options.variant === 'destructive' ? 'destructive' : 'default'"
        >
          {{ options.confirmText }}
        </Button>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
</template>