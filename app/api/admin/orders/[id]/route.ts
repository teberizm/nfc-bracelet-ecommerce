import prisma from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id

    if (!orderId) {
      return new NextResponse("Order ID is required", { status: 400 })
    }

    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        shippingAddress: true,
        user: true,
      },
    })

    if (!order) {
      return new NextResponse("Order not found", { status: 404 })
    }

    return NextResponse.json(order)
  } catch (error) {
    console.error("[ORDER_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id
    const body = await req.json()

    const { status } = body

    if (!orderId) {
      return new NextResponse("Order ID is required", { status: 400 })
    }

    if (!status) {
      return new NextResponse("Status is required", { status: 400 })
    }

    const order = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        status,
      },
    })

    return NextResponse.json(order)
  } catch (error) {
    console.error("[ORDER_PATCH]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
