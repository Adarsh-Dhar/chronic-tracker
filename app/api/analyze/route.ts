import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongodb';

// OpenRouter API endpoint
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function GET() {
  try {
    // Fetch all symptom logs
    const collection = await getCollection('SymptomLog');
    const logs = await collection.find({})
      .sort({ createdAt: -1 })
      .toArray();
    
    // Format the logs for the AI prompt
    const formattedLogs = {
      entries: logs.map(log => ({
        symptomText: log.symptomText,
        painLevel: log.painLevel,
        triggers: log.triggers,
        createdAt: log.createdAt.toISOString()
      }))
    };
    
    // If no logs found, return an error
    if (formattedLogs.entries.length === 0) {
      return NextResponse.json(
        { error: 'No symptom logs found to analyze' },
        { status: 404 }
      );
    }
    
    // Call the OpenRouter API
    const response = await fetchAnalysisFromAI(formattedLogs);
    
    return NextResponse.json({
      data: response
    });
    
  } catch (error) {
    console.error('Error analyzing symptom logs:', error);
    return NextResponse.json(
      { error: 'Failed to analyze symptom logs' },
      { status: 500 }
    );
  }
}

async function fetchAnalysisFromAI(symptomLogs: any) {
  // Check if API key is configured
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OpenRouter API key is not configured');
  }
  
  // Prepare the prompt for the AI
  const prompt = `
**AI Prompt Template**

**Role**: You are a medical assistant AI that helps patients prepare for doctor visits by analyzing their symptom logs. Generate a list of 5-7 prioritized questions and discussion topics for the patient to bring to their doctor, based on the following symptom data:

**Symptom Log Entries**:
${JSON.stringify(symptomLogs, null, 2)}

**Instructions**:
1. **Pattern Identification**:
   - Analyze frequency of similar symptoms
   - Identify pain level trends over time
   - Highlight recurring triggers

2. **Question Generation**:
   - Create specific questions about symptom patterns
   - Formulate inquiries about potential triggers
   - Suggest asking about pain management options
   - Recommend discussing diagnostic possibilities

3. **Output Format**:
   **Patient Preparation Report**
   
   **Key Patterns Identified**:
   - [Pattern 1]
   - [Pattern 2]
   
   **Recommended Questions**:
   1. "Given my [SYMPTOM] occurring [FREQUENCY] with [TRIGGERS], could this indicate [CONDITION]?"
   2. "What diagnostic tests would help explain [SPECIFIC SYMPTOM PATTERN]?"
   3. "For pain levels averaging [X]/10, what non-pharmaceutical options do you recommend?"
   
   **Discussion Topics**:
   - Possible connections between [TRIGGER] and [SYMPTOM]
   - Long-term management strategies for [SYMPTOM TYPE]
   - Preventive measures based on trigger frequency

   **Disclaimer**: Always consult a medical professional for proper diagnosis. This AI-generated report is not medical advice.
`;

  try {
    const aiResponse = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.APP_URL || 'http://localhost:3001', // Required for OpenRouter
        'X-Title': 'Chronic Tracker' // Optional - your app's name
      },
      body: JSON.stringify({
        model: 'deepseek/deepseek-r1:free', // You can change this to your preferred model
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      })
    });

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json();
      console.error('OpenRouter API error:', errorData);
      throw new Error(`OpenRouter API error: ${aiResponse.status}`);
    }

    const data = await aiResponse.json();
    console.log('OpenRouter API response:', data);
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected OpenRouter API response format:', data);
      throw new Error('Unexpected response format from OpenRouter API');
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    throw error;
  }
}
