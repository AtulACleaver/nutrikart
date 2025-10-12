// Represents a single macro or additional nutrient
class Nutrient {
  final String name;
  final double amount;
  final String unit;
  final double dailyValuePercentage; // The percentage shown next to the nutrient

  const Nutrient({
    required this.name,
    required this.amount,
    required this.unit,
    this.dailyValuePercentage = 0,
  });
}

// Represents the overall nutrition data for a product
class NutritionData {
  final int calories;
  final String calorieContext; // e.g., "Daily value based on 2000 kcal diet"
  final Nutrient protein;
  final Nutrient carbs;
  final Nutrient fat;
  final List<Nutrient> additionalNutrients;
  final List<Nutrient> vitaminsAndMinerals;

  const NutritionData({
    required this.calories,
    required this.calorieContext,
    required this.protein,
    required this.carbs,
    required this.fat,
    required this.additionalNutrients,
    required this.vitaminsAndMinerals,
  });

  // Mock data for the Espresso product shown in the design
  static const mockEspressoData = NutritionData(
    calories: 320,
    calorieContext: "Daily value based on 2000 kcal diet",
    protein: Nutrient(name: 'Protein', amount: 28, unit: 'g', dailyValuePercentage: 37),
    carbs: Nutrient(name: 'Carbs', amount: 13, unit: 'g', dailyValuePercentage: 4),
    fat: Nutrient(name: 'Fat', amount: 18, unit: 'g', dailyValuePercentage: 27),
    additionalNutrients: [
      Nutrient(name: 'Sugar', amount: 3, unit: 'g'),
      Nutrient(name: 'Fiber', amount: 5, unit: 'g'),
      Nutrient(name: 'Sodium', amount: 120, unit: 'mg'),
    ],
    vitaminsAndMinerals: [
      Nutrient(name: 'Vitamin A', amount: 45, unit: '%', dailyValuePercentage: 45),
      Nutrient(name: 'Vitamin C', amount: 8, unit: '%', dailyValuePercentage: 8),
      Nutrient(name: 'Iron', amount: 10, unit: '%', dailyValuePercentage: 10),
    ],
  );
}
