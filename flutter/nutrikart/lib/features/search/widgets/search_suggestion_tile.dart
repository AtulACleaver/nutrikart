import 'package:flutter/material.dart';
import 'package:nutrikart/core/theme/app_colors.dart';

class SearchSuggestionTile extends StatelessWidget {
  final String title;
  final VoidCallback onTap;

  const SearchSuggestionTile({
    super.key,
    required this.title,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      contentPadding: EdgeInsets.zero,
      title: Text(
        title,
        style: const TextStyle(
          fontSize: 16,
          color: Colors.black87,
          fontWeight: FontWeight.w500,
        ),
      ),
      trailing: const Icon(
        Icons.arrow_outward_rounded,
        color: AppColors.primaryGreen,
        size: 20,
      ),
      onTap: onTap,
    );
  }
}
