import 'package:flutter/material.dart';
import 'package:nutrikart/core/theme/app_colors.dart'; // Assume this file exists

class BudgetTrackerProgress extends StatelessWidget {
  final double current;
  final double max;

  const BudgetTrackerProgress({super.key, required this.current, required this.max});

  @override
  Widget build(BuildContext context) {
    final percentage = current / max;
    final progressColor = percentage > 1.0 ? Colors.red : AppColors.primaryGreen;
    // ignore: unused_local_variable
    final remaining = max - current;

    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Budget Tracker', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(
            '${current.toInt()}/${max.toInt()}',
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: progressColor,
            ),
          ),
          const SizedBox(height: 8),
          ClipRRect(
            borderRadius: BorderRadius.circular(10),
            child: LinearProgressIndicator(
              value: percentage.clamp(0.0, 1.0), // Cap at 100% for visual
              backgroundColor: Colors.grey.shade200,
              valueColor: AlwaysStoppedAnimation<Color>(progressColor),
              minHeight: 10,
            ),
          ),
          const SizedBox(height: 12),
          TextButton(
            onPressed: () {
              // Show Update Budget Dialog
              showDialog(
                context: context,
                builder: (context) => const UpdateBudgetDialog(),
              );
            },
            style: TextButton.styleFrom(
              padding: EdgeInsets.zero,
              minimumSize: Size.zero,
              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
            ),
            child: const Text(
              'Update Budget',
              style: TextStyle(
                color: AppColors.primaryGreen,
                fontWeight: FontWeight.bold,
                decoration: TextDecoration.underline,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class UpdateBudgetDialog extends StatelessWidget {
  const UpdateBudgetDialog({super.key});

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Update Budget'),
      content: const Text('Implement your budget update UI here.'),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Close'),
        ),
      ],
    );
  }
}