import 'package:flutter/material.dart';

class DietPreferenceChip extends StatelessWidget {
  final String label;
  const DietPreferenceChip({super.key, required this.label});

  @override
  Widget build(BuildContext context) {
    return Chip(
      label: Text(label),
      backgroundColor: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: const BorderSide(color: Colors.green),
      ),
      labelStyle: const TextStyle(color: Colors.green),
    );
  }
}
