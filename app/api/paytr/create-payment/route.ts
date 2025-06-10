import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const paymentData = await request.json()

    // PayTR API'sine istek gönder
    const paytrResponse = await fetch("https://www.paytr.com/odeme/api/get-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(paymentData).toString(),
    })

    const result = await paytrResponse.text()

    // PayTR response'unu parse et
    if (result.startsWith("success:")) {
      const token = result.split(":")[1]
      return NextResponse.json({
        status: "success",
        token: token,
      })
    } else {
      return NextResponse.json({
        status: "failed",
        reason: result,
      })
    }
  } catch (error) {
    console.error("PayTR API hatası:", error)
    return NextResponse.json(
      {
        status: "failed",
        reason: "API hatası",
      },
      { status: 500 },
    )
  }
}
