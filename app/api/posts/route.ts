// /app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { uploadImage } from '@/lib/utils'

export async function GET() {
  const posts = await prisma.post.findMany({
    include: { user: true, bids: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(posts)
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await request.formData()
  const location = formData.get('location') as string
  const description = formData.get('description') as string
  const estimatedCost = parseFloat(formData.get('estimatedCost') as string)
  const latitude = parseFloat(formData.get('latitude') as string)
  const longitude = parseFloat(formData.get('longitude') as string)
  const image = formData.get('image') as File

  try {
    const imageUrl = await uploadImage(image)

    const newPost = await prisma.post.create({
      data: {
        location,
        description,
        estimatedCost,
        currentFunding: 0,
        imageUrl,
        status: 'pending',
        latitude,
        longitude,
        userId: session.user.id,
      },
    })

    return NextResponse.json(newPost, { status: 201 })
  } catch (error) {
    console.error('Error creating post:', error)
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 })
  }
}