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
  
  // Factory constructor to create from API nutriments data
  factory NutritionData.fromNutriments(Map<String, dynamic> nutriments) {
    // Helper function to safely get double values
    double getValue(String key, {double defaultValue = 0.0}) {
      final value = nutriments[key];
      if (value == null) return defaultValue;
      if (value is num) return value.toDouble();
      if (value is String) return double.tryParse(value) ?? defaultValue;
      return defaultValue;
    }
    
    // Calculate daily value percentages (simplified)
    double calculateDV(double amount, double dailyValue) {
      return dailyValue > 0 ? (amount / dailyValue * 100) : 0;
    }
    
    final calories = getValue('energy-kcal_100g').round();
    final proteinAmount = getValue('proteins_100g');
    final carbsAmount = getValue('carbohydrates_100g');
    final fatAmount = getValue('fat_100g');
    
    return NutritionData(
      calories: calories,
      calorieContext: "Per 100g - Daily value based on 2000 kcal diet",
      protein: Nutrient(
        name: 'Protein',
        amount: proteinAmount,
        unit: 'g',
        dailyValuePercentage: calculateDV(proteinAmount, 50), // 50g DV for protein
      ),
      carbs: Nutrient(
        name: 'Carbohydrates',
        amount: carbsAmount,
        unit: 'g',
        dailyValuePercentage: calculateDV(carbsAmount, 300), // 300g DV for carbs
      ),
      fat: Nutrient(
        name: 'Fat',
        amount: fatAmount,
        unit: 'g',
        dailyValuePercentage: calculateDV(fatAmount, 65), // 65g DV for fat
      ),
      additionalNutrients: [
        Nutrient(
          name: 'Sugar',
          amount: getValue('sugars_100g'),
          unit: 'g',
        ),
        Nutrient(
          name: 'Fiber',
          amount: getValue('fiber_100g'),
          unit: 'g',
        ),
        Nutrient(
          name: 'Sodium',
          amount: getValue('sodium_100g') * 1000, // Convert to mg
          unit: 'mg',
        ),
        Nutrient(
          name: 'Saturated Fat',
          amount: getValue('saturated-fat_100g'),
          unit: 'g',
        ),
      ],
      vitaminsAndMinerals: [
        // These would need to be extracted if available in the nutriments
        // For now, we'll use empty list or mock data
      ],
    );
  }

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
  
  // Mock bread data
  static const mockBreadData = NutritionData(
    calories: 250,
    calorieContext: "Daily value based on 2000 kcal diet",
    protein: Nutrient(name: 'Protein', amount: 8, unit: 'g', dailyValuePercentage: 16),
    carbs: Nutrient(name: 'Carbs', amount: 48, unit: 'g', dailyValuePercentage: 16),
    fat: Nutrient(name: 'Fat', amount: 3, unit: 'g', dailyValuePercentage: 5),
    additionalNutrients: [
      Nutrient(name: 'Sugar', amount: 2, unit: 'g'),
      Nutrient(name: 'Fiber', amount: 2, unit: 'g'),
      Nutrient(name: 'Sodium', amount: 400, unit: 'mg'),
    ],
    vitaminsAndMinerals: [],
  );
}
