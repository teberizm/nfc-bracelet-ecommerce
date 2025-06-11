import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { orderIds, status } = body

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0 || !status) {
      return new NextResponse("Order IDs and status are required", { status: 400 })
    }

    // Bulk update orders
    const updatedOrders = await prisma.order.updateMany({
      where: {
        id: {
          in: orderIds,
        },
      },
      data: {
        status,
      },
    })

    return NextResponse.json({ updatedOrders, message: "Orders updated successfully" })
  } catch (error) {
    console.error("[ORDERS_BULK_PUT]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
