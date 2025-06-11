import { NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { verifyAdminToken } from "@/lib/auth"
import { v4 as uuidv4 } from "uuid"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    console.log("Upload API başladı")

    // Admin token kontrolü
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Token bulunamadı")
      return NextResponse.json({ success: false, message: "Yetkilendirme gerekli" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const adminPayload = await verifyAdminToken(token)

    if (!adminPayload) {
      console.log("Geçersiz token")
      return NextResponse.json({ success: false, message: "Geçersiz token" }, { status: 401 })
    }

    console.log("Token doğrulandı, dosya yükleniyor...")

    // Multipart form data işleme
    const formData = await request.formData()
    const file = formData.get("file") as File
    const fileType = (formData.get("fileType") as string) || "image"

    if (!file) {
      return NextResponse.json({ success: false, message: "Dosya bulunamadı" }, { status: 400 })
    }

    // Dosya tipi kontrolü
    const isImage = file.type.startsWith("image/")
    const isVideo = file.type.startsWith("video/")

    if (!isImage && !isVideo) {
      return NextResponse.json(
        { success: false, message: "Desteklenmeyen dosya formatı. Sadece resim ve video yükleyebilirsiniz." },
        { status: 400 },
      )
    }

    // Dosya boyutu kontrolü (max 50MB)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, message: "Dosya boyutu çok büyük. Maksimum 50MB yükleyebilirsiniz." },
        { status: 400 },
      )
    }

    // Dosya adı oluşturma
    const fileExtension = file.name.split(".").pop() || ""
    const uniqueId = uuidv4()
    const fileName = `${fileType === "image" ? "product-images" : "product-videos"}/${uniqueId}.${fileExtension}`

    console.log(`Dosya yükleniyor: ${fileName}, boyut: ${file.size} bytes`)

    // Vercel Blob'a yükleme
    const blob = await put(fileName, file, {
      access: "public",
      addRandomSuffix: false,
    })

    console.log("Dosya başarıyla yüklendi:", blob.url)

    return NextResponse.json({
      success: true,
      url: blob.url,
      fileName: fileName,
      fileType: fileType,
    })
  } catch (error) {
    console.error("Dosya yükleme hatası:", error)
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
