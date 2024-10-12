// /app/api/posts/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Post } from '@/lib/types'

let posts: Post[] = []

export async function GET() {
  return NextResponse.json(posts)
}

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const location = formData.get('location') as string
  const description = formData.get('description') as string
  const estimatedCost = parseFloat(formData.get('estimatedCost') as string)
  const image = formData.get('image') as File | null

  const newPost: Post = {
    id: Date.now().toString(),
    location,
    description,
    estimatedCost,
    currentFunding: 0,
    imageUrl: image ? URL.createObjectURL(image) : '/placeholder.svg',
    status: 'pending',
    bids: [],
    createdAt: new Date().toISOString(),
  }

  posts.push(newPost)

  return NextResponse.json(newPost, { status: 201 })
}

// /app/api/posts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const post = posts.find(p => p.id === params.id)
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }
  return NextResponse.json(post)
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  const { amount } = await request.json()
  const post = posts.find(p => p.id === params.id)
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  post.currentFunding += amount
  if (post.currentFunding >= post.estimatedCost) {
    post.status = 'funded'
  }

  return NextResponse.json(post)
}

// /app/api/bids/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Bid } from '@/lib/types'

export async function POST(request: NextRequest) {
  const { postId, amount } = await request.json()
  const post = posts.find(p => p.id === postId)
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  const newBid: Bid = {
    id: Date.now().toString(),
    cleanerId: 'mock-cleaner-id', // In a real app, this would be the authenticated user's ID
    amount,
    createdAt: new Date().toISOString(),
  }

  post.bids.push(newBid)

  return NextResponse.json(newBid, { status: 201 })
}

// /app/api/feedback/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { Feedback } from '@/lib/types'

export async function POST(request: NextRequest) {
  const { postId, rating, comment } = await request.json()
  const post = posts.find(p => p.id === postId)
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  const newFeedback: Feedback = {
    id: Date.now().toString(),
    postId,
    userId: 'mock-user-id', // In a real app, this would be the authenticated user's ID
    rating,
    comment,
    createdAt: new Date().toISOString(),
  }

  // In a real app, you would save this feedback to a database
  console.log('New feedback:', newFeedback)

  return NextResponse.json(newFeedback, { status: 201 })
}