import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { createCustomDesignOrder, getCustomDesignOrdersByUserId } from "@/lib/database"
import { put } from "@vercel/blob"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    const token = authHeader.split(" ")[1]
    const decoded = await verifyToken(token)
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    const formData = await request.formData()
    const productType = formData.get("productType") as string
    const material = formData.get("material") as string
    const description = formData.get("description") as string
    const file = formData.get("file") as File

    if (!productType || !material || !description || !file) {
      return NextResponse.json({ success: false, message: "Eksik alanlar" }, { status: 400 })
    }

    const ext = file.name.split(".").pop() || ""
    const fileName = `custom-designs/${uuidv4()}.${ext}`
    const blob = await put(fileName, file, { access: "public", addRandomSuffix: false })
    const id = uuidv4()
    const order = await createCustomDesignOrder({
      id,
      user_id: decoded.userId,
      product_type: productType,
      material,
      description,
      image_url: blob.url,
      price: null,
    })

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error("Custom design order create error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }
    const token = authHeader.split(" ")[1]
    const decoded = await verifyToken(token)
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
    }

    const orders = await getCustomDesignOrdersByUserId(decoded.userId)
    return NextResponse.json({ success: true, orders })
  } catch (error) {
    console.error("Custom design order list error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}