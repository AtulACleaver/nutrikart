import 'package:flutter/material.dart';
import 'package:nutrikart/core/theme/app_colors.dart';

class InsightAnalysisTab extends StatelessWidget {
  const InsightAnalysisTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildInsightCard(
            'Blood Sugar Alert',
            'High glycemic load: This product has a high sugar content which could rapidly spike blood glucose levels. Use sparingly, especially if managing diabetes.',
            Colors.red.shade700,
            Icons.warning_amber_rounded,
          ),
          _buildInsightCard(
            'Hypertension Impact',
            'Low Sodium: Good choice! The low sodium content supports blood pressure management.',
            AppColors.primaryGreen,
            Icons.check_circle_outline,
          ),
          _buildInsightCard(
            'PCOS Management',
            'Good Protein Source: The high protein content can help with satiety and hormonal balance.',
            Colors.blue.shade700,
            Icons.favorite_border,
          ),
        ],
      ),
    );
  }

  Widget _buildInsightCard(String title, String description, Color color, IconData icon) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
        border: Border(left: BorderSide(color: color, width: 4)),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                    color: color,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: TextStyle(color: AppColors.textPrimary),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
