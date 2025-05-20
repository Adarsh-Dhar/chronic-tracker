"use client"

import { useState } from "react"
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

export default function ReportsPage() {
  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportGenerated, setReportGenerated] = useState(false)
  const [timeRange, setTimeRange] = useState("week")

  const generateReport = () => {
    setIsGenerating(true)

    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false)
      setReportGenerated(true)

      toast({
        title: "Report Generated",
        description: "Your doctor-ready report has been created",
      })
    }, 2500)
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
          className="lg:col-span-2"
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
                  <Select defaultValue="comprehensive">
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
                    "Symptom Timeline",
                    "Medication Adherence",
                    "Trigger Analysis",
                    "AI Insights",
                    "Similar Cases",
                    "Treatment Recommendations",
                  ].map((section, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={`section-${index}`}
                        defaultChecked
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <label htmlFor={`section-${index}`} className="text-sm">
                        {section}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

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
      </div>

      {reportGenerated && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Generated Report</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Button size="sm" onClick={shareReport}>
                <Send className="mr-2 h-4 w-4" />
                Share with Doctor
              </Button>
            </div>
          </div>

          <Card className="border-2 border-primary/20">
            <CardHeader className="bg-primary/5 border-b">
              <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                  <CardTitle className="text-2xl">Health Summary Report</CardTitle>
                  <CardDescription className="text-base">Generated on May 20, 2025</CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {timeRange === "week"
                      ? "Past 7 Days"
                      : timeRange === "month"
                        ? "Past 30 Days"
                        : timeRange === "3months"
                          ? "Past 90 Days"
                          : timeRange === "6months"
                            ? "Past 180 Days"
                            : "Past 365 Days"}
                  </Badge>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Last Updated: Today, 11:10 PM
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-6 space-y-8">
              <div className="space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Patient Information
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">Jane Doe</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date of Birth</p>
                    <p className="font-medium">01/15/1985</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Primary Condition</p>
                    <p className="font-medium">Rheumatoid Arthritis</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Primary Physician</p>
                    <p className="font-medium">Dr. Johnson</p>
                  </div>
                </div>
              </div>

              <Tabs defaultValue="timeline" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="timeline">Symptom Timeline</TabsTrigger>
                  <TabsTrigger value="medications">Medications</TabsTrigger>
                  <TabsTrigger value="insights">AI Insights</TabsTrigger>
                  <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                </TabsList>

                <TabsContent value="timeline" className="space-y-4">
                  <div className="h-[300px]">
                    <LineChart
                      data={painData}
                      index="date"
                      categories={["value"]}
                      colors={["#8b5cf6"]}
                      valueFormatter={(value) => `${value}/10`}
                      yAxisWidth={30}
                    />
                  </div>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>Symptom Details</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-4">
                          <div className="border-b pb-2">
                            <p className="font-medium">May 20, 2025</p>
                            <p className="text-sm">Migraine with nausea, rated 5/10 severity</p>
                            <p className="text-sm text-muted-foreground">Triggers: Stress, Weather change</p>
                          </div>
                          <div className="border-b pb-2">
                            <p className="font-medium">May 19, 2025</p>
                            <p className="text-sm">Mild joint pain, rated 3/10 severity</p>
                            <p className="text-sm text-muted-foreground">Triggers: None identified</p>
                          </div>
                          <div className="border-b pb-2">
                            <p className="font-medium">May 18, 2025</p>
                            <p className="text-sm">Fatigue and dizziness, rated 4/10 severity</p>
                            <p className="text-sm text-muted-foreground">Triggers: Poor sleep</p>
                          </div>
                          <div className="border-b pb-2">
                            <p className="font-medium">May 17, 2025</p>
                            <p className="text-sm">Joint pain in knees, rated 6/10 severity</p>
                            <p className="text-sm text-muted-foreground">Triggers: Physical activity</p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="item-2">
                      <AccordionTrigger>Pattern Analysis</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          <p>
                            Symptom patterns show a 35% decrease in overall severity over the past week, with most
                            significant improvement in joint pain.
                          </p>
                          <p>Morning symptoms (7-9 AM) are 40% more frequent than other times of day.</p>
                          <p>Weather changes correlate with symptom flares in 78% of recorded instances.</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </TabsContent>

                <TabsContent value="medications" className="space-y-4">
                  <div className="h-[300px]">
                    <BarChart
                      data={medicationData}
                      index="name"
                      categories={["adherence"]}
                      colors={["#8b5cf6"]}
                      valueFormatter={(value) => `${value}%`}
                      yAxisWidth={30}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Medication A</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <p className="text-sm text-muted-foreground">Dosage</p>
                              <p className="text-sm">10mg</p>
                            </div>
                            <div className="flex justify-between">
                              <p className="text-sm text-muted-foreground">Frequency</p>
                              <p className="text-sm">Twice daily</p>
                            </div>
                            <div className="flex justify-between">
                              <p className="text-sm text-muted-foreground">Adherence</p>
                              <p className="text-sm font-medium text-green-600">95%</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Medication B</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <p className="text-sm text-muted-foreground">Dosage</p>
                              <p className="text-sm">25mg</p>
                            </div>
                            <div className="flex justify-between">
                              <p className="text-sm text-muted-foreground">Frequency</p>
                              <p className="text-sm">Once daily</p>
                            </div>
                            <div className="flex justify-between">
                              <p className="text-sm text-muted-foreground">Adherence</p>
                              <p className="text-sm font-medium text-amber-600">85%</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base">Medication C</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <p className="text-sm text-muted-foreground">Dosage</p>
                              <p className="text-sm">50mg</p>
                            </div>
                            <div className="flex justify-between">
                              <p className="text-sm text-muted-foreground">Frequency</p>
                              <p className="text-sm">As needed</p>
                            </div>
                            <div className="flex justify-between">
                              <p className="text-sm text-muted-foreground">Adherence</p>
                              <p className="text-sm font-medium text-green-600">100%</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="border rounded-lg p-4 bg-primary/5">
                      <p className="font-medium mb-2">Medication Notes</p>
                      <p className="text-sm">
                        Patient reports mild stomach discomfort with Medication B when taken without food. Medication C
                        has been effective for acute symptom management with no reported side effects. Overall
                        medication effectiveness rating: 7/10.
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="insights" className="space-y-4">
                  <div className="border rounded-lg p-4 bg-primary/5">
                    <h4 className="font-bold text-lg mb-2">AI-Generated Insights</h4>
                    <div className="space-y-4">
                      <div>
                        <p className="font-medium">Symptom Patterns</p>
                        <p className="text-sm">
                          Analysis shows a strong correlation (78%) between barometric pressure changes and symptom
                          flares. Symptoms are 40% more likely to occur in the morning, particularly between 7-9 AM.
                          Overall symptom severity has decreased by 35% over the reporting period.
                        </p>
                      </div>

                      <div>
                        <p className="font-medium">Treatment Response</p>
                        <p className="text-sm">
                          Current medication regimen shows moderate effectiveness (7/10) with best response to
                          Medication C for acute management. Stress management techniques have contributed to a 25%
                          reduction in flare frequency. Sleep quality improvements correlate with reduced morning
                          symptom severity.
                        </p>
                      </div>

                      <div>
                        <p className="font-medium">Similar Cases Analysis</p>
                        <p className="text-sm">
                          Based on 1,248 similar cases from CDC and WHO databases: 65% of similar patients saw
                          significant improvement with biologic medications. 72% experienced reduced flare frequency
                          with regular stress management techniques. 58% reported moderate to significant improvement
                          after adopting an anti-inflammatory diet.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-bold text-lg mb-2">Talking Points for Your Doctor</h4>
                    <ul className="space-y-2">
                      <li className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 shrink-0">
                          <span className="text-primary text-xs">1</span>
                        </div>
                        <span>
                          Discuss potential for biologic therapy options – 65% of similar patients saw improvement
                        </span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 shrink-0">
                          <span className="text-primary text-xs">2</span>
                        </div>
                        <span>Review timing of medication administration to better address morning symptoms</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 shrink-0">
                          <span className="text-primary text-xs">3</span>
                        </div>
                        <span>Inquire about anti-inflammatory diet protocols with nutritional counseling</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 shrink-0">
                          <span className="text-primary text-xs">4</span>
                        </div>
                        <span>Address mild stomach discomfort with Medication B</span>
                      </li>
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="recommendations" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Lifestyle Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 shrink-0">
                              <span className="text-primary text-xs">1</span>
                            </div>
                            <span>Maintain consistent sleep schedule (7-8 hours)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 shrink-0">
                              <span className="text-primary text-xs">2</span>
                            </div>
                            <span>Continue daily 15-minute meditation practice</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 shrink-0">
                              <span className="text-primary text-xs">3</span>
                            </div>
                            <span>Avoid known dietary triggers (caffeine, processed foods)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 shrink-0">
                              <span className="text-primary text-xs">4</span>
                            </div>
                            <span>Monitor barometric pressure changes and prepare accordingly</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">Treatment Considerations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 shrink-0">
                              <span className="text-primary text-xs">1</span>
                            </div>
                            <span>Consider biologic therapy options (65% effective in similar cases)</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 shrink-0">
                              <span className="text-primary text-xs">2</span>
                            </div>
                            <span>Adjust medication timing to better address morning symptoms</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 shrink-0">
                              <span className="text-primary text-xs">3</span>
                            </div>
                            <span>Explore anti-inflammatory diet with nutritional counseling</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 shrink-0">
                              <span className="text-primary text-xs">4</span>
                            </div>
                            <span>Consider specialized physical therapy (42% effective in similar cases)</span>
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="border rounded-lg p-4 bg-primary/5">
                    <h4 className="font-bold text-lg mb-2">Long-Term Outlook</h4>
                    <p className="text-sm">
                      Based on your symptom patterns and treatment response, our AI predicts a gradual improvement in
                      your condition over the next 3-6 months. The model indicates a 75% probability of reducing your
                      average symptom severity from 6/10 to 2/10 by November if current treatment and lifestyle
                      modifications are maintained.
                    </p>
                    <p className="text-sm mt-2">
                      The most significant improvements are expected in pain levels, while fatigue may take longer to
                      resolve completely. This prediction has a confidence level of 82% based on analysis of similar
                      cases in our database.
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>

            <CardFooter className="border-t pt-6 flex flex-col sm:flex-row justify-between gap-4">
              <div className="text-sm text-muted-foreground">
                <p>Generated by HealthTrack AI on May 20, 2025</p>
                <p>
                  This report is intended for informational purposes and should be reviewed by a healthcare
                  professional.
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Mail className="mr-2 h-4 w-4" />
                  Email
                </Button>
                <Button variant="outline" size="sm">
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
