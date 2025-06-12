import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    console.log("📤 Upload API başladı")

    // Geçici olarak mock URL döndür
    const formData = await request.formData()
    const file = formData.get("file") as File
    const fileType = (formData.get("fileType") as string) || "image"

    if (!file) {
      return NextResponse.json({ success: false, message: "Dosya bulunamadı" }, { status: 400 })
    }

    console.log("📄 Dosya bilgileri:", {
      name: file.name,
      size: file.size,
      type: file.type,
    })

    // Geçici olarak placeholder URL döndür
    const mockUrl = `/placeholder.svg?height=400&width=400&text=${encodeURIComponent(file.name)}`

    console.log("✅ Mock URL oluşturuldu:", mockUrl)

    return NextResponse.json({
      success: true,
      url: mockUrl,
      fileName: file.name,
      fileType: fileType,
    })
  } catch (error) {
    console.error("❌ Upload API hatası:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Dosya yüklenirken bir hata oluştu",
        error: error instanceof Error ? error.message : "Bilinmeyen hata",
      },
      { status: 500 },
    )
  }
}
