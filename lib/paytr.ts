// PayTR API entegrasyonu
export interface PayTRConfig {
  merchant_id: string
  merchant_key: string
  merchant_salt: string
  test_mode: boolean
}

export interface PayTRPaymentRequest {
  merchant_id: string
  user_ip: string
  merchant_oid: string
  email: string
  payment_amount: string
  paytr_token: string
  user_basket: string
  user_name: string
  user_address: string
  user_phone: string
  merchant_ok_url: string
  merchant_fail_url: string
  timeout_limit: string
  debug_on: string
  test_mode: string
  no_installment: string
  max_installment: string
  currency: string
  lang: string
}

export interface PayTRResponse {
  status: "success" | "failed"
  reason?: string
  token?: string
}

// PayTR konfigürasyonu (gerçek uygulamada environment variables'dan alınacak)
const PAYTR_CONFIG: PayTRConfig = {
  merchant_id: process.env.NEXT_PUBLIC_PAYTR_MERCHANT_ID || "demo_merchant_id",
  merchant_key: process.env.PAYTR_MERCHANT_KEY || "demo_merchant_key",
  merchant_salt: process.env.PAYTR_MERCHANT_SALT || "demo_merchant_salt",
  test_mode: process.env.NODE_ENV !== "production",
}

export async function createPayTRToken(paymentData: {
  orderId: string
  amount: number
  userEmail: string
  userName: string
  userPhone: string
  userAddress: string
  userIP: string
  items: Array<{
    name: string
    price: number
    quantity: number
  }>
}): Promise<PayTRResponse> {
  try {
    // Sepet bilgilerini JSON formatında hazırla
    const userBasket = JSON.stringify(
      paymentData.items.map((item, index) => [
        item.name,
        (item.price * 100).toString(), // PayTR kuruş cinsinden bekler
        item.quantity.toString(),
      ]),
    )

    // PayTR için gerekli parametreler
    const paymentAmount = (paymentData.amount * 100).toString() // Kuruş cinsinden
    const merchantOid = paymentData.orderId
    const userIP = paymentData.userIP
    const timeoutLimit = "30"
    const debugOn = PAYTR_CONFIG.test_mode ? "1" : "0"
    const testMode = PAYTR_CONFIG.test_mode ? "1" : "0"
    const noInstallment = "0"
    const maxInstallment = "0"
    const currency = "TL"
    const lang = "tr"

    // Hash string oluştur
    const hashStr = [
      PAYTR_CONFIG.merchant_id,
      userIP,
      merchantOid,
      paymentData.userEmail,
      paymentAmount,
      userBasket,
      noInstallment,
      maxInstallment,
      currency,
      testMode,
      PAYTR_CONFIG.merchant_salt,
    ].join("")

    // HMAC-SHA256 hash hesapla (gerçek uygulamada crypto kullanılacak)
    const paytrToken = await generateHMAC(hashStr, PAYTR_CONFIG.merchant_key)

    const requestData: PayTRPaymentRequest = {
      merchant_id: PAYTR_CONFIG.merchant_id,
      user_ip: userIP,
      merchant_oid: merchantOid,
      email: paymentData.userEmail,
      payment_amount: paymentAmount,
      paytr_token: paytrToken,
      user_basket: userBasket,
      user_name: paymentData.userName,
      user_address: paymentData.userAddress,
      user_phone: paymentData.userPhone,
      merchant_ok_url: `${window.location.origin}/payment/success`,
      merchant_fail_url: `${window.location.origin}/payment/failed`,
      timeout_limit: timeoutLimit,
      debug_on: debugOn,
      test_mode: testMode,
      no_installment: noInstallment,
      max_installment: maxInstallment,
      currency: currency,
      lang: lang,
    }

    // PayTR API'sine istek gönder
    const response = await fetch("/api/paytr/create-payment", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    })

    const result = await response.json()
    return result
  } catch (error) {
    console.error("PayTR token oluşturma hatası:", error)
    return {
      status: "failed",
      reason: "Token oluşturma hatası",
    }
  }
}

// HMAC-SHA256 hash fonksiyonu (basitleştirilmiş)
async function generateHMAC(data: string, key: string): Promise<string> {
  // Gerçek uygulamada crypto-js veya Node.js crypto modülü kullanılacak
  // Bu demo amaçlı basitleştirilmiş bir implementasyon
  return btoa(data + key).substring(0, 64)
}

export function redirectToPayTR(token: string) {
  // PayTR ödeme sayfasına yönlendir
  const paytrUrl = PAYTR_CONFIG.test_mode ? "https://www.paytr.com/odeme/guvenli" : "https://www.paytr.com/odeme"

  window.location.href = `${paytrUrl}/${token}`
}
