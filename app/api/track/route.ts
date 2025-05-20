import { NextRequest, NextResponse } from 'next/server';
import { getCollection, ObjectId, SymptomLog } from '@/lib/db/mongodb';

export async function GET() {
  try {
    // Fetch the most recent symptom logs (limit to 5)
    const collection = await getCollection('SymptomLog');
    const recentLogs = await collection.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();
    
    return NextResponse.json({
      data: recentLogs
    });
    
  } catch (error) {
    console.error('Error fetching symptom logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch symptom logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
    console.log("hi")
  try {
    // Parse the request body
    const body = await request.json();
    console.log("body", body)
    
    // Extract the data
    const { symptomText, painLevel, triggers } = body;
    
    // Validate the input
    if (!symptomText) {
      return NextResponse.json(
        { error: 'Symptom description is required' },
        { status: 400 }
      );
    }
    
    if (typeof painLevel !== 'number' || painLevel < 1 || painLevel > 10) {
      return NextResponse.json(
        { error: 'Pain level must be a number between 1 and 10' },
        { status: 400 }
      );
    }
    
    // Create the symptom log document
    const now = new Date();
    const symptomLogData: SymptomLog = {
      createdAt: now,
      updatedAt: now,
      symptomText,
      painLevel,
      triggers: Array.isArray(triggers) ? triggers : [],
    };
    
    // Insert into MongoDB
    const collection = await getCollection('SymptomLog');
    const result = await collection.insertOne(symptomLogData);
    
    // Get the inserted document with the generated ID
    const symptomLog = {
      _id: result.insertedId,
      ...symptomLogData
    };

    console.log("symptom log", symptomLog)
    
    // Return the created symptom log
    return NextResponse.json({
      message: 'Symptom log created successfully',
      data: symptomLog,
    }, { status: 201 });
    
  } catch (error) {
    console.error('Error creating symptom log:', error);
    return NextResponse.json(
      { error: 'Failed to create symptom log' },
      { status: 500 }
    );
  }
}
