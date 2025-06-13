import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
export function getWhatsAppUrl(phone: string, orderNumber: string) {
  const cleanPhone = phone.replace(/\D/g, "")
  const message = `Merhaba! ${orderNumber} numaralı siparişiniz hakkında bilgi vermek istiyorum.`
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
}