import { useState } from 'react'
import Header from './components/Header'
import InputForm from './components/InputForm'
import { getRecommendations } from './api/api'

function App() {
  const [results, setResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (formData) => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await getRecommendations(formData)
      setResults(data)
    } catch (err) {
      const message =
        err.response?.data?.detail || 'Something went wrong. Is the backend running?'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setResults(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {error && (
        <div className="max-w-md mx-auto mt-6 px-4">
          <div className="bg-red-50 border border-red-200 text-red-700
                          rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        </div>
      )}

      {!results ? (
        <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
      ) : (
        <div className="max-w-5xl mx-auto mt-6 px-4">
          <button
            onClick={handleReset}
            className="text-sm text-green-600 hover:text-green-800
                       font-medium mb-4 inline-flex items-center gap-1"
          >
            ← New search
          </button>
          {/* Temporary: show raw JSON to verify API connection */}
          <pre className="bg-white p-4 rounded-lg shadow text-xs overflow-auto">
            {JSON.stringify(results, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
}

export default App