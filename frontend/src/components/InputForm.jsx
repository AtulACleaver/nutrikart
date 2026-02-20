import { useState } from 'react'

const HEALTH_CONDITIONS = [
    { value: '', label: 'No specific condition' },
    { value: 'diabetic', label: 'Diabetic' },
    { value: 'hypertension', label: 'Hypertension' },
    { value: 'weight_loss', label: 'Weight Loss' },
]

export default function InputForm({ onSubmit, isLoading }) {
    const [budget, setBudget] = useState('')
    const [healthCondition, setHealthCondition] = useState('')
    const [householdSize, setHouseholdSize] = useState(1)

    const handleSubmit = (e) => {
        e.preventDefault()
    if (!budget || Number(budget) <= 0) return

    onSubmit({
        budget: Number(budget),
        healthCondition: healthCondition || null,
        householdSize: Number(householdSize),
    })
    }

    return (
    <div className="max-w-md mx-auto mt-10 px-4">
        <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-1">
                Get Your Recommendations
            </h2>
            <p className="text-sm text-gray-500 mb-6">
                Tell us your budget and health needs. We'll pick the best groceries for you.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Budget */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monthly Budget (₹)
                    </label>
                    <input
                        type="number"
                        min="1"
                        step="1"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        placeholder="e.g. 500"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-green-500 focus:border-green-500
                         outline-none transition-colors"
                        required
                    />
                </div>

                {/* Health Condition */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Health Condition
                    </label>
                    <select
                        value={healthCondition}
                        onChange={(e) => setHealthCondition(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-green-500 focus:border-green-500
                         outline-none transition-colors bg-white"
                    >
                        {HEALTH_CONDITIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>
                                {opt.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Household Size */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Household Size
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="20"
                        value={householdSize}
                        onChange={(e) => setHouseholdSize(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg
                         focus:ring-2 focus:ring-green-500 focus:border-green-500
                         outline-none transition-colors"
                    />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={isLoading || !budget}
                    className="w-full py-2.5 bg-green-600 text-white font-medium rounded-lg
                       hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed
                       transition-colors"
                >
                    {isLoading ? 'Finding products...' : 'Get Recommendations'}
                </button>
            </form>
        </div>
    </div>
    )
}