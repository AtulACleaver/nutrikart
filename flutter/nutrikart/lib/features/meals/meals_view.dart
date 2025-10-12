import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nutrikart/features/meals/widgets/meal_card.dart';
import 'package:nutrikart/features/meals/widgets/meal_day_tabs.dart';
import 'package:nutrikart/providers/meal_plan_provider.dart'; // Assume colors are defined

class MealsView extends ConsumerWidget {
  const MealsView({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final mealPlanState = ref.watch(mealPlanProvider);
    final dailyPlan = ref.watch(currentDailyPlanProvider);

    // Extract all unique dates from the plan for the horizontal tabs
    final dates = mealPlanState.plan.dailyPlans.map((p) => p.date).toList();
    // Sort dates to ensure proper display
    dates.sort((a, b) => a.compareTo(b));

    return Scaffold(
      appBar: const CustomAppBar(
        title: 'Your Meal Plan',
        leadingIcon: Icons.arrow_back,
        actions: [
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 4),
            child: IconButton(
              icon: Icon(Icons.search),
              onPressed: null, // replace with a callback
            ),
          ),
          Padding(
            padding: EdgeInsets.symmetric(horizontal: 4),
            child: IconButton(
              icon: Icon(Icons.more_vert),
              onPressed: null,
            ),
          ),
        ],
      ),
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Meal Plan Header and Diet
          Padding(
            padding: const EdgeInsets.only(left: 16.0, right: 16.0, top: 16.0),
            child: Text(
              'YOUR MEAL PLAN',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.w900,
                color: Colors.grey.shade800,
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 4.0),
            child: Text(
              'Personalization for your ${mealPlanState.plan.userDiet}',
              style: TextStyle(
                fontSize: 14,
                color: Colors.grey.shade600,
              ),
            ),
          ),
          
          // Date Selection Tabs
          MealDayTabs(dates: dates),

          // Meal List
          Expanded(
            child: dailyPlan == null || dailyPlan.meals.isEmpty
                ? Center(
                    child: Text(
                      'No meal plan available for this date.',
                      style: TextStyle(color: Colors.grey.shade500),
                    ),
                  )
                : ListView.builder(
                    padding: const EdgeInsets.all(16.0),
                    itemCount: dailyPlan.meals.length,
                    itemBuilder: (context, index) {
                      final meal = dailyPlan.meals[index];
                      return MealCard(meal: meal);
                    },
                  ),
          ),
        ],
      ),
      // The bottom navigation bar is typically outside of the feature view
      // but should be included if this is the root of the screen.
      // For this implementation, we assume it's handled by the parent widget/router.
    );
  }
}

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final IconData leadingIcon;
  final List<Widget>? actions;

  // ignore: use_super_parameters
  const CustomAppBar({
    Key? key,
    required this.title,
    required this.leadingIcon,
    this.actions,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: Text(title),
      leading: Icon(leadingIcon),
      actions: actions,
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
