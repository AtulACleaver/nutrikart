import 'package:flutter/material.dart';
import 'package:nutrikart/models/meal_plan_model.dart'; // Assume colors are defined

class MealCard extends StatelessWidget {
  final Meal meal;

  const MealCard({super.key, required this.meal});

  @override
  Widget build(BuildContext context) {
    // Placeholder for a detailed 'Add to Planner' function.
    void onAddToPlanner() {
      // Logic to add this meal to the user's future meal planner
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('${meal.name} added to planner.')),
      );
    }

    // Placeholder for navigating to a 'Repalce Meal' screen.
    void onReplaceMeal() {
      // Logic to navigate to a screen to find a replacement meal
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Finding replacement for ${meal.name}...')),
      );
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 20.0),
      padding: const EdgeInsets.all(16.0),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            spreadRadius: 1,
            blurRadius: 5,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Meal Header (Time of Day)
          Text(
            meal.timeOfDay,
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: Colors.grey.shade800,
            ),
          ),
          const Divider(height: 20, thickness: 1),

          // Meal Content Row (Image + Details)
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Placeholder for the meal image
              Container(
                width: 60,
                height: 60,
                decoration: BoxDecoration(
                  color: Colors.grey.shade200,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Center(
                  child: Icon(Icons.restaurant, color: Colors.grey.shade500),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      meal.name,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      meal.description,
                      style: TextStyle(fontSize: 12, color: Colors.grey.shade600),
                    ),
                    Text(
                      '${meal.calories} cal',
                      style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.primaryGreen),
                    ),
                  ],
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 16),

          // Action Buttons
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // 1. Add to planner Button
              TextButton.icon(
                onPressed: onAddToPlanner,
                icon: const Icon(Icons.history_toggle_off, size: 18),
                label: const Text('Add to planner', style: TextStyle(fontWeight: FontWeight.bold)),
                style: TextButton.styleFrom(
                  foregroundColor: AppColors.primaryGreen,
                  padding: EdgeInsets.zero,
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
              ),
              
              // 2. Replace Button
              TextButton.icon(
                onPressed: onReplaceMeal,
                icon: const Icon(Icons.refresh, size: 18),
                label: const Text('Replace', style: TextStyle(fontWeight: FontWeight.bold)),
                style: TextButton.styleFrom(
                  foregroundColor: Colors.pink, // Use a distinct color as per design
                  padding: EdgeInsets.zero,
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                ),
              ),

              // 3. Add Grocery Button
              ElevatedButton.icon(
                onPressed: () {
                  // Logic to add all ingredients of this meal to the grocery cart
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('Ingredients for ${meal.name} added to cart.')),
                  );
                },
                icon: const Icon(Icons.add_shopping_cart, size: 18),
                label: const Text('Add grocery'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryGreen,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// Placeholder for AppColors class if it wasn't defined earlier
class AppColors {
  static const Color primaryGreen = Color(0xFF386641);
  static const Color accentPink = Colors.pink;
}
