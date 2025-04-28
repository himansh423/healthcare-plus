"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Sparkles, CheckCircle, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface Scheme {
  name: string
  category: string
  eligibility: string
  reason: string
  TrustScore: string
  schemeId: string
}

interface RecommendationResponse {
  recommendation: {
    recommended_schemes: Scheme[]
  }
}

export default function SchemeFinderPage() {
  const [loading, setLoading] = useState(false)
  const [schemes, setSchemes] = useState<Scheme[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fetchRecommendations = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ai-scheme/recommend")

      if (!response.ok) {
        throw new Error("Failed to fetch recommendations")
      }

      const data: RecommendationResponse = await response.json()
      setSchemes(data.recommendation.recommended_schemes)
    } catch (err) {
      setError("Something went wrong. Please try again later.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container max-w-6xl mx-auto py-12 px-4 md:px-6">
      {!schemes ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center text-center"
        >
          <div className="inline-flex items-center justify-center p-2 bg-blue-100 rounded-full mb-6">
            <Sparkles className="h-10 w-10 text-blue-600" />
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-blue-600 mb-4">AI Scheme Finder</h1>

          <p className="text-xl text-gray-600 max-w-3xl mb-8">
            Our intelligent system analyzes your profile to recommend the most suitable government schemes for you and
            your family.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-12">
            {[
              {
                title: "Personalized Recommendations",
                description: "Get scheme suggestions tailored to your specific needs and circumstances",
              },
              {
                title: "Comprehensive Coverage",
                description: "Discover schemes across health, finance, education, and more",
              },
              {
                title: "Easy Application",
                description: "Find eligibility details and application guidance for each scheme",
              },
            ].map((feature, index) => (
              <Card key={index} className="bg-white border border-gray-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            onClick={fetchRecommendations}
            disabled={loading}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md px-8 py-6 h-auto"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Finding Schemes...
              </>
            ) : (
              <>
                Get AI Scheme Recommendations
                <ArrowRight className="ml-2 h-5 w-5" />
              </>
            )}
          </Button>

          {error && <p className="mt-4 text-red-500">{error}</p>}
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          <div className="flex flex-col items-center text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-blue-600 mb-2">Your Recommended Schemes</h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Based on your profile, we&apos;ve identified these schemes that you may be eligible for.
            </p>
            <Button onClick={() => setSchemes(null)} variant="outline" className="mt-4">
              Back to Overview
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {schemes.map((scheme, index) => (
              <SchemeCard key={index} scheme={scheme} delay={index * 0.1} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

function SchemeCard({ scheme, delay }: { scheme: Scheme; delay: number }) {
  const trustScoreValue = Number.parseInt(scheme.TrustScore) * 25 // Convert 1-4 scale to percentage (25%, 50%, 75%, 100%)

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay }}>
      <Card className="h-full overflow-hidden border-2 hover:border-blue-300 transition-all duration-200">
        <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex justify-between items-start">
            <div>
              <Badge className="mb-2 bg-blue-100 text-blue-800 hover:bg-blue-200">{scheme.category}</Badge>
              <CardTitle className="text-xl font-bold text-blue-800">{scheme.name}</CardTitle>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-sm text-gray-500 mb-1">Trust Score</span>
              <div className="w-24">
                <Progress value={trustScoreValue} className="h-2 bg-gray-200" />
              </div>
              <div className="flex items-center mt-1">
                {[...Array(Number.parseInt(scheme.TrustScore))].map((_, i) => (
                  <CheckCircle key={i} className="h-4 w-4 text-blue-600" />
                ))}
                {[...Array(4 - Number.parseInt(scheme.TrustScore))].map((_, i) => (
                  <CheckCircle key={i} className="h-4 w-4 text-gray-300" />
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-500 mb-1">Eligibility</h4>
            <p className="text-gray-700">{scheme.eligibility}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-500 mb-1">Why It&apos;s Recommended</h4>
            <p className="text-gray-700">{scheme.reason}</p>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 border-t">
          <div className="flex justify-between items-center w-full">
            <span className="text-xs text-gray-500">Scheme ID: {scheme.schemeId}</span>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
              Apply Now
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
