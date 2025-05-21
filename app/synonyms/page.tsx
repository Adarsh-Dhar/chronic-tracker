"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"

type Term = {
  original: string
  medicalTerms: string[]
  commonNames: string[]
  relatedConditions: string[]
  variations: string[]
}

type SynonymsResponse = {
  terms: Term[]
}

export default function SynonymsPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [symptomText, setSymptomText] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [synonyms, setSynonyms] = useState<SynonymsResponse | null>(null)
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState("medical")
  const [selectedTerms, setSelectedTerms] = useState<string[]>([])

  // Load search history from local storage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem("synonymSearchHistory")
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory))
      } catch (e) {
        console.error("Failed to parse search history:", e)
      }
    }
  }, [])

  // Save search history to local storage when it changes
  useEffect(() => {
    localStorage.setItem("synonymSearchHistory", JSON.stringify(searchHistory))
  }, [searchHistory])

  const fetchSynonyms = async () => {
    if (!symptomText.trim()) {
      toast({
        title: "Error",
        description: "Please enter a symptom to search for synonyms",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/synonyms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptomText,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch synonyms")
      }

      setSynonyms(result.data)

      // Add to search history if not already present
      if (!searchHistory.includes(symptomText)) {
        setSearchHistory([symptomText, ...searchHistory].slice(0, 10)) // Keep only the 10 most recent searches
      }
    } catch (error) {
      console.error("Error fetching synonyms:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch synonyms",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleHistoryClick = (term: string) => {
    setSymptomText(term)
    fetchSynonyms()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: `"${text}" copied to clipboard`,
    })
  }
  
  const toggleTermSelection = (term: string) => {
    if (selectedTerms.includes(term)) {
      setSelectedTerms(selectedTerms.filter(t => t !== term))
    } else {
      setSelectedTerms([...selectedTerms, term])
    }
  }
  
  const searchDatasets = () => {
    if (selectedTerms.length === 0) {
      toast({
        title: "No terms selected",
        description: "Please select at least one term to search for",
        variant: "destructive",
      })
      return
    }
    
    // Encode the selected terms as a URL parameter
    const termsParam = encodeURIComponent(JSON.stringify(selectedTerms))
    router.push(`/search-results?terms=${termsParam}`)
  }

  // Count total terms across all categories
  const getTotalTermCount = () => {
    if (!synonyms?.terms) return 0
    
    return synonyms.terms.reduce((total, term) => {
      return total + 
        (term.medicalTerms?.length || 0) + 
        (term.commonNames?.length || 0) + 
        (term.relatedConditions?.length || 0) + 
        (term.variations?.length || 0)
    }, 0)
  }

  return (
    <div className="container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Medical Term Finder</h1>
        <p className="text-muted-foreground text-lg mb-8">
          Find medical terminology, common names, and related conditions for your symptoms
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          className="lg:col-span-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Search Symptoms</CardTitle>
              <CardDescription>Enter symptoms to find medical terminology</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
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
                <div className="flex justify-between items-center">
                  <p className="text-xs text-muted-foreground">Press Ctrl+Enter to search</p>
                  {selectedTerms.length > 0 && (
                    <p className="text-xs text-primary">{selectedTerms.length} terms selected for dataset search</p>
                  )}
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={fetchSynonyms} 
                disabled={isLoading || !symptomText.trim()}
              >
                {isLoading ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Searching...
                  </>
                ) : (
                  "Find Medical Terms"
                )}
              </Button>

              {searchHistory.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium mb-2">Recent Searches</h3>
                  <div className="flex flex-wrap gap-2">
                    {searchHistory.map((term, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                        onClick={() => handleHistoryClick(term)}
                      >
                        {term}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Medical Terminology</CardTitle>
                  <CardDescription>
                    {synonyms ? `Found ${getTotalTermCount()} related terms` : "Enter symptoms to see related medical terms"}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {synonyms && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const allTerms = synonyms.terms.flatMap(term => [
                          ...term.medicalTerms || [],
                          ...term.commonNames || [],
                          ...term.relatedConditions || [],
                          ...term.variations || []
                        ]).join(", ")
                        copyToClipboard(allTerms)
                      }}
                    >
                      Copy All Terms
                    </Button>
                  )}
                  
                  {selectedTerms.length > 0 && (
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={searchDatasets}
                    >
                      Search Datasets ({selectedTerms.length})
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {!synonyms ? (
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
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <p>Search for symptoms to see related medical terminology</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <Tabs defaultValue="medical" value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="medical">Medical Terms</TabsTrigger>
                      <TabsTrigger value="common">Common Names</TabsTrigger>
                      <TabsTrigger value="related">Related Conditions</TabsTrigger>
                      <TabsTrigger value="variations">Variations</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="medical" className="mt-4">
                      {(synonyms.terms || []).map((term, index) => (
                        <div key={index} className="mb-4">
                          <h3 className="text-sm font-medium mb-2">{term.original}</h3>
                          <div className="flex flex-wrap gap-2">
                            {term.medicalTerms && term.medicalTerms.length > 0 ? (
                              term.medicalTerms.map((medicalTerm, i) => (
                                <Badge 
                                  key={i} 
                                  className={`cursor-pointer ${selectedTerms.includes(medicalTerm) ? 'bg-primary/90' : ''}`}
                                  onClick={() => toggleTermSelection(medicalTerm)}
                                  onDoubleClick={() => copyToClipboard(medicalTerm)}
                                >
                                  {medicalTerm}
                                  {selectedTerms.includes(medicalTerm) && (
                                    <span className="ml-1">✓</span>
                                  )}
                                </Badge>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">No medical terms found</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="common" className="mt-4">
                      {(synonyms.terms || []).map((term, index) => (
                        <div key={index} className="mb-4">
                          <h3 className="text-sm font-medium mb-2">{term.original}</h3>
                          <div className="flex flex-wrap gap-2">
                            {term.commonNames && term.commonNames.length > 0 ? (
                              term.commonNames.map((commonName, i) => (
                                <Badge 
                                  key={i} 
                                  variant="secondary"
                                  className={`cursor-pointer ${selectedTerms.includes(commonName) ? 'bg-primary/90 text-primary-foreground' : ''}`}
                                  onClick={() => toggleTermSelection(commonName)}
                                  onDoubleClick={() => copyToClipboard(commonName)}
                                >
                                  {commonName}
                                  {selectedTerms.includes(commonName) && (
                                    <span className="ml-1">✓</span>
                                  )}
                                </Badge>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">No common names found</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="related" className="mt-4">
                      {(synonyms.terms || []).map((term, index) => (
                        <div key={index} className="mb-4">
                          <h3 className="text-sm font-medium mb-2">{term.original}</h3>
                          <div className="flex flex-wrap gap-2">
                            {term.relatedConditions && term.relatedConditions.length > 0 ? (
                              term.relatedConditions.map((relatedCondition, i) => (
                                <Badge 
                                  key={i} 
                                  variant="outline"
                                  className={`cursor-pointer ${selectedTerms.includes(relatedCondition) ? 'bg-primary/90 text-primary-foreground' : ''}`}
                                  onClick={() => toggleTermSelection(relatedCondition)}
                                  onDoubleClick={() => copyToClipboard(relatedCondition)}
                                >
                                  {relatedCondition}
                                  {selectedTerms.includes(relatedCondition) && (
                                    <span className="ml-1">✓</span>
                                  )}
                                </Badge>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">No related conditions found</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                    
                    <TabsContent value="variations" className="mt-4">
                      {(synonyms.terms || []).map((term, index) => (
                        <div key={index} className="mb-4">
                          <h3 className="text-sm font-medium mb-2">{term.original}</h3>
                          <div className="flex flex-wrap gap-2">
                            {term.variations && term.variations.length > 0 ? (
                              term.variations.map((variation, i) => (
                                <Badge 
                                  key={i} 
                                  variant="destructive"
                                  className={`cursor-pointer bg-opacity-70 ${selectedTerms.includes(variation) ? 'bg-primary/90 text-primary-foreground' : ''}`}
                                  onClick={() => toggleTermSelection(variation)}
                                  onDoubleClick={() => copyToClipboard(variation)}
                                >
                                  {variation}
                                  {selectedTerms.includes(variation) && (
                                    <span className="ml-1">✓</span>
                                  )}
                                </Badge>
                              ))
                            ) : (
                              <p className="text-sm text-muted-foreground">No variations found</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
