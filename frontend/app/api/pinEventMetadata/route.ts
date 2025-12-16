import { NextRequest, NextResponse } from 'next/server'

const PINATA_JWT = process.env.PINATA_JWT

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, description, image, requirements, tags } = body

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      )
    }

    const metadata = {
      title,
      description,
      image: image || '',
      requirements: requirements || '',
      tags: tags || [],
      createdAt: Date.now()
    }

    // Pin to Pinata
    const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${PINATA_JWT}`
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: `event-${title.replace(/\s+/g, '-').toLowerCase()}`
        }
      })
    })

    if (!pinataResponse.ok) {
      const errorData = await pinataResponse.json()
      throw new Error(errorData.error || 'Failed to pin to IPFS')
    }

    const pinataData = await pinataResponse.json()

    return NextResponse.json({
      ipfsHash: pinataData.IpfsHash,
      metadata
    })
  } catch (error: any) {
    console.error('Error pinning event metadata:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to pin event metadata' },
      { status: 500 }
    )
  }
}
