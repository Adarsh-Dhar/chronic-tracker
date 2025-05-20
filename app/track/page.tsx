"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Mic, MicOff, Plus, X, Save } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"

export default function TrackPage() {
  const { toast } = useToast()
  const [isRecording, setIsRecording] = useState(false)
  const [symptomText, setSymptomText] = useState("")
  const [painLevel, setPainLevel] = useState([5])
  const [triggers, setTriggers] = useState<string[]>([])
  const [newTrigger, setNewTrigger] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Mock recording functionality
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  const startRecording = () => {
    setIsRecording(true)
    setRecordingTime(0)

    // Start timer
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1)
    }, 1000)

    toast({
      title: "Recording started",
      description: "Speak clearly to describe your symptoms",
    })
  }

  const stopRecording = () => {
    setIsRecording(false)

    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    // Mock transcription result
    setTimeout(() => {
      setSymptomText(
        (prev) => prev + (prev ? " " : "") + "Migraine with nausea, rated 7/10 severity. Noticed light sensitivity.",
      )

      toast({
        title: "Recording processed",
        description: "Your symptoms have been transcribed",
      })
    }, 1000)
  }

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  const addTrigger = () => {
    if (newTrigger && !triggers.includes(newTrigger)) {
      setTriggers([...triggers, newTrigger])
      setNewTrigger("")
    }
  }

  const removeTrigger = (trigger: string) => {
    setTriggers(triggers.filter((t) => t !== trigger))
  }

  const handleSubmit = async () => {
    if (!symptomText) {
      toast({
        title: "Error",
        description: "Please enter your symptoms",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Send data to API endpoint
      const response = await fetch('/api/symptom-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symptomText,
          painLevel: painLevel[0], // Get the first value from the array
          triggers,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to save symptom log')
      }

      toast({
        title: "Symptoms logged successfully",
        description: "Your health data has been saved to the database",
      })

      // Reset form
      setSymptomText("")
      setPainLevel([5])
      setTriggers([])
    } catch (error) {
      console.error('Error saving symptom log:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save your symptom log",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="container py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Track Your Symptoms</h1>
        <p className="text-muted-foreground text-lg mb-8">
          Log how you're feeling today to help identify patterns and triggers
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Symptom Description</CardTitle>
              <CardDescription>Describe your symptoms in detail or use voice recording</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative">
                <Textarea
                  placeholder="Describe your symptoms (e.g., Migraine with nausea, rated 7/10 severity)"
                  className="min-h-[150px] resize-none pr-12"
                  value={symptomText}
                  onChange={(e) => setSymptomText(e.target.value)}
                />
                <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={toggleRecording}>
                  {isRecording ? <MicOff className="h-5 w-5 text-destructive" /> : <Mic className="h-5 w-5" />}
                </Button>
              </div>

              <AnimatePresence>
                {isRecording && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-primary/10 rounded-md p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping" />
                        <div className="relative h-3 w-3 bg-primary rounded-full" />
                      </div>
                      <span>Recording... {formatTime(recordingTime)}</span>
                    </div>
                    <Button size="sm" variant="secondary" onClick={stopRecording}>
                      Stop
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-3">
                <Label>Pain Level</Label>
                <div className="flex items-center gap-4">
                  <Slider value={painLevel} min={1} max={10} step={1} onValueChange={setPainLevel} className="flex-1" />
                  <span className="font-bold text-lg w-8 text-center">{painLevel[0]}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Mild</span>
                  <span>Moderate</span>
                  <span>Severe</span>
                </div>
              </div>

              <div className="space-y-3">
                <Label>When did it start?</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Select defaultValue="today">
                      <SelectTrigger>
                        <SelectValue placeholder="Select day" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Today</SelectItem>
                        <SelectItem value="yesterday">Yesterday</SelectItem>
                        <SelectItem value="2days">2 days ago</SelectItem>
                        <SelectItem value="3days">3 days ago</SelectItem>
                        <SelectItem value="week">A week ago</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Input type="time" defaultValue="08:30" />
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Potential Triggers</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {triggers.map((trigger) => (
                    <Badge key={trigger} variant="secondary" className="gap-1 group">
                      {trigger}
                      <X
                        className="h-3 w-3 cursor-pointer opacity-70 group-hover:opacity-100"
                        onClick={() => removeTrigger(trigger)}
                      />
                    </Badge>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a trigger (e.g., stress, food)"
                    value={newTrigger}
                    onChange={(e) => setNewTrigger(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addTrigger()
                      }
                    }}
                  />
                  <Button variant="outline" size="icon" onClick={addTrigger}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Button className="w-full mt-4" size="lg" onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-5 w-5" />
                    Save Symptom Log
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
              <CardTitle>Recent Logs</CardTitle>
              <CardDescription>Your most recent symptom entries</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { date: "Today, 8:30 AM", symptom: "Migraine with nausea", severity: 7 },
                { date: "Yesterday, 9:15 PM", symptom: "Joint pain in knees", severity: 5 },
                { date: "May 18, 2025", symptom: "Fatigue and dizziness", severity: 6 },
              ].map((log, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 * index }}
                >
                  <div className="border rounded-lg p-3 hover:bg-accent transition-colors">
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-medium">{log.symptom}</span>
                      <Badge variant={log.severity > 6 ? "destructive" : "outline"}>{log.severity}/10</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{log.date}</p>
                  </div>
                </motion.div>
              ))}

              <Button variant="outline" className="w-full">
                View All History
              </Button>
            </CardContent>
          </Card>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-6"
          >
            <Card className="bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle>Quick Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <p className="font-medium">Be Specific</p>
                  <p className="text-muted-foreground">Include location, intensity, and duration of symptoms</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Note Triggers</p>
                  <p className="text-muted-foreground">Record potential triggers like food, stress, or weather</p>
                </div>
                <div className="text-sm">
                  <p className="font-medium">Track Consistently</p>
                  <p className="text-muted-foreground">Daily tracking helps identify patterns over time</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}
