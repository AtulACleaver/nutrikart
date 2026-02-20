import ProductCard from './ProductCard'
import BudgetSummary from './BudgetSummary'
import { getConditionLabel } from '../utils/formatters'

export default function ResultsPage({ data }) {
  const { recommendations, summary } = data

  return (
    <div className="space-y-6">
      {/* Results header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900">
          Your Recommendations
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {getConditionLabel(summary.health_condition)} ·{' '}
          {summary.products_after_filter} of {summary.products_considered}{' '}
          products passed filters ·{' '}
          {recommendations.length} selected within budget
        </p>
      </div>

      {/* Budget summary */}
      <BudgetSummary summary={summary} />

      {/* Product list */}
      <div className="space-y-3">
        {recommendations.map((product, index) => (
          <ProductCard
            key={product.product_id}
            product={product}
            rank={index + 1}
          />
        ))}
      </div>
    </div>
  )
}