import 'package:flutter/material.dart';
import 'package:nutrikart/core/theme/app_colors.dart';

class SecondaryButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final bool isDestructive; // for "Remove" actions
  final bool isOutline; // if it should have a visible border

  const SecondaryButton({
    super.key,
    required this.text,
    required this.onPressed,
    this.isDestructive = false,
    this.isOutline = false,
  });

  @override
  Widget build(BuildContext context) {
    final color = isDestructive ? AppColors.alertRed : AppColors.primaryGreen;
    
    if (isOutline) {
      return OutlinedButton(
        onPressed: onPressed,
        style: OutlinedButton.styleFrom(
          foregroundColor: color,
          side: BorderSide(color: color, width: 2),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
        ),
        child: Text(text),
      );
    }
    
    // Default to a TextButton style (for low-emphasis actions)
    return TextButton(
      onPressed: onPressed,
      style: TextButton.styleFrom(
        foregroundColor: color,
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
        minimumSize: Size.zero,
        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
      ),
      child: Text(
        text,
        style: TextStyle(fontWeight: isDestructive ? FontWeight.bold : FontWeight.w600),
      ),
    );
  }
}
