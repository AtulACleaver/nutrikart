export const formatCurrency = (amount) => {
    return `₹${Number(amount).toFixed(0)}`
}

export const formatDecimal = (value, places = 1) => {
    if (value === null || value === undefined) return '—'
    return Number(value).toFixed(places)
}

export const getConditionLabel = (condition) => {
    const labels = {
    diabetic: 'Diabetes-Friendly',
    hypertension: 'Heart-Healthy',
    weight_loss: 'Weight Management',
    }
    return labels[condition] || 'General Wellness'
}