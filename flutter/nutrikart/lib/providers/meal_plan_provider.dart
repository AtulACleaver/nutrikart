import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nutrikart/models/meal_plan_model.dart';

class MealPlanState {
  final MealPlan plan;
  final DateTime selectedDate;

  MealPlanState({required this.plan, required this.selectedDate});

  MealPlanState copyWith({DateTime? selectedDate}) {
    return MealPlanState(
      plan: plan,
      selectedDate: selectedDate ?? this.selectedDate,
    );
  }
}

class MealPlanNotifier extends StateNotifier<MealPlanState> {
  MealPlanNotifier() : super(_initialState());

  static MealPlanState _initialState() {
    final today = DateUtils.dateOnly(DateTime.now());
    
    final mockMeal1 = Meal(
      name: 'Greek Yogurt Parfait',
      description: '300-400 cal',
      calories: 320,
      timeOfDay: 'Breakfast',
      imageUrl: 'assets/yogurt_parfait.png',
      ingredients: [Ingredient(name: 'Greek Yogurt', quantity: '1 cup'), Ingredient(name: 'Granola', quantity: '1/2 cup')],
    );

    final mockMeal2 = Meal(
      name: 'Veggie Egg White Omelet',
      description: '350-450 cal',
      calories: 380,
      timeOfDay: 'Breakfast',
      imageUrl: 'assets/omelet.png',
      ingredients: [Ingredient(name: 'Egg Whites', quantity: '4'), Ingredient(name: 'Spinach', quantity: '1 cup')],
    );

    final mockLunch = Meal(
      name: 'Chicken Salad Bowl',
      description: '450-550 cal',
      calories: 500,
      timeOfDay: 'Lunch',
      imageUrl: 'assets/salad.png',
      ingredients: [Ingredient(name: 'Grilled Chicken', quantity: '4 oz'), Ingredient(name: 'Mixed Greens', quantity: '1 bowl')],
    );

    final mockDinner = Meal(
      name: 'Baked Salmon & Asparagus',
      description: '550-650 cal',
      calories: 600,
      timeOfDay: 'Dinner',
      imageUrl: 'assets/salmon.png',
      ingredients: [Ingredient(name: 'Salmon Fillet', quantity: '6 oz'), Ingredient(name: 'Asparagus', quantity: '1 bunch')],
    );
    
    // Create mock daily plans for 4 days (15th, 16th, 17th, 18th)
    final planDate1 = today.subtract(const Duration(days: 2));
    final planDate2 = today.subtract(const Duration(days: 1));
    final planDate3 = today;
    final planDate4 = today.add(const Duration(days: 1));

    final dailyPlans = [
      DailyMealPlan(date: planDate1, meals: [mockMeal1, mockLunch, mockDinner]),
      DailyMealPlan(date: planDate2, meals: [mockMeal2, mockLunch, mockDinner]),
      DailyMealPlan(date: planDate3, meals: [mockMeal1, mockMeal2, mockLunch, mockDinner]), // Today
      DailyMealPlan(date: planDate4, meals: [mockMeal1, mockLunch, mockDinner]),
    ];

    return MealPlanState(
      plan: MealPlan(userDiet: 'Diabetes Diet', dailyPlans: dailyPlans),
      selectedDate: today,
    );
  }

  void selectDate(DateTime date) {
    state = state.copyWith(selectedDate: date);
  }

  DailyMealPlan? getPlanForSelectedDate() {
    return state.plan.dailyPlans.firstWhere(
      (plan) => DateUtils.dateOnly(plan.date) == DateUtils.dateOnly(state.selectedDate),
      orElse: () => DailyMealPlan(date: state.selectedDate, meals: []),
    );
  }
}

final mealPlanProvider = StateNotifierProvider<MealPlanNotifier, MealPlanState>((ref) {
  return MealPlanNotifier();
});

// Utility provider for easily accessing the current day's plan
final currentDailyPlanProvider = Provider<DailyMealPlan?>((ref) {
  return ref.watch(mealPlanProvider.notifier).getPlanForSelectedDate();
});
