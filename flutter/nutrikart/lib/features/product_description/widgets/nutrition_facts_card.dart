import 'package:flutter/material.dart';
import 'package:nutrikart/core/theme/app_colors.dart';
import 'package:nutrikart/models/nutrition_model.dart';

class NutritionFactsCard extends StatelessWidget {
  final NutritionData data;

  const NutritionFactsCard({super.key, required this.data});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.grey.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Calories Section
          _buildCalorieSection(context),
          const Divider(height: 30),

          // Macronutrients Section
          _buildMacronutrientSection(),
          const Divider(height: 30),

          // Additional Nutrients Section
          _buildNutrientList(title: 'Additional Nutrients', nutrients: data.additionalNutrients),
          const Divider(height: 30),

          // Vitamins & Minerals Section
          _buildNutrientList(title: 'Vitamins & Minerals', nutrients: data.vitaminsAndMinerals, showPercentage: true),
        ],
      ),
    );
  }

  Widget _buildCalorieSection(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Calories',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 4),
        Text(
          data.calorieContext,
          style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
        ),
        const SizedBox(height: 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              decoration: BoxDecoration(
                color: AppColors.primaryGreen.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Text(
                '${data.calories} kcal',
                style: const TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.bold,
                  color: AppColors.primaryGreen,
                ),
              ),
            ),
            // Placeholder for a graphical calorie meter if needed
            Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: AppColors.primaryGreen, width: 2),
              ),
              child: Text('5%', style: TextStyle(color: AppColors.primaryGreen)), // Mock percentage
            )
          ],
        ),
      ],
    );
  }

  Widget _buildMacronutrientSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Macronutrients',
          style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: [
            _buildMacroBar(data.protein, AppColors.primaryGreen, 1.0),
            _buildMacroBar(data.carbs, Colors.blue.shade400, 0.5),
            _buildMacroBar(data.fat, Colors.orange.shade400, 0.7),
          ],
        ),
      ],
    );
  }

  Widget _buildMacroBar(Nutrient nutrient, Color color, double value) {
    return Column(
      children: [
        Stack(
          alignment: Alignment.bottomCenter,
          children: [
            Container(
              width: 50,
              height: 100,
              decoration: BoxDecoration(
                color: Colors.grey.shade200,
                borderRadius: BorderRadius.circular(25),
              ),
            ),
            Container(
              width: 50,
              height: 100 * value, // Visual fill
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(25),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),
        Text(
          '${nutrient.amount.toInt()} ${nutrient.unit}',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
        Text(
          nutrient.name,
          style: TextStyle(fontSize: 12, color: color),
        ),
        const SizedBox(height: 4),
        Text(
          '${nutrient.dailyValuePercentage.toInt()}%',
          style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
        ),
      ],
    );
  }

  Widget _buildNutrientList({
    required String title,
    required List<Nutrient> nutrients,
    bool showPercentage = false,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          title,
          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
        ),
        const SizedBox(height: 12),
        ...nutrients.map((n) {
          return Padding(
            padding: const EdgeInsets.symmetric(vertical: 8.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    Text(
                      n.name,
                      style: const TextStyle(fontWeight: FontWeight.w500),
                    ),
                    const SizedBox(width: 8),
                    if (showPercentage)
                      Text(
                        n.amount == 0 ? '' : n.unit, // Unit is '%' for vitamins
                        style: TextStyle(fontSize: 12, color: AppColors.primaryGreen),
                      ),
                  ],
                ),
                if (!showPercentage)
                  Text(
                    '${n.amount.toInt()} ${n.unit}',
                    style: TextStyle(color: AppColors.textSecondary),
                  ),
                if (showPercentage)
                  ClipRRect(
                    borderRadius: BorderRadius.circular(10),
                    child: SizedBox(
                      width: 100,
                      height: 8,
                      child: LinearProgressIndicator(
                        value: n.dailyValuePercentage / 100,
                        backgroundColor: Colors.grey.shade200,
                        valueColor: AlwaysStoppedAnimation<Color>(AppColors.primaryGreen),
                      ),
                    ),
                  ),
              ],
            ),
          );
        }).toList(),
      ],
    );
  }
}
