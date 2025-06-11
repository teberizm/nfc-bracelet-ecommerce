import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    const theme = await sql`
      SELECT 
        id,
        name,
        slug,
        description,
        preview_image,
        layout_config,
        is_premium,
        is_active,
        download_count,
        created_at,
        updated_at
      FROM nfc_themes 
      WHERE id = ${id}
    `

    if (theme.length === 0) {
      return NextResponse.json({ success: false, message: "Tema bulunamadı" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      theme: theme[0],
    })
  } catch (error) {
    console.error("Tema detay hatası:", error)
    return NextResponse.json({ success: false, message: "Tema yüklenirken hata oluştu" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const body = await request.json()
    const { action, ...updateData } = body

    if (action === "toggle_status") {
      await sql`
        UPDATE nfc_themes 
        SET 
          is_active = NOT is_active,
          updated_at = NOW()
        WHERE id = ${id}
      `

      return NextResponse.json({
        success: true,
        message: "Tema durumu güncellendi",
      })
    }

    // Diğer güncelleme işlemleri
    const { name, description, type, colors, layout, is_premium } = updateData

    if (name || description || type) {
      const layoutConfig = {
        type: type || "love",
        colors: colors || ["#ff69b4", "#ff1493"],
        layout: layout || "romantic",
      }

      await sql`
        UPDATE nfc_themes 
        SET 
          name = COALESCE(${name}, name),
          description = COALESCE(${description}, description),
          layout_config = COALESCE(${JSON.stringify(layoutConfig)}, layout_config),
          is_premium = COALESCE(${is_premium}, is_premium),
          updated_at = NOW()
        WHERE id = ${id}
      `
    }

    return NextResponse.json({
      success: true,
      message: "Tema güncellendi",
    })
  } catch (error) {
    console.error("Tema güncelleme hatası:", error)
    return NextResponse.json({ success: false, message: "Tema güncellenirken hata oluştu" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    await sql`
      DELETE FROM nfc_themes 
      WHERE id = ${id}
    `

    return NextResponse.json({
      success: true,
      message: "Tema silindi",
    })
  } catch (error) {
    console.error("Tema silme hatası:", error)
    return NextResponse.json({ success: false, message: "Tema silinirken hata oluştu" }, { status: 500 })
  }
}
