"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, BarChart } from "@/components/ui/chart"
import { FileText, Download, Send, Calendar, Clock, Printer, Mail, Share2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

// Mock data for charts
const painData = [
  { date: "May 14", value: 8 },
  { date: "May 15", value: 7 },
  { date: "May 16", value: 5 },
  { date: "May 17", value: 6 },
  { date: "May 18", value: 4 },
  { date: "May 19", value: 3 },
  { date: "May 20", value: 5 },
]

const medicationData = [
  { name: "Medication A", adherence: 95 },
  { name: "Medication B", adherence: 85 },
  { name: "Medication C", adherence: 100 },
]

// Markdown to HTML converter for the report content
function markdownToHtml(markdown: string): string {
  if (!markdown) return '<p>No report data available</p>';
  
  try {
    // Process the markdown in sections to better handle the AI response format
    let html = markdown
      // Convert headers
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      
      // Convert bold
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      
      // Convert italic
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      
      // Convert lists - handle both unordered and ordered lists
      .replace(/^\s*\- (.*$)/gim, '<li>$1</li>')
      .replace(/^\s*\d+\. (.*$)/gim, '<li>$1</li>');
    
    // Process sections
    const sections = html.split(/\n\n+/);
    let processedHtml = '';
    
    sections.forEach(section => {
      if (section.trim() === '') return;
      
      // Check if this section is a list
      if (section.includes('<li>')) {
        processedHtml += `<ul class="list-disc pl-5 my-4">${section}</ul>`;
      } 
      // Check if this is a header
      else if (section.startsWith('<h')) {
        processedHtml += section;
      } 
      // Otherwise treat as paragraph
      else {
        processedHtml += `<p class="my-3">${section.replace(/\n/g, '<br>')}</p>`;
      }
    });
    
    return processedHtml || '<p>Unable to format report results</p>';
  } catch (error) {
    console.error('Error converting markdown to HTML:', error);
    // Handle the unknown error type safely
    const errorMessage = error instanceof Error ? error.message : String(error);
    return `<p>Error formatting report: ${errorMessage}</p><pre>${markdown}</pre>`;
  }
}

export default function ReportsPage() {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportGenerated, setReportGenerated] = useState(false)
  const [timeRange, setTimeRange] = useState("week")
  const [reportType, setReportType] = useState("comprehensive")
  const [selectedSections, setSelectedSections] = useState([
    "symptom_timeline",
    "medication_adherence",
    "trigger_analysis",
    "ai_insights",
    "similar_cases",
    "treatment_recommendations",
  ])
  const [reportContent, setReportContent] = useState<string>('')
  const [error, setError] = useState<string | null>(null)

  // Map UI values to API parameters
  const mapTimeRangeToApiParam = (range: string) => {
    switch (range) {
      case 'week': return 'past_week'
      case 'month': return 'past_month'
      case '3months': return 'past_3_months'
      default: return 'past_week'
    }
  }

  const mapReportTypeToApiParam = (type: string) => {
    switch (type) {
      case 'comprehensive': return 'comprehensive'
      case 'medication': return 'medication'
      case 'trends': return 'symptom_timeline'
      case 'summary': return 'doctor_visit'
      default: return 'comprehensive'
    }
  }

  const toggleSection = (section: string) => {
    setSelectedSections(prev => {
      if (prev.includes(section)) {
        return prev.filter(s => s !== section)
      } else {
        return [...prev, section]
      }
    })
  }

  const generateReport = async () => {
    setIsGenerating(true)
    setError(null)
    setReportContent('')
    
    try {
      // Prepare API parameters
      const timePeriod = mapTimeRangeToApiParam(timeRange)
      const apiReportType = mapReportTypeToApiParam(reportType)
      
      // Build URL with query parameters
      let url = `/api/analyze?timePeriod=${timePeriod}&reportType=${apiReportType}`
      
      // Add sections parameters
      selectedSections.forEach(section => {
        url += `&sections=${section}`
      })
      
      console.log('Fetching report with URL:', url)
      
      const response = await fetch(url)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to generate report')
      }
      
      const data = await response.json()
      
      if (!data.data) {
        throw new Error('Invalid response format: missing data field')
      }
      
      setReportContent(data.data)
      setReportGenerated(true)
      
      toast({
        title: "Report Generated",
        description: "Your doctor-ready report has been created",
      })
    } catch (err: any) {
      setError(err.message || 'An error occurred while generating the report')
      console.error('Error generating report:', err)
      
      toast({
        title: "Error",
        description: err.message || "Failed to generate report",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const shareReport = () => {
    toast({
      title: "Report Shared",
      description: "Your report has been sent to Dr. Johnson",
    })
  }

  return (
    <div className="container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Doctor-Ready Reports</h1>
        <p className="text-muted-foreground text-lg mb-8">
          Generate comprehensive reports to share with your healthcare providers
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          className={reportGenerated && reportContent ? "lg:col-span-3" : "lg:col-span-2"}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Generate New Report</CardTitle>
              <CardDescription>Create a comprehensive summary of your health data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Time Period</label>
                  <Select defaultValue="week" onValueChange={setTimeRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="week">Past Week</SelectItem>
                      <SelectItem value="month">Past Month</SelectItem>
                      <SelectItem value="3months">Past 3 Months</SelectItem>
                      <SelectItem value="6months">Past 6 Months</SelectItem>
                      <SelectItem value="year">Past Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Report Type</label>
                  <Select defaultValue="comprehensive" onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comprehensive">Comprehensive</SelectItem>
                      <SelectItem value="summary">Summary</SelectItem>
                      <SelectItem value="medication">Medication Focus</SelectItem>
                      <SelectItem value="trends">Trends Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Include Sections</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Symptom Timeline", value: "symptom_timeline" },
                    { label: "Medication Adherence", value: "medication_adherence" },
                    { label: "Trigger Analysis", value: "trigger_analysis" },
                    { label: "AI Insights", value: "ai_insights" },
                    { label: "Similar Cases", value: "similar_cases" },
                    { label: "Treatment Recommendations", value: "treatment_recommendations" },
                  ].map((section, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`section-${section.value}`}
                        checked={selectedSections.includes(section.value)}
                        onChange={() => toggleSection(section.value)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor={`section-${section.value}`} className="text-sm">
                        {section.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
                  {error}
                </div>
              )}
              
              <Button className="w-full" size="lg" onClick={generateReport} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-5 w-5" />
                    Generate Doctor Report
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {!reportGenerated && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Recent Reports</CardTitle>
                <CardDescription>Previously generated reports</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { date: "May 15, 2025", title: "Monthly Summary", doctor: "Dr. Johnson" },
                  { date: "April 10, 2025", title: "Quarterly Review", doctor: "Dr. Smith" },
                  { date: "March 5, 2025", title: "Medication Report", doctor: "Dr. Johnson" },
                ].map((report, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    <div className="border rounded-lg p-3 hover:bg-accent transition-colors">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium">{report.title}</span>
                        <Badge variant="outline">{report.date}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Sent to: {report.doctor}</p>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 px-2">
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                <Button variant="outline" className="w-full">
                  View All Reports
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
        
        {reportGenerated && reportContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mt-6 w-full"
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Generated Report</CardTitle>
                  <CardDescription>
                    {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => window.print()}>
                    <Printer className="h-4 w-4 mr-1" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm" onClick={shareReport}>
                    <Mail className="h-4 w-4 mr-1" />
                    Email
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {/* Render the markdown content */}
                  <div dangerouslySetInnerHTML={{ __html: markdownToHtml(reportContent) }} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  )
}
