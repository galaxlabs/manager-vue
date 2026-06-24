/**
 * Toast helper — use this in pages instead of alert()
 * Usage: import { toast } from '@/utils/toast'
 *   toast.success('Saved!')
 *   toast.error('Failed')
 *   toast.info('Processing...')
 *   toast.warning('Check your input')
 */
import { useToastStore } from '@/stores/toast'

let _toast = null
function getToast() {
  if (!_toast) _toast = useToastStore()
  return _toast
}

export const toast = {
  success(msg) { getToast().success(msg) },
  error(msg) { getToast().error(msg) },
  info(msg) { getToast().info(msg) },
  warning(msg) { getToast().warning(msg) },
}
