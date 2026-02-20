import { formatCurrency } from '../utils/formatters'

export default function BudgetSummary({ summary }) {
  const spentPercent = Math.min(
    (summary.total_spent / summary.budget) * 100,
    100
  )

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-gray-800">Budget Breakdown</h3>
        <span className="text-sm text-gray-500">
          Household of {summary.household_size}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-100 rounded-full h-3 mb-2">
        <div
          className="bg-green-500 h-3 rounded-full transition-all duration-500"
          style={{ width: `${spentPercent}%` }}
        />
      </div>

      <div className="flex justify-between text-sm">
        <span className="text-gray-600">
          Spent: <span className="font-semibold text-gray-900">
            {formatCurrency(summary.total_spent)}
          </span>
        </span>
        <span className="text-gray-600">
          Remaining: <span className="font-semibold text-green-600">
            {formatCurrency(summary.remaining_budget)}
          </span>
        </span>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-100">
        <StatBox
          label="Products"
          value={summary.total_products}
        />
        <StatBox
          label="Total Calories"
          value={`${summary.total_calories.toFixed(0)} kcal`}
        />
        <StatBox
          label="Total Protein"
          value={`${summary.total_protein.toFixed(0)}g`}
        />
      </div>
    </div>
  )
}

function StatBox({ label, value }) {
  return (
    <div className="text-center">
      <div className="text-lg font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  )
}