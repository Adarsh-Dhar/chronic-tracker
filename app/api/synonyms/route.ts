import { NextRequest, NextResponse } from 'next/server';

// OpenRouter API endpoint
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function POST(request: NextRequest) {
  try {
    // Get the symptom text from the request body
    const { symptomText } = await request.json();
    
    if (!symptomText || typeof symptomText !== 'string') {
      return NextResponse.json(
        { error: 'Symptom text is required' },
        { status: 400 }
      );
    }

    // Generate synonyms and related terms using AI
    const relatedTerms = await generateRelatedTerms(symptomText);
    
    return NextResponse.json({
      data: relatedTerms
    });
    
  } catch (error) {
    console.error('Error generating related terms:', error);
    return NextResponse.json(
      { error: 'Failed to generate related terms' },
      { status: 500 }
    );
  }
}

async function generateRelatedTerms(symptomText: string) {
  // Check if API key is configured
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OpenRouter API key is not configured');
  }
  
  // Prepare the prompt for the AI
  const prompt = `
**Task**: Generate synonyms and related medical terms for the following symptom description.

**Symptom Description**:
${symptomText}

**Instructions**:
1. Identify all symptoms mentioned in the description
2. For each symptom, provide:
   - Medical terminology equivalents
   - Common alternative names
   - Related conditions or symptoms
   - Subtypes or variations
3. Format the output as a JSON object with the following structure:
   {
     "terms": [
       {
         "original": "[original term]",
         "medicalTerms": ["term1", "term2", ...],
         "commonNames": ["name1", "name2", ...],
         "relatedConditions": ["condition1", "condition2", ...],
         "variations": ["variation1", "variation2", ...]
       },
       ...
     ]
   }

**Important**: 
- Include only factually accurate medical terminology
- Focus on terms that would be useful for database searches
- Do not include speculative diagnoses
- Ensure all terms are relevant to the original symptoms
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
        model: 'anthropic/claude-3-haiku:beta', // Using Claude for better medical analysis
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more focused, deterministic output
        max_tokens: 1000,
        response_format: { type: "json_object" } // Request JSON formatted response
      })
    });

    if (!aiResponse.ok) {
      const errorData = await aiResponse.json();
      console.error('OpenRouter API error:', errorData);
      throw new Error(`OpenRouter API error: ${aiResponse.status}`);
    }

    const data = await aiResponse.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Unexpected OpenRouter API response format:', data);
      throw new Error('Unexpected response format from OpenRouter API');
    }
    
    // Parse the JSON string from the AI response
    let responseContent = data.choices[0].message.content;
    
    // If the response is a string that contains JSON, parse it
    if (typeof responseContent === 'string') {
      try {
        responseContent = JSON.parse(responseContent);
      } catch (e) {
        console.warn('Could not parse AI response as JSON, returning as is');
      }
    }
    
    return responseContent;
  } catch (error) {
    console.error('Error calling OpenRouter API:', error);
    throw error;
  }
}
