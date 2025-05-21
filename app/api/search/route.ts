import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';

// Define types for the search results
type SearchResult = {
  dataset: string;
  records: Record<string, any>[];
  totalMatches: number;
};

type SearchResponse = {
  results: SearchResult[];
  totalMatchesAcrossDatasets: number;
  searchTerms: string[];
  executionTimeMs: number;
};

export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Get the search terms from the request body
    const { searchTerms } = await request.json();
    
    if (!searchTerms || !Array.isArray(searchTerms) || searchTerms.length === 0) {
      return NextResponse.json(
        { error: 'Search terms are required and must be an array' },
        { status: 400 }
      );
    }

    // Create case-insensitive regex patterns for each search term
    const searchPatterns = searchTerms.map(term => 
      new RegExp(term.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), 'i')
    );
    
    // Search through all datasets
    const results = await searchDatasets(searchPatterns);
    
    const endTime = Date.now();
    const executionTimeMs = endTime - startTime;
    
    // Calculate total matches across all datasets
    const totalMatchesAcrossDatasets = results.reduce(
      (total, result) => total + result.totalMatches, 0
    );
    
    return NextResponse.json({
      results,
      totalMatchesAcrossDatasets,
      searchTerms,
      executionTimeMs
    });
    
  } catch (error) {
    console.error('Error searching datasets:', error);
    return NextResponse.json(
      { error: 'Failed to search datasets' },
      { status: 500 }
    );
  }
}

async function searchDatasets(searchPatterns: RegExp[]): Promise<SearchResult[]> {
  const datasetsDir = path.join(process.cwd(), 'datasets');
  
  try {
    // Check if the datasets directory exists
    if (!fs.existsSync(datasetsDir)) {
      console.error(`Datasets directory not found: ${datasetsDir}`);
      return [];
    }
    
    const datasetFiles = fs.readdirSync(datasetsDir).filter(file => file.endsWith('.csv'));
    
    if (datasetFiles.length === 0) {
      console.warn('No CSV files found in the datasets directory');
      return [];
    }
    
    const results: SearchResult[] = [];
    
    for (const datasetFile of datasetFiles) {
      try {
        const datasetPath = path.join(datasetsDir, datasetFile);
        const result = await searchDataset(datasetPath, datasetFile, searchPatterns);
        results.push(result);
      } catch (error) {
        console.error(`Error searching dataset ${datasetFile}:`, error);
        // Add an empty result for this dataset to maintain the structure
        results.push({
          dataset: datasetFile,
          records: [],
          totalMatches: 0
        });
      }
    }
    
    return results;
  } catch (error) {
    console.error('Error accessing datasets directory:', error);
    return [];
  }
}

async function searchDataset(datasetPath: string, datasetName: string, searchPatterns: RegExp[]): Promise<SearchResult> {
  try {
    // Check if the file exists
    if (!fs.existsSync(datasetPath)) {
      throw new Error(`Dataset file not found: ${datasetPath}`);
    }
    
    // Get file stats to check size
    const stats = fs.statSync(datasetPath);
    const fileSizeMB = stats.size / (1024 * 1024);
    
    // For extremely large files, use a more efficient approach
    if (fileSizeMB > 100) { // If file is larger than 100MB
      console.log(`Large file detected (${fileSizeMB.toFixed(2)}MB): ${datasetName}. Using sample processing.`);
      return searchLargeDataset(datasetPath, datasetName, searchPatterns);
    }
    
    // Read the CSV file with a limit on the file size
    const fileContent = fs.readFileSync(datasetPath, 'utf8');
    
    // Parse the CSV content with error handling
    const records = parse(fileContent, {
      columns: true,
      skip_empty_lines: true,
      // Limit the number of records to parse for large files
      to: datasetName === 'chronic.csv' || datasetName === 'chronic-us.csv' ? 5000 : undefined,
      // Add error handling for CSV parsing
      on_record: (record, { lines }) => {
        // Skip records after a certain limit to prevent memory issues
        if (lines > 10000) return null;
        return record;
      }
    });
    
    // Search for matches in the records
    const matches: Record<string, any>[] = [];
    
    for (const record of records) {
      if (!record) continue; // Skip null records
      
      let isMatch = false;
      
      // Check each field in the record for matches
      for (const field in record) {
        // Skip if field is not a string or is null/undefined
        if (record[field] === null || record[field] === undefined) continue;
        
        const value = String(record[field] || '');
        
        // Check if any search pattern matches this field
        for (const pattern of searchPatterns) {
          if (pattern.test(value)) {
            isMatch = true;
            break;
          }
        }
        
        if (isMatch) break;
      }
      
      if (isMatch) {
        matches.push(record);
        
        // Limit the number of matches to return
        if (matches.length >= 100) break;
      }
    }
    
    return {
      dataset: datasetName,
      records: matches,
      totalMatches: matches.length
    };
  } catch (error) {
    console.error(`Error processing dataset ${datasetName}:`, error);
    throw error;
  }
}

// Function to handle extremely large datasets by sampling
function searchLargeDataset(datasetPath: string, datasetName: string, searchPatterns: RegExp[]): SearchResult {
  try {
    // Read only the first 10,000 lines of the file
    const fileContent = fs.readFileSync(datasetPath, { encoding: 'utf8', flag: 'r' });
    const lines = fileContent.split('\n').slice(0, 10001).join('\n');
    
    // Parse the CSV content
    const records = parse(lines, {
      columns: true,
      skip_empty_lines: true
    });
    
    // Search for matches in the records
    const matches: Record<string, any>[] = [];
    
    for (const record of records) {
      let isMatch = false;
      
      // Check each field in the record for matches
      for (const field in record) {
        if (record[field] === null || record[field] === undefined) continue;
        
        const value = String(record[field] || '');
        
        // Check if any search pattern matches this field
        for (const pattern of searchPatterns) {
          if (pattern.test(value)) {
            isMatch = true;
            break;
          }
        }
        
        if (isMatch) break;
      }
      
      if (isMatch) {
        matches.push(record);
        
        // Limit the number of matches to return
        if (matches.length >= 50) break;
      }
    }
    
    return {
      dataset: datasetName + ' (sampled)',
      records: matches,
      totalMatches: matches.length
    };
  } catch (error) {
    console.error(`Error sampling large dataset ${datasetName}:`, error);
    return {
      dataset: datasetName + ' (error)',
      records: [],
      totalMatches: 0
    };
  }
}
