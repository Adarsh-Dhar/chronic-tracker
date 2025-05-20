"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LineChart, BarChart, PieChart } from "@/components/ui/chart"
import {
  LineChartIcon,
  BarChart2,
  PieChartIcon,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Download,
  RefreshCw,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Mock data for charts
const symptomData = [
  { date: "May 14", pain: 8, fatigue: 6, nausea: 7 },
  { date: "May 15", pain: 7, fatigue: 7, nausea: 5 },
  { date: "May 16", pain: 5, fatigue: 6, nausea: 3 },
  { date: "May 17", pain: 6, fatigue: 5, nausea: 4 },
  { date: "May 18", pain: 4, fatigue: 4, nausea: 2 },
  { date: "May 19", pain: 3, fatigue: 3, nausea: 1 },
  { date: "May 20", pain: 5, fatigue: 4, nausea: 3 },
]

const triggerData = [
  { name: "Stress", value: 35 },
  { name: "Weather", value: 25 },
  { name: "Diet", value: 20 },
  { name: "Sleep", value: 15 },
  { name: "Other", value: 5 },
]

const timeOfDayData = [
  { name: "Morning", value: 40 },
  { name: "Afternoon", value: 30 },
  { name: "Evening", value: 20 },
  { name: "Night", value: 10 },
]

export default function InsightsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("trends")

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const refreshInsights = () => {
    setIsLoading(true)

    toast({
      title: "Refreshing insights",
      description: "Analyzing your latest health data",
    })

    // Simulate refreshing data
    setTimeout(() => {
      setIsLoading(false)

      toast({
        title: "Insights updated",
        description: "Your health insights have been refreshed",
      })
    }, 2000)
  }

  return (
    <div className="container py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8"
      >
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">AI-Driven Insights</h1>
          <p className="text-muted-foreground text-lg">Discover patterns and predictions based on your symptom data</p>
        </div>

        <Button onClick={refreshInsights} disabled={isLoading}>
          {isLoading ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Analyzing...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh Insights
            </>
          )}
        </Button>
      </motion.div>

      <Tabs defaultValue="trends" value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 md:w-[400px]">
          <TabsTrigger value="trends">
            <LineChartIcon className="mr-2 h-4 w-4" />
            Trends
          </TabsTrigger>
          <TabsTrigger value="predictions">
            <TrendingUp className="mr-2 h-4 w-4" />
            Predictions
          </TabsTrigger>
          <TabsTrigger value="similar">
            <BarChart2 className="mr-2 h-4 w-4" />
            Similar Cases
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChartIcon className="h-5 w-5 text-primary" />
                  Symptom Trends Over Time
                </CardTitle>
                <CardDescription>Track how your symptoms have changed over the past week</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : (
                  <LineChart
                    data={symptomData}
                    index="date"
                    categories={["pain", "fatigue", "nausea"]}
                    colors={["#ef4444", "#8b5cf6", "#22c55e"]}
                    valueFormatter={(value) => `${value}/10`}
                    yAxisWidth={30}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-primary" />
                    Symptom Triggers
                  </CardTitle>
                  <CardDescription>Most common factors associated with your symptoms</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                  ) : (
                    <PieChart
                      data={triggerData}
                      index="name"
                      valueFormatter={(value) => `${value}%`}
                      category="value"
                      colors={["#f97316", "#8b5cf6", "#22c55e", "#3b82f6", "#a1a1aa"]}
                    />
                  )}
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
                  <CardTitle className="flex items-center gap-2">
                    <BarChart2 className="h-5 w-5 text-primary" />
                    Symptom Timing
                  </CardTitle>
                  <CardDescription>When your symptoms are most likely to occur</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px]">
                  {isLoading ? (
                    <div className="h-full flex items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    </div>
                  ) : (
                    <BarChart
                      data={timeOfDayData}
                      index="name"
                      categories={["value"]}
                      colors={["#8b5cf6"]}
                      valueFormatter={(value) => `${value}%`}
                      yAxisWidth={30}
                    />
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>AI Analysis</CardTitle>
                <CardDescription>Insights generated from your symptom patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="h-[100px] flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <TrendingDown className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Symptom Improvement</p>
                        <p className="text-muted-foreground">
                          Your symptoms have decreased by 35% over the past week, with the most significant improvement
                          in nausea levels.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Weather Correlation</p>
                        <p className="text-muted-foreground">
                          There's a 78% correlation between your symptom flares and changes in barometric pressure.
                          Consider tracking weather changes.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <Calendar className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <p className="font-medium">Timing Pattern</p>
                        <p className="text-muted-foreground">
                          Your symptoms are 40% more likely to occur in the morning, particularly between 7-9 AM.
                          Consider adjusting medication timing.
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="predictions" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardHeader>
                <CardTitle>Flare Prediction</CardTitle>
                <CardDescription>AI-powered prediction of your symptom patterns</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[100px] flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">Flare Risk (Next 3 Days)</p>
                        <p className="text-3xl font-bold">Low</p>
                        <p className="text-sm text-muted-foreground">15% probability</p>
                      </div>
                      <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
                        <span className="text-green-600 text-2xl">✓</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="font-medium">Prediction Factors:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="border rounded-lg p-3 bg-background/80">
                          <p className="font-medium">Weather</p>
                          <p className="text-sm text-muted-foreground">Stable conditions</p>
                        </div>
                        <div className="border rounded-lg p-3 bg-background/80">
                          <p className="font-medium">Stress</p>
                          <p className="text-sm text-muted-foreground">Decreasing trend</p>
                        </div>
                        <div className="border rounded-lg p-3 bg-background/80">
                          <p className="font-medium">Sleep</p>
                          <p className="text-sm text-muted-foreground">Improving quality</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="font-medium">Preventive Recommendations:</p>
                      <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                          <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                            <span className="text-primary text-xs">1</span>
                          </div>
                          <span>Maintain consistent sleep schedule (7-8 hours)</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                            <span className="text-primary text-xs">2</span>
                          </div>
                          <span>Continue daily 15-minute meditation practice</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5">
                            <span className="text-primary text-xs">3</span>
                          </div>
                          <span>Avoid known dietary triggers (caffeine, processed foods)</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Long-Term Outlook</CardTitle>
                <CardDescription>Projected symptom trends based on your data and similar cases</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[100px] flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="h-[200px]">
                      <LineChart
                        data={[
                          { month: "Jun", actual: 6, predicted: 5 },
                          { month: "Jul", actual: 5, predicted: 4 },
                          { month: "Aug", actual: 4, predicted: 4 },
                          { month: "Sep", actual: null, predicted: 3 },
                          { month: "Oct", actual: null, predicted: 3 },
                          { month: "Nov", actual: null, predicted: 2 },
                        ]}
                        index="month"
                        categories={["actual", "predicted"]}
                        colors={["#8b5cf6", "#94a3b8"]}
                        valueFormatter={(value) => `${value}/10`}
                        yAxisWidth={30}
                      />
                    </div>

                    <div className="space-y-3">
                      <p className="font-medium">AI Analysis:</p>
                      <div className="border rounded-lg p-4 bg-primary/5">
                        <p className="text-sm leading-relaxed">
                          Based on your symptom patterns and treatment response, our AI predicts a gradual improvement
                          in your condition over the next 3-6 months. The model indicates a 75% probability of reducing
                          your average symptom severity from 6/10 to 2/10 by November if current treatment and lifestyle
                          modifications are maintained.
                        </p>
                        <p className="text-sm leading-relaxed mt-3">
                          The most significant improvements are expected in pain levels, while fatigue may take longer
                          to resolve completely. This prediction has a confidence level of 82% based on analysis of
                          similar cases in our database.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-sm text-muted-foreground">Last updated: May 20, 2025</p>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export Prediction
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="similar" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card>
              <CardHeader>
                <CardTitle>Similar Patient Cases</CardTitle>
                <CardDescription>Anonymized data from patients with similar symptoms and conditions</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="h-[100px] flex items-center justify-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Similarity Score</p>
                        <p className="text-3xl font-bold">87%</p>
                        <p className="text-sm text-muted-foreground">Based on symptom patterns and triggers</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Cases Analyzed</p>
                        <p className="text-3xl font-bold">1,248</p>
                        <p className="text-sm text-muted-foreground">From CDC and WHO databases</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <p className="font-medium">Treatment Effectiveness in Similar Cases:</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <p className="font-medium">Biologic Therapy</p>
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">65% Effective</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            65% of similar patients saw significant improvement with biologic medications targeting
                            specific inflammatory pathways.
                          </p>
                        </div>

                        <div className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <p className="font-medium">Dietary Changes</p>
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">58% Effective</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            58% reported moderate to significant improvement after adopting an anti-inflammatory diet
                            protocol.
                          </p>
                        </div>

                        <div className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <p className="font-medium">Stress Management</p>
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">72% Effective</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            72% experienced reduced flare frequency with regular stress management techniques including
                            meditation.
                          </p>
                        </div>

                        <div className="border rounded-lg p-4">
                          <div className="flex justify-between items-center mb-2">
                            <p className="font-medium">Physical Therapy</p>
                            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">42% Effective</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            42% reported improvement in mobility and reduced pain with specialized physical therapy
                            programs.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="font-medium">Talking Points for Your Doctor:</p>
                      <div className="border rounded-lg p-4 bg-primary/5">
                        <ul className="space-y-2">
                          <li className="flex items-start gap-2">
                            <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 shrink-0">
                              <span className="text-primary text-xs">1</span>
                            </div>
                            <span>
                              Ask about new biologic medication options – 65% of similar patients saw improvement
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 shrink-0">
                              <span className="text-primary text-xs">2</span>
                            </div>
                            <span>
                              Discuss potential for specialized stress management therapy – highly effective in similar
                              cases
                            </span>
                          </li>
                          <li className="flex items-start gap-2">
                            <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 shrink-0">
                              <span className="text-primary text-xs">3</span>
                            </div>
                            <span>Inquire about anti-inflammatory diet protocols with nutritional counseling</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Export Similar Case Analysis
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
