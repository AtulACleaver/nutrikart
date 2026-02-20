import {
    PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
  } from 'recharts'
  import { formatCurrency } from '../utils/formatters'
  
  const COLORS = [
    '#16a34a', '#22c55e', '#4ade80', '#86efac',
    '#059669', '#10b981', '#34d399', '#6ee7b7',
    '#0d9488', '#14b8a6',
  ]
  
  export default function NutritionChart({ recommendations, summary }) {
    // Spending by category
    const categorySpending = getCategorySpending(recommendations)
  
    // Nutrition totals per product
    const nutritionData = recommendations.map((p) => ({
      name: p.name.length > 20 ? p.name.slice(0, 20) + '...' : p.name,
      Calories: p.calories * p.quantity,
      Protein: p.protein * p.quantity,
      Sugar: p.sugar * p.quantity,
      Fiber: p.fiber * p.quantity,
    }))
  
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Spending pie chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">
            Spending by Category
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={categorySpending}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} (${(percent * 100).toFixed(0)}%)`
                }
              >
                {categorySpending.map((entry, index) => (
                  <Cell
                    key={entry.name}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(value)}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
  
        {/* Nutrition bar chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">
            Nutrition per Product (total qty)
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={nutritionData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis
                type="category"
                dataKey="name"
                width={120}
                tick={{ fontSize: 11 }}
              />
              <Tooltip />
              <Legend />
              <Bar dataKey="Protein" fill="#16a34a" />
              <Bar dataKey="Fiber" fill="#22c55e" />
              <Bar dataKey="Sugar" fill="#f87171" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    )
  }
  
  
  // Group products by category_id and sum subtotals
  function getCategorySpending(recommendations) {
    const map = {}
    for (const p of recommendations) {
      const key = `Cat ${p.category_id}`
      map[key] = (map[key] || 0) + p.subtotal
    }
    return Object.entries(map).map(([name, value]) => ({ name, value }))
  }