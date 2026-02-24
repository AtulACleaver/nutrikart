// src/App.jsx
import { useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import InputForm from './components/InputForm'
import ResultsPage from './components/ResultsPage'
import LoadingSpinner from './components/LoadingSpinner'
import ErrorMessage from './components/ErrorMessage'
import { getRecommendations } from './api/api'

function App() {
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastFormData, setLastFormData] = useState(null)

  const handleSubmit = async (formData) => {
    setIsLoading(true)
    setError(null)
    setResults(null)
    setLastFormData(formData)

    try {
      const data = await getRecommendations(formData)
      setResults(data)
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        'Could not reach the server. Make sure the backend is running on port 8000.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleRetry = () => {
    if (lastFormData) {
      handleSubmit(lastFormData)
    }
  }

  const handleReset = () => {
    setResults(null)
    setError(null)
    setLastFormData(null)
  }

  // ── Render states ──

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <LoadingSpinner />
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1">
          <ErrorMessage message={error} onRetry={handleRetry} />
          <div className="text-center mt-4">
            <button
              onClick={handleReset}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              ← Back to form
            </button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (results) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-1 max-w-5xl mx-auto mt-6 px-4 pb-10 w-full">
          <button
            onClick={handleReset}
            className="text-sm text-green-600 hover:text-green-800
                       font-medium mb-4 inline-flex items-center gap-1"
          >
            ← New search
          </button>
          <ResultsPage data={results} />
        </div>
        <Footer />
      </div>
    )
  }

  // Default: show form
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <div className="flex-1">
        <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
      <Footer />
    </div>
  )
}

export default App