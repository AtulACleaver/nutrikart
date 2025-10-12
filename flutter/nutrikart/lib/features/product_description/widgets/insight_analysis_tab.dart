import 'package:flutter/material.dart';
import 'package:nutrikart/core/theme/app_colors.dart';
import 'package:nutrikart/services/api_service.dart';

class InsightAnalysisTab extends StatelessWidget {
  final ScannedProduct product;
  
  const InsightAnalysisTab({super.key, required this.product});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(top: 16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Health Score Display
          Container(
            margin: const EdgeInsets.only(bottom: 16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: _getScoreColor(product.score).withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: _getScoreColor(product.score)),
            ),
            child: Row(
              children: [
                Container(
                  width: 60,
                  height: 60,
                  decoration: BoxDecoration(
                    color: _getScoreColor(product.score),
                    shape: BoxShape.circle,
                  ),
                  child: Center(
                    child: Text(
                      '${product.score}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 24,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Health Score',
                        style: TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: _getScoreColor(product.score),
                        ),
                      ),
                      Text(
                        _getScoreDescription(product.score),
                        style: const TextStyle(color: Colors.grey),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          
          // Health Analysis Reasons
          ...product.reasons.map((reason) => _buildInsightCard(
            _getInsightTitle(reason),
            reason,
            _getInsightColor(reason),
            _getInsightIcon(reason),
          )),
          
          // Ingredients Analysis
          if (product.ingredientsText.isNotEmpty) ..[
            const SizedBox(height: 16),
            _buildIngredientsCard(),
          ],
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
  
  Widget _buildIngredientsCard() {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey.shade50,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade300),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(Icons.list_alt, color: Colors.grey.shade600),
              const SizedBox(width: 8),
              Text(
                'Ingredients',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: Colors.grey.shade800,
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            product.ingredientsText,
            style: TextStyle(color: AppColors.textPrimary),
          ),
        ],
      ),
    );
  }
  
  Color _getScoreColor(int score) {
    if (score >= 80) return AppColors.primaryGreen;
    if (score >= 60) return Colors.orange;
    return Colors.red;
  }
  
  String _getScoreDescription(int score) {
    if (score >= 90) return 'Excellent choice for your health';
    if (score >= 80) return 'Good choice with minor concerns';
    if (score >= 70) return 'Fair choice, moderate health impact';
    if (score >= 60) return 'Consider healthier alternatives';
    return 'Poor choice, avoid or limit consumption';
  }
  
  String _getInsightTitle(String reason) {
    if (reason.toLowerCase().contains('sugar') || reason.toLowerCase().contains('sweet')) {
      return 'Blood Sugar Alert';
    }
    if (reason.toLowerCase().contains('sodium') || reason.toLowerCase().contains('salt')) {
      return 'Sodium Content';
    }
    if (reason.toLowerCase().contains('fiber')) {
      return 'Fiber Content';
    }
    if (reason.toLowerCase().contains('protein')) {
      return 'Protein Analysis';
    }
    if (reason.toLowerCase().contains('fat') || reason.toLowerCase().contains('saturated')) {
      return 'Fat Content';
    }
    return 'Health Insight';
  }
  
  Color _getInsightColor(String reason) {
    final lowerReason = reason.toLowerCase();
    if (lowerReason.contains('high') && (lowerReason.contains('sugar') || lowerReason.contains('sodium') || lowerReason.contains('fat'))) {
      return Colors.red;
    }
    if (lowerReason.contains('good') || lowerReason.contains('low sodium') || lowerReason.contains('high fiber') || lowerReason.contains('high protein')) {
      return AppColors.primaryGreen;
    }
    return Colors.orange;
  }
  
  IconData _getInsightIcon(String reason) {
    final lowerReason = reason.toLowerCase();
    if (lowerReason.contains('sugar')) {
      return Icons.warning_amber_rounded;
    }
    if (lowerReason.contains('sodium') || lowerReason.contains('salt')) {
      return lowerReason.contains('low') ? Icons.check_circle_outline : Icons.warning;
    }
    if (lowerReason.contains('fiber')) {
      return Icons.eco;
    }
    if (lowerReason.contains('protein')) {
      return Icons.fitness_center;
    }
    if (lowerReason.contains('good') || lowerReason.contains('excellent')) {
      return Icons.check_circle_outline;
    }
    return Icons.info_outline;
  }
}
