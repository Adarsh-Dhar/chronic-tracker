"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Loader2 } from "lucide-react"

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

type Term = {
  original: string;
  medicalTerms: string[];
  commonNames: string[];
  relatedConditions: string[];
  variations: string[];
};

type SynonymsResponse = {
  terms: Term[];
};

export default function SearchResultsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [symptomText, setSymptomText] = useState("")
  const [searchTerms, setSearchTerms] = useState<string[]>([])
  const [newTerm, setNewTerm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSynonyms, setIsLoadingSynonyms] = useState(false)
  const [synonyms, setSynonyms] = useState<SynonymsResponse | null>(null)
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(null)
  const [activeDataset, setActiveDataset] = useState<string | null>(null)
  const [autoSearchEnabled, setAutoSearchEnabled] = useState(true)

  // Load search terms and symptom text from URL query parameters
  useEffect(() => {
    const termsParam = searchParams.get('terms')
    const symptomParam = searchParams.get('symptom')
    
    if (symptomParam) {
      setSymptomText(decodeURIComponent(symptomParam))
      // If we have a symptom parameter, fetch synonyms for it
      fetchSynonyms(decodeURIComponent(symptomParam))
    }
    
    if (termsParam) {
      try {
        const terms = JSON.parse(decodeURIComponent(termsParam))
        if (Array.isArray(terms) && terms.length > 0) {
          setSearchTerms(terms)
          // Only perform search if we don't have a symptom parameter
          // (otherwise we'll wait for synonyms to be fetched first)
          if (!symptomParam) {
            performSearch(terms)
          }
        }
      } catch (e) {
        console.error("Failed to parse search terms from URL:", e)
      }
    }
  }, [searchParams])

  const addSearchTerm = () => {
    if (newTerm && !searchTerms.includes(newTerm)) {
      const updatedTerms = [...searchTerms, newTerm]
      setSearchTerms(updatedTerms)
      setNewTerm("")
    }
  }
  
  // Fetch synonyms from the API
  const fetchSynonyms = async (text: string = symptomText) => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter a symptom to find synonyms",
        variant: "destructive",
      })
      return
    }
    
    setIsLoadingSynonyms(true)
    setSynonyms(null) // Clear previous synonyms
    
    try {
      const response = await fetch("/api/synonyms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptomText: text,
        }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch synonyms")
      }
      
      setSynonyms(result.data)
      
      // Extract all terms from the response
      if (result.data?.terms) {
        const allTerms = result.data.terms.flatMap((term: Term) => [
          ...(term.medicalTerms || []) as string[],
          ...(term.commonNames || []) as string[],
          ...(term.relatedConditions || []) as string[],
          ...(term.variations || []) as string[]
        ])
        
        // Filter out duplicates and empty terms
        const uniqueTerms = [...new Set(allTerms.filter((term: string) => term && term.trim() !== ""))] as string[]
        
        // Update search terms with the new terms
        setSearchTerms(uniqueTerms)
        
        // Update URL with symptom text
        const symptomParam = encodeURIComponent(text)
        router.push(`/search-results?symptom=${symptomParam}`, { scroll: false })
        
        // Automatically search with these terms if auto-search is enabled
        if (autoSearchEnabled) {
          performSearch(uniqueTerms)
        }
      }
    } catch (error) {
      console.error("Error fetching synonyms:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch synonyms",
        variant: "destructive",
      })
    } finally {
      setIsLoadingSynonyms(false)
    }
  }

  const removeSearchTerm = (term: string) => {
    setSearchTerms(searchTerms.filter(t => t !== term))
  }

  const performSearch = async (terms: string[] = searchTerms) => {
    if (terms.length === 0) {
      toast({
        title: "Error",
        description: "Please add at least one search term",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          searchTerms: terms,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to search datasets")
      }

      setSearchResults(result)
      
      // Set active dataset to the first one with matches
      const firstDatasetWithMatches = result.results.find((r: { totalMatches: number }) => r.totalMatches > 0)
      if (firstDatasetWithMatches) {
        setActiveDataset(firstDatasetWithMatches.dataset)
      }
      
      // Update URL with search terms
      const termsParam = encodeURIComponent(JSON.stringify(terms))
      router.push(`/search-results?terms=${termsParam}`, { scroll: false })
    } catch (error) {
      console.error("Error searching datasets:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to search datasets",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Get column names for the active dataset
  const getColumnNames = (): string[] => {
    if (!searchResults || !activeDataset) return []
    
    const dataset = searchResults.results.find(r => r.dataset === activeDataset)
    if (!dataset || dataset.records.length === 0) return []
    
    return Object.keys(dataset.records[0])
  }

  // Get records for the active dataset
  const getActiveDatasetRecords = (): Record<string, any>[] => {
    if (!searchResults || !activeDataset) return []
    
    const dataset = searchResults.results.find(r => r.dataset === activeDataset)
    return dataset?.records || []
  }

  // Format dataset name for display
  const formatDatasetName = (name: string): string => {
    return name.replace('.csv', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <div className="container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Dataset Search Results</h1>
        <p className="text-muted-foreground text-lg mb-8">
          Search medical datasets using terms and synonyms
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Step 1: Find Synonyms</CardTitle>
              <CardDescription>Enter symptoms to generate medical terminology</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Describe your symptoms (e.g., Migraine with nausea, rated 7/10 severity)"
                  className="min-h-[100px] resize-none"
                  value={symptomText}
                  onChange={(e) => setSymptomText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.ctrlKey) {
                      e.preventDefault()
                      fetchSynonyms()
                    }
                  }}
                />
                <p className="text-xs text-muted-foreground">Press Ctrl+Enter to search</p>
                
                <Button 
                  className="w-full" 
                  onClick={() => fetchSynonyms()} 
                  disabled={isLoadingSynonyms || !symptomText.trim()}
                >
                  {isLoadingSynonyms ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Finding Synonyms...
                    </>
                  ) : (
                    "Generate Medical Terms"
                  )}
                </Button>
                
                {synonyms && (
                  <div className="bg-accent/50 rounded-md p-3 text-sm mt-4">
                    <p className="font-medium mb-2">Generated {searchTerms.length} related terms</p>
                    <div className="max-h-[150px] overflow-y-auto">
                      <div className="flex flex-wrap gap-1">
                        {searchTerms.map((term, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {term}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Step 2: Search Datasets</CardTitle>
              <CardDescription>Search medical datasets with generated terms</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  {searchTerms.length > 0 ? (
                    <p className="text-sm">
                      {searchTerms.length} terms will be used for searching datasets
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Enter symptoms above to generate search terms
                    </p>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 mb-4">
                  <input
                    type="checkbox"
                    id="autoSearch"
                    className="rounded border-gray-300"
                    checked={autoSearchEnabled}
                    onChange={(e) => setAutoSearchEnabled(e.target.checked)}
                  />
                  <label htmlFor="autoSearch" className="text-sm">
                    Automatically search when terms are generated
                  </label>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    className="w-full"
                    onClick={() => performSearch()} 
                    disabled={isLoading || searchTerms.length === 0}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Searching Datasets...
                      </>
                    ) : (
                      "Search All Datasets"
                    )}
                  </Button>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <div className="flex gap-2">
                    <Link href="/synonyms" className="text-sm text-primary hover:underline">
                      Advanced synonym search
                    </Link>
                  </div>
                  
                  {searchResults && (
                    <p className="text-xs text-muted-foreground">
                      Found {searchResults.totalMatchesAcrossDatasets} matches in
                      {' '}{(searchResults.executionTimeMs / 1000).toFixed(2)}s
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {searchResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Search Results</CardTitle>
                  <CardDescription>
                    Found {searchResults.totalMatchesAcrossDatasets} matches across {searchResults.results.filter(r => r.totalMatches > 0).length} datasets
                    in {(searchResults.executionTimeMs / 1000).toFixed(2)} seconds
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {searchResults.totalMatchesAcrossDatasets === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mx-auto mb-4 h-12 w-12 opacity-50"
                  >
                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <p>No matches found for your search terms</p>
                  <p className="mt-2 text-sm">Try using different terms or check the synonyms page for related medical terminology</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <Tabs defaultValue={activeDataset || ""} value={activeDataset || ""} onValueChange={setActiveDataset}>
                    <TabsList className="mb-4 flex flex-wrap h-auto">
                      {searchResults.results
                        .filter(result => result.totalMatches > 0)
                        .map(result => (
                          <TabsTrigger key={result.dataset} value={result.dataset} className="mb-1">
                            {formatDatasetName(result.dataset)} ({result.totalMatches})
                          </TabsTrigger>
                        ))}
                    </TabsList>
                    
                    {searchResults.results
                      .filter(result => result.totalMatches > 0)
                      .map(result => (
                        <TabsContent key={result.dataset} value={result.dataset} className="mt-4">
                          <div className="rounded-md border overflow-hidden">
                            <div className="overflow-x-auto">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    {result.records.length > 0 && 
                                      Object.keys(result.records[0]).map((column, i) => (
                                        <TableHead key={i} className="whitespace-nowrap">
                                          {column}
                                        </TableHead>
                                      ))
                                    }
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {result.records.map((record, rowIndex) => (
                                    <TableRow key={rowIndex}>
                                      {Object.values(record).map((value, cellIndex) => (
                                        <TableCell key={cellIndex} className="max-w-[200px] truncate">
                                          {String(value || '')}
                                        </TableCell>
                                      ))}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </div>
                          </div>
                          
                          {result.totalMatches > result.records.length && (
                            <p className="text-sm text-muted-foreground mt-2">
                              Showing {result.records.length} of {result.totalMatches} matches. 
                              Refine your search terms for more specific results.
                            </p>
                          )}
                        </TabsContent>
                      ))
                    }
                  </Tabs>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
