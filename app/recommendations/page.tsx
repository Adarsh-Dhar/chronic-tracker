"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Utensils,
  Activity,
  Brain,
  Heart,
  Clock,
  ThumbsUp,
  ThumbsDown,
  BookmarkPlus,
  ExternalLink,
  Check,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function RecommendationsPage() {
  const { toast } = useToast()
  const [savedRecommendations, setSavedRecommendations] = useState<string[]>([])

  const saveRecommendation = (id: string) => {
    if (!savedRecommendations.includes(id)) {
      setSavedRecommendations([...savedRecommendations, id])

      toast({
        title: "Recommendation Saved",
        description: "Added to your saved recommendations",
      })
    } else {
      setSavedRecommendations(savedRecommendations.filter((item) => item !== id))

      toast({
        title: "Recommendation Removed",
        description: "Removed from your saved recommendations",
      })
    }
  }

  const markHelpful = (id: string) => {
    toast({
      title: "Feedback Recorded",
      description: "Thank you for your feedback",
    })
  }

  return (
    <div className="container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Preventive Recommendations</h1>
        <p className="text-muted-foreground text-lg mb-8">
          Personalized suggestions based on your health data and public health guidelines
        </p>
      </motion.div>

      <Tabs defaultValue="lifestyle" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full md:w-[600px]">
          <TabsTrigger value="lifestyle">
            <Activity className="mr-2 h-4 w-4" />
            Lifestyle
          </TabsTrigger>
          <TabsTrigger value="diet">
            <Utensils className="mr-2 h-4 w-4" />
            Diet
          </TabsTrigger>
          <TabsTrigger value="stress">
            <Brain className="mr-2 h-4 w-4" />
            Stress
          </TabsTrigger>
          <TabsTrigger value="medical">
            <Heart className="mr-2 h-4 w-4" />
            Medical
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lifestyle" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Lifestyle Recommendations</CardTitle>
                    <CardDescription>Based on your symptom patterns and WHO guidelines</CardDescription>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Activity className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  {
                    id: "lifestyle-1",
                    title: "Consistent Sleep Schedule",
                    description:
                      "Maintain a regular sleep schedule with 7-8 hours per night to reduce inflammation and symptom severity.",
                    source: "WHO Sleep Guidelines",
                    effectiveness: "High",
                    timeframe: "2-3 weeks",
                    steps: [
                      "Go to bed and wake up at the same time every day",
                      "Create a relaxing bedtime routine",
                      "Keep your bedroom cool, dark, and quiet",
                      "Avoid screens 1 hour before bedtime",
                    ],
                  },
                  {
                    id: "lifestyle-2",
                    title: "Gentle Movement Routine",
                    description:
                      "Incorporate low-impact exercise like walking, swimming, or tai chi for 20-30 minutes daily to improve joint mobility and reduce stiffness.",
                    source: "CDC Physical Activity Guidelines",
                    effectiveness: "Moderate",
                    timeframe: "4-6 weeks",
                    steps: [
                      "Start with 5-10 minutes and gradually increase",
                      "Focus on gentle, fluid movements",
                      "Include range-of-motion exercises",
                      "Consider water-based exercises for reduced joint stress",
                    ],
                  },
                  {
                    id: "lifestyle-3",
                    title: "Weather Monitoring",
                    description:
                      "Track local barometric pressure changes and prepare accordingly, as your symptoms show a 78% correlation with weather shifts.",
                    source: "Patient Data Analysis",
                    effectiveness: "Moderate",
                    timeframe: "Immediate",
                    steps: [
                      "Use a weather app with barometric pressure tracking",
                      "Prepare medications before forecasted pressure changes",
                      "Consider indoor activities during extreme weather",
                      "Use heating pads or ice packs proactively",
                    ],
                  },
                ].map((recommendation, index) => (
                  <motion.div
                    key={recommendation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl">{recommendation.title}</CardTitle>
                          <div className="flex gap-1">
                            <Badge variant={recommendation.effectiveness === "High" ? "default" : "secondary"}>
                              {recommendation.effectiveness} Impact
                            </Badge>
                          </div>
                        </div>
                        <CardDescription>{recommendation.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="steps">
                            <AccordionTrigger>Implementation Steps</AccordionTrigger>
                            <AccordionContent>
                              <ul className="space-y-2">
                                {recommendation.steps.map((step, stepIndex) => (
                                  <li key={stepIndex} className="flex items-start gap-2">
                                    <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 shrink-0">
                                      <span className="text-primary text-xs">{stepIndex + 1}</span>
                                    </div>
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          Results in: {recommendation.timeframe}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => markHelpful(recommendation.id)}>
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => markHelpful(recommendation.id)}>
                            <ThumbsDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={savedRecommendations.includes(recommendation.id) ? "secondary" : "ghost"}
                            size="icon"
                            onClick={() => saveRecommendation(recommendation.id)}
                          >
                            {savedRecommendations.includes(recommendation.id) ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <BookmarkPlus className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="diet" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Dietary Recommendations</CardTitle>
                    <CardDescription>Anti-inflammatory nutrition strategies</CardDescription>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Utensils className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  {
                    id: "diet-1",
                    title: "Anti-Inflammatory Diet Protocol",
                    description:
                      "Focus on foods that reduce inflammation and avoid those that may trigger inflammatory responses.",
                    source: "Mediterranean Diet Research",
                    effectiveness: "High",
                    timeframe: "4-8 weeks",
                    steps: [
                      "Increase omega-3 fatty acids (fatty fish, walnuts, flaxseeds)",
                      "Consume colorful fruits and vegetables daily",
                      "Choose whole grains over refined carbohydrates",
                      "Limit processed foods, added sugars, and saturated fats",
                    ],
                  },
                  {
                    id: "diet-2",
                    title: "Trigger Food Elimination",
                    description: "Temporarily eliminate common inflammatory foods to identify personal triggers.",
                    source: "Elimination Diet Protocol",
                    effectiveness: "Moderate",
                    timeframe: "3-4 weeks",
                    steps: [
                      "Remove dairy, gluten, processed sugar, and nightshades for 3 weeks",
                      "Reintroduce one food group at a time, every 3 days",
                      "Monitor symptoms after each reintroduction",
                      "Keep a detailed food and symptom journal",
                    ],
                  },
                  {
                    id: "diet-3",
                    title: "Hydration Strategy",
                    description: "Maintain optimal hydration to support joint health and reduce inflammation.",
                    source: "Rheumatology Nutrition Guidelines",
                    effectiveness: "Moderate",
                    timeframe: "1-2 weeks",
                    steps: [
                      "Drink 8-10 glasses of water daily",
                      "Reduce caffeine and alcohol consumption",
                      "Include herbal teas like turmeric and ginger",
                      "Monitor urine color as a hydration indicator",
                    ],
                  },
                ].map((recommendation, index) => (
                  <motion.div
                    key={recommendation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl">{recommendation.title}</CardTitle>
                          <div className="flex gap-1">
                            <Badge variant={recommendation.effectiveness === "High" ? "default" : "secondary"}>
                              {recommendation.effectiveness} Impact
                            </Badge>
                          </div>
                        </div>
                        <CardDescription>{recommendation.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="steps">
                            <AccordionTrigger>Implementation Steps</AccordionTrigger>
                            <AccordionContent>
                              <ul className="space-y-2">
                                {recommendation.steps.map((step, stepIndex) => (
                                  <li key={stepIndex} className="flex items-start gap-2">
                                    <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 shrink-0">
                                      <span className="text-primary text-xs">{stepIndex + 1}</span>
                                    </div>
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          Results in: {recommendation.timeframe}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => markHelpful(recommendation.id)}>
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => markHelpful(recommendation.id)}>
                            <ThumbsDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={savedRecommendations.includes(recommendation.id) ? "secondary" : "ghost"}
                            size="icon"
                            onClick={() => saveRecommendation(recommendation.id)}
                          >
                            {savedRecommendations.includes(recommendation.id) ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <BookmarkPlus className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="stress" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Stress Management Recommendations</CardTitle>
                    <CardDescription>Techniques to reduce stress-induced inflammation</CardDescription>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  {
                    id: "stress-1",
                    title: "Mindfulness Meditation Practice",
                    description: "Regular mindfulness meditation to reduce stress hormones and inflammation markers.",
                    source: "Mindfulness-Based Stress Reduction Research",
                    effectiveness: "High",
                    timeframe: "4-6 weeks",
                    steps: [
                      "Start with 5 minutes daily, gradually increasing to 15-20 minutes",
                      "Use guided meditations focused on chronic pain management",
                      "Practice body scanning to identify areas of tension",
                      "Incorporate mindful breathing throughout the day",
                    ],
                  },
                  {
                    id: "stress-2",
                    title: "Progressive Muscle Relaxation",
                    description:
                      "Systematic tensing and relaxing of muscle groups to reduce physical stress responses.",
                    source: "Clinical Psychology Guidelines",
                    effectiveness: "Moderate",
                    timeframe: "2-3 weeks",
                    steps: [
                      "Practice in a quiet, comfortable environment",
                      "Tense each muscle group for 5 seconds, then release for 10 seconds",
                      "Work from feet to head, covering all major muscle groups",
                      "Practice daily, preferably before bed",
                    ],
                  },
                  {
                    id: "stress-3",
                    title: "Nature Exposure Therapy",
                    description: "Regular exposure to natural environments to reduce stress hormones and improve mood.",
                    source: "Environmental Psychology Research",
                    effectiveness: "Moderate",
                    timeframe: "Immediate benefits, cumulative effects over time",
                    steps: [
                      "Spend 20-30 minutes in nature daily if possible",
                      "Practice mindful awareness of natural surroundings",
                      "If outdoor access is limited, use nature sounds and imagery",
                      "Incorporate indoor plants into your living environment",
                    ],
                  },
                ].map((recommendation, index) => (
                  <motion.div
                    key={recommendation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl">{recommendation.title}</CardTitle>
                          <div className="flex gap-1">
                            <Badge variant={recommendation.effectiveness === "High" ? "default" : "secondary"}>
                              {recommendation.effectiveness} Impact
                            </Badge>
                          </div>
                        </div>
                        <CardDescription>{recommendation.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="steps">
                            <AccordionTrigger>Implementation Steps</AccordionTrigger>
                            <AccordionContent>
                              <ul className="space-y-2">
                                {recommendation.steps.map((step, stepIndex) => (
                                  <li key={stepIndex} className="flex items-start gap-2">
                                    <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 shrink-0">
                                      <span className="text-primary text-xs">{stepIndex + 1}</span>
                                    </div>
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          Results in: {recommendation.timeframe}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => markHelpful(recommendation.id)}>
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => markHelpful(recommendation.id)}>
                            <ThumbsDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={savedRecommendations.includes(recommendation.id) ? "secondary" : "ghost"}
                            size="icon"
                            onClick={() => saveRecommendation(recommendation.id)}
                          >
                            {savedRecommendations.includes(recommendation.id) ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <BookmarkPlus className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="medical" className="space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Medical Recommendations</CardTitle>
                    <CardDescription>Treatment options to discuss with your healthcare provider</CardDescription>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  {
                    id: "medical-1",
                    title: "Biologic Therapy Evaluation",
                    description:
                      "Consider discussing biologic medication options with your doctor, as 65% of similar patients saw significant improvement.",
                    source: "CDC Chronic Disease Database",
                    effectiveness: "High",
                    timeframe: "2-3 months",
                    steps: [
                      "Discuss potential benefits and risks with your rheumatologist",
                      "Review insurance coverage and assistance programs",
                      "Complete necessary pre-treatment screenings",
                      "Develop a monitoring plan for effectiveness and side effects",
                    ],
                  },
                  {
                    id: "medical-2",
                    title: "Medication Timing Optimization",
                    description:
                      "Adjust medication timing to better address morning symptoms, which are 40% more frequent in your case.",
                    source: "Chronotherapy Research",
                    effectiveness: "Moderate",
                    timeframe: "1-2 weeks",
                    steps: [
                      "Discuss with your doctor about taking anti-inflammatory medication before bed",
                      "Consider using a timed-release formulation if available",
                      "Track symptom changes with adjusted timing",
                      "Maintain consistent medication schedule",
                    ],
                  },
                  {
                    id: "medical-3",
                    title: "Specialized Physical Therapy",
                    description:
                      "Targeted physical therapy program for your specific condition, which helped 42% of similar patients.",
                    source: "Rehabilitation Medicine Guidelines",
                    effectiveness: "Moderate",
                    timeframe: "6-8 weeks",
                    steps: [
                      "Get a referral to a physical therapist specializing in rheumatic conditions",
                      "Complete initial assessment and personalized program development",
                      "Commit to regular sessions (2-3 times weekly initially)",
                      "Practice prescribed exercises at home between sessions",
                    ],
                  },
                ].map((recommendation, index) => (
                  <motion.div
                    key={recommendation.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 * index }}
                  >
                    <Card>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-xl">{recommendation.title}</CardTitle>
                          <div className="flex gap-1">
                            <Badge variant={recommendation.effectiveness === "High" ? "default" : "secondary"}>
                              {recommendation.effectiveness} Impact
                            </Badge>
                          </div>
                        </div>
                        <CardDescription>{recommendation.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <Accordion type="single" collapsible className="w-full">
                          <AccordionItem value="steps">
                            <AccordionTrigger>Discussion Points</AccordionTrigger>
                            <AccordionContent>
                              <ul className="space-y-2">
                                {recommendation.steps.map((step, stepIndex) => (
                                  <li key={stepIndex} className="flex items-start gap-2">
                                    <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mt-0.5 shrink-0">
                                      <span className="text-primary text-xs">{stepIndex + 1}</span>
                                    </div>
                                    <span>{step}</span>
                                  </li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2">
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="mr-1 h-3 w-3" />
                          Results in: {recommendation.timeframe}
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => markHelpful(recommendation.id)}>
                            <ThumbsUp className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => markHelpful(recommendation.id)}>
                            <ThumbsDown className="h-4 w-4" />
                          </Button>
                          <Button
                            variant={savedRecommendations.includes(recommendation.id) ? "secondary" : "ghost"}
                            size="icon"
                            onClick={() => saveRecommendation(recommendation.id)}
                          >
                            {savedRecommendations.includes(recommendation.id) ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              <BookmarkPlus className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
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
                <CardTitle>Research & Clinical Trials</CardTitle>
                <CardDescription>Relevant research and clinical trials for your condition</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    title: "Novel Anti-Inflammatory Pathway Study",
                    institution: "National Institutes of Health",
                    status: "Recruiting",
                    location: "Multiple Locations",
                    url: "#",
                  },
                  {
                    title: "Microbiome Influence on Rheumatic Conditions",
                    institution: "University Research Hospital",
                    status: "Active",
                    location: "Remote Participation Available",
                    url: "#",
                  },
                  {
                    title: "Chronotherapy Optimization for Inflammatory Conditions",
                    institution: "Center for Chronobiology",
                    status: "Recruiting",
                    location: "Virtual Study",
                    url: "#",
                  },
                ].map((trial, index) => (
                  <div key={index} className="border rounded-lg p-4 hover:bg-accent transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium">{trial.title}</h4>
                      <Badge variant="outline">{trial.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{trial.institution}</p>
                    <p className="text-sm text-muted-foreground mb-3">{trial.location}</p>
                    <Button variant="outline" size="sm" className="gap-1">
                      <ExternalLink className="h-3 w-3" />
                      Learn More
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
