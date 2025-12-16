import { NextRequest, NextResponse } from 'next/server'
import { createPublicClient, http } from 'viem'
import { celo } from 'viem/chains'

const publicClient = createPublicClient({
  chain: celo,
  transport: http()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, abi, functionName, args = [] } = body

    if (!address || !abi || !functionName) {
      console.error('Blockchain read validation failed:', { 
        hasAddress: !!address, 
        hasAbi: !!abi, 
        hasFunctionName: !!functionName 
      })
      return NextResponse.json(
        { error: 'Missing required parameters', details: { hasAddress: !!address, hasAbi: !!abi, hasFunctionName: !!functionName } },
        { status: 400 }
      )
    }

    const result = await publicClient.readContract({
      address: address as `0x${string}`,
      abi,
      functionName,
      args
    })

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Error reading from blockchain:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to read from blockchain' },
      { status: 500 }
    )
  }
}
