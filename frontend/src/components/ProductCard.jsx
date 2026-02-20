import { formatCurrency, formatDecimal } from '../utils/formatters'

export default function ProductCard({ product, rank }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100
                    p-4 flex flex-col sm:flex-row gap-3 sm:gap-4
                    hover:shadow-md transition-shadow">
      {/* Rank badge — hidden on mobile */}
      <div className="hidden sm:flex flex-shrink-0 w-8 h-8 bg-green-100
                      text-green-700 rounded-full items-center justify-center
                      text-sm font-bold">
        {rank}
      </div>

      {/* Product image */}
      <div className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden
                      bg-gray-100">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-contain"
            onError={(e) => {
              e.target.style.display = 'none'
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center
                          text-gray-400 text-2xl">
            🛒
          </div>
        )}
      </div>

      {/* Product info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-gray-900 text-sm leading-tight
                       truncate">
          {product.name}
        </h3>

        <div className="flex items-center gap-2 mt-1">
          <span className="text-green-700 font-semibold text-sm">
            {formatCurrency(product.price_per_unit)} × {product.quantity}
          </span>
          <span className="text-gray-400">→</span>
          <span className="font-bold text-gray-900">
            {formatCurrency(product.subtotal)}
          </span>
        </div>

        {/* Nutrition pills */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          <NutrientPill label="Cal" value={product.calories} unit="kcal" />
          <NutrientPill label="Sugar" value={product.sugar} unit="g"
                        warn={product.sugar > 3} />
          <NutrientPill label="Protein" value={product.protein} unit="g"
                        good={product.protein > 5} />
          <NutrientPill label="Fiber" value={product.fiber} unit="g"
                        good={product.fiber > 3} />
          <NutrientPill label="Sodium" value={product.sodium} unit="mg"
                        warn={product.sodium > 150} />
        </div>
      </div>

      {/* Score */}
      <div className="flex-shrink-0 text-right">
        <div className="text-xs text-gray-400">Score</div>
        <div className={`text-lg font-bold ${
          product.score > 0 ? 'text-green-600' : 'text-red-500'
        }`}>
          {product.score > 0 ? '+' : ''}{formatDecimal(product.score, 1)}
        </div>
      </div>
    </div>
  )
}