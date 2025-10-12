import 'package:flutter/material.dart';
import 'package:nutrikart/core/theme/app_colors.dart';

enum ScanMode { barcode, aiVision }

class ScanModeToggle extends StatelessWidget {
  final ScanMode currentMode;
  final ValueChanged<ScanMode> onModeChanged;

  const ScanModeToggle({
    super.key,
    required this.currentMode,
    required this.onModeChanged,
  });

  @override
  Widget build(BuildContext context) {
    // Style configuration for the segmented control
    final isBarcodeSelected = currentMode == ScanMode.barcode;
    
    return Container(
      decoration: BoxDecoration(
        color: Colors.grey.shade800,
        borderRadius: BorderRadius.circular(10),
      ),
      padding: const EdgeInsets.all(4),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          _buildToggleItem(
            context,
            mode: ScanMode.barcode,
            icon: Icons.qr_code_2,
            label: 'Barcode',
            isSelected: isBarcodeSelected,
          ),
          _buildToggleItem(
            context,
            mode: ScanMode.aiVision,
            icon: Icons.visibility,
            label: 'AI Vision',
            isSelected: !isBarcodeSelected,
          ),
        ],
      ),
    );
  }

  Widget _buildToggleItem(
    BuildContext context, {
    required ScanMode mode,
    required IconData icon,
    required String label,
    required bool isSelected,
  }) {
    return GestureDetector(
      onTap: () => onModeChanged(mode),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primaryGreen : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            Icon(icon, size: 18, color: isSelected ? Colors.white : Colors.grey.shade400),
            const SizedBox(width: 6),
            Text(
              label,
              style: TextStyle(
                color: isSelected ? Colors.white : Colors.grey.shade400,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
