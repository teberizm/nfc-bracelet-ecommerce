import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET() {
  try {
    const themes = await sql`
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
      ORDER BY created_at DESC
    `

    return NextResponse.json({
      success: true,
      themes: themes,
    })
  } catch (error) {
    console.error("Tema listesi hatası:", error)
    return NextResponse.json({ success: false, message: "Temalar yüklenirken hata oluştu" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, type, colors, layout, is_premium } = body

    if (!name || !description || !type) {
      return NextResponse.json({ success: false, message: "Gerekli alanlar eksik" }, { status: 400 })
    }

    // Slug oluştur
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .trim()

    const layoutConfig = {
      type,
      colors: colors || ["#ff69b4", "#ff1493"],
      layout: layout || "romantic",
    }

    const result = await sql`
      INSERT INTO nfc_themes (
        name, 
        slug, 
        description, 
        layout_config, 
        is_premium, 
        is_active,
        download_count,
        created_at,
        updated_at
      ) VALUES (
        ${name},
        ${slug},
        ${description},
        ${JSON.stringify(layoutConfig)},
        ${is_premium || false},
        true,
        0,
        NOW(),
        NOW()
      )
      RETURNING id
    `

    return NextResponse.json({
      success: true,
      message: "Tema başarıyla oluşturuldu",
      themeId: result[0].id,
    })
  } catch (error) {
    console.error("Tema oluşturma hatası:", error)
    return NextResponse.json({ success: false, message: "Tema oluşturulurken hata oluştu" }, { status: 500 })
  }
}
