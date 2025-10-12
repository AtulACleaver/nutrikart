// ignore: unused_import
import 'package:flutter/material.dart';

// Represents a single ingredient within a meal
class Ingredient {
  final String name;
  final String quantity; // e.g., '1 cup', '2 slices'

  Ingredient({required this.name, required this.quantity});
}

// Represents a single meal (e.g., Breakfast, Lunch, Dinner)
class Meal {
  final String name;
  final String description; // e.g., '300-400 cal', 'High Protein'
  final int calories;
  final String timeOfDay; // 'Breakfast', 'Lunch', 'Dinner'
  final String imageUrl; // Placeholder for image asset/URL
  final List<Ingredient> ingredients;

  Meal({
    required this.name,
    required this.description,
    required this.calories,
    required this.timeOfDay,
    required this.imageUrl,
    required this.ingredients,
  });
}

// Represents the plan for a single day
class DailyMealPlan {
  final DateTime date;
  final List<Meal> meals;

  DailyMealPlan({required this.date, required this.meals});
}

// Represents the overall user meal plan
class MealPlan {
  final String userDiet; // e.g., 'Diabetes Diet'
  final List<DailyMealPlan> dailyPlans;

  MealPlan({required this.userDiet, required this.dailyPlans});
}
