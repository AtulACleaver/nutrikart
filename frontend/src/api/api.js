import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/'

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

export const getRecommendations = async (formData) => {
    const response = await api.post('/recommend', {
        budget: Number(formData.budget),
        health_condition: formData.healthCondition || null,
        household_size: Number(formData.householdSize),
    })
    return response.data
}