import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nutrikart/core/theme/app_colors.dart';
import 'package:nutrikart/providers/meal_plan_provider.dart'; // Assume AppColors.primaryGreen is available

class MealDayTabs extends ConsumerWidget {
  final List<DateTime> dates;

  const MealDayTabs({super.key, required this.dates});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final selectedDate = ref.watch(mealPlanProvider).selectedDate;
    final notifier = ref.read(mealPlanProvider.notifier);
    
    // DateUtils.dateOnly is used for safe comparison
    final today = DateUtils.dateOnly(DateTime.now());

    return Container(
      height: 70, // Fixed height for the tabs container
      margin: const EdgeInsets.symmetric(vertical: 8.0),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: dates.length,
        itemBuilder: (context, index) {
          final date = dates[index];
          final isSelected = DateUtils.dateOnly(date) == DateUtils.dateOnly(selectedDate);
          final isToday = DateUtils.dateOnly(date) == today;

          return GestureDetector(
            onTap: () => notifier.selectDate(date),
            child: Container(
              width: 50,
              margin: EdgeInsets.only(left: index == 0 ? 16 : 8),
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primaryGreen : Colors.grey.shade100,
                borderRadius: BorderRadius.circular(12),
                border: isSelected 
                    ? Border.all(color: AppColors.primaryGreen, width: 2)
                    : isToday ? Border.all(color: Colors.pink, width: 2) : null,
              ),
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(
                    date.day.toString(),
                    style: TextStyle(
                      color: isSelected ? Colors.white : Colors.black,
                      fontWeight: FontWeight.bold,
                      fontSize: 18,
                    ),
                  ),
                  Text(
                    isToday ? 'Today' : _getDayOfWeekAbbreviation(date.weekday),
                    style: TextStyle(
                      color: isSelected ? Colors.white70 : Colors.grey.shade600,
                      fontSize: 10,
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  String _getDayOfWeekAbbreviation(int weekday) {
    switch (weekday) {
      case 1: return 'Mon';
      case 2: return 'Tue';
      case 3: return 'Wed';
      case 4: return 'Thu';
      case 5: return 'Fri';
      case 6: return 'Sat';
      case 7: return 'Sun';
      default: return '';
    }
  }
}
