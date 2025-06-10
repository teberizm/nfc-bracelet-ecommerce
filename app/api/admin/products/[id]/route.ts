import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    console.log("Admin fetching product with ID:", id)

    // Demo ürün döndür
    const demoProduct = {
      id: id,
      name: "Demo Ürün " + id,
      description: "Demo ürün açıklaması",
      price: 299.99,
      stock: 10,
      category_name: "Demo Kategori",
      is_active: true,
      nfc_enabled: true,
    }

    return NextResponse.json({
      success: true,
      product: demoProduct,
    })
  } catch (error) {
    console.error("Error fetching product:", error)
    return NextResponse.json({ success: false, error: "Ürün yüklenemedi" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    const body = await request.json()
    console.log("Admin updating product with ID:", id)

    // Başarılı yanıt döndür
    return NextResponse.json({
      success: true,
      message: "Ürün güncellendi",
    })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ success: false, error: "Ürün güncellenemedi" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    console.log("Admin deleting product with ID:", id)

    // Başarılı yanıt döndür
    return NextResponse.json({
      success: true,
      message: "Ürün silindi",
    })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ success: false, error: "Ürün silinemedi" }, { status: 500 })
  }
}
