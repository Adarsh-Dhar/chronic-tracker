import { NextRequest, NextResponse } from 'next/server';
import { getCollection } from '@/lib/db/mongodb';
import { ObjectId } from 'mongodb';

// OpenRouter API endpoint
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Report types
type TimePeriod = 'past_week' | 'past_month' | 'past_3_months' | 'all_time';
type ReportType = 'comprehensive' | 'medication' | 'symptom_timeline' | 'doctor_visit';
type ReportSection = 'symptom_timeline' | 'trigger_analysis' | 'similar_cases' | 'medication_adherence' | 'ai_insights' | 'treatment_recommendations';

export async function GET(request: NextRequest) {
  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const timePeriod = searchParams.get('timePeriod') as TimePeriod || 'past_week';
  const reportType = searchParams.get('reportType') as ReportType || 'comprehensive';
  const sections = searchParams.getAll('sections') as ReportSection[] || [
    'symptom_timeline',
    'trigger_analysis',
    'similar_cases',
    'medication_adherence',
    'ai_insights',
    'treatment_recommendations'
  ];
  try {
    // Determine date filter based on time period
    const dateFilter: any = {};
    const now = new Date();
    
    if (timePeriod === 'past_week') {
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      dateFilter.createdAt = { $gte: oneWeekAgo };
    } else if (timePeriod === 'past_month') {
      const oneMonthAgo = new Date(now);
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      dateFilter.createdAt = { $gte: oneMonthAgo };
    } else if (timePeriod === 'past_3_months') {
      const threeMonthsAgo = new Date(now);
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      dateFilter.createdAt = { $gte: threeMonthsAgo };
    }
    
    // Fetch symptom logs with filters
    const collection = await getCollection('SymptomLog');
    const logs = await collection.find(dateFilter)
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
    
    // Call the OpenRouter API with parameters
    const response = await fetchAnalysisFromAI(formattedLogs, reportType, sections);
    
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

async function fetchAnalysisFromAI(symptomLogs: any, reportType: ReportType, sections: ReportSection[]) {
  // Check if API key is configured
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OpenRouter API key is not configured');
  }
  
  // Prepare the base prompt for the AI
  let basePrompt = `
**AI Prompt Template**

**Role**: You are a medical assistant AI that helps patients analyze their symptom logs and prepare comprehensive health reports.

**Symptom Log Entries**:
${JSON.stringify(symptomLogs, null, 2)}
`;

  // Add instructions based on report type
  let instructions = '';
  let outputFormat = '';
  
  if (reportType === 'comprehensive' || reportType === 'doctor_visit') {
    instructions += `
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
`;
    
    outputFormat += `
**Output Format**:
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
`;
  } else if (reportType === 'medication') {
    instructions += `
**Instructions**:
1. **Medication Analysis**:
   - Analyze the effectiveness of medications based on symptom patterns
   - Identify potential medication side effects
   - Suggest medication timing adjustments based on symptom patterns

2. **Recommendation Generation**:
   - Create specific recommendations for medication usage
   - Suggest questions about current medication regimen
   - Identify potential medication interactions or concerns
`;
    
    outputFormat += `
**Output Format**:
**Medication Report**

**Medication Effectiveness Analysis**:
- [Analysis 1]
- [Analysis 2]

**Recommended Adjustments**:
1. "Consider taking [MEDICATION] at [TIME] instead of [CURRENT TIME] to better manage [SYMPTOM]"
2. "Discuss with your doctor about [POTENTIAL INTERACTION] between your medications"

**Questions for Your Doctor**:
- "Could [SYMPTOM] be a side effect of [MEDICATION]?"
- "Would adjusting the dosage of [MEDICATION] help with [SYMPTOM]?"
`;
  } else if (reportType === 'symptom_timeline') {
    instructions += `
**Instructions**:
1. **Timeline Analysis**:
   - Create a chronological analysis of symptom progression
   - Identify patterns in symptom occurrence by time of day, week, or month
   - Highlight changes in symptom intensity over time

2. **Pattern Recognition**:
   - Identify cyclical patterns in symptoms
   - Note correlations between symptoms and external factors
   - Analyze progression or regression of symptoms over time
`;
    
    outputFormat += `
**Output Format**:
**Symptom Timeline Report**

**Chronological Patterns**:
- [Pattern 1]
- [Pattern 2]

**Time-Based Correlations**:
- "Symptoms tend to worsen at [TIME OF DAY/WEEK/MONTH]"
- "[SYMPTOM] has [IMPROVED/WORSENED] over the past [TIME PERIOD]"

**Progression Analysis**:
- Overall trend assessment of your condition
- Specific symptom progression details
`;
  }
  
  // Add section-specific instructions
  if (sections.includes('symptom_timeline')) {
    instructions += `
- Create a detailed timeline of symptom occurrences and intensity changes`;
  }
  
  if (sections.includes('trigger_analysis')) {
    instructions += `
- Analyze potential triggers and their correlation with symptoms`;
  }
  
  if (sections.includes('similar_cases')) {
    instructions += `
- Compare symptoms to similar medical conditions and cases`;
  }
  
  if (sections.includes('medication_adherence')) {
    instructions += `
- Analyze medication usage patterns and effectiveness`;
  }
  
  if (sections.includes('ai_insights')) {
    instructions += `
- Provide AI-powered insights based on medical knowledge and symptom patterns`;
  }
  
  if (sections.includes('treatment_recommendations')) {
    instructions += `
- Suggest potential treatment approaches to discuss with healthcare providers`;
  }
  
  // Add disclaimer
  outputFormat += `
**Disclaimer**: Always consult a medical professional for proper diagnosis. This AI-generated report is not medical advice.
`;
  
  // Combine all parts of the prompt
  const prompt = basePrompt + instructions + outputFormat;

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
