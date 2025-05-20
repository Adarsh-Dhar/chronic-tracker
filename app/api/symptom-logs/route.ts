import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { symptomText, painLevel, triggers } = body
    
    // Validate required fields
    if (!symptomText) {
      return NextResponse.json(
        { error: 'Symptom text is required' },
        { status: 400 }
      )
    }
    
    // Create new symptom log in the database
    const symptomLog = await prisma.symptomLog.create({
      data: {
        symptomText,
        painLevel: typeof painLevel === 'number' ? painLevel : parseInt(painLevel),
        triggers,
        // userId can be added here when authentication is implemented
      },
    })
    
    return NextResponse.json({ success: true, data: symptomLog })
  } catch (error) {
    console.error('Error creating symptom log:', error)
    return NextResponse.json(
      { error: 'Failed to create symptom log' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    // Get the most recent symptom logs
    const logs = await prisma.symptomLog.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })
    
    return NextResponse.json({ success: true, data: logs })
  } catch (error) {
    console.error('Error fetching symptom logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch symptom logs' },
      { status: 500 }
    )
  }
}
