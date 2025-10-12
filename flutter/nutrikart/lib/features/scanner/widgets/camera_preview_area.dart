import 'package:flutter/material.dart';
import 'package:nutrikart/core/theme/app_colors.dart';
import 'package:nutrikart/features/scanner/widgets/scan_mode_toggle.dart';

class CameraPreviewArea extends StatelessWidget {
  final ScanMode mode;
  final VoidCallback onScanPressed;

  const CameraPreviewArea({
    super.key,
    required this.mode,
    required this.onScanPressed,
  });

  @override
  Widget build(BuildContext context) {
    String instructionText;
    String scanButtonText;

    if (mode == ScanMode.barcode) {
      instructionText = 'Scan a product barcode';
      scanButtonText = 'Scan QR/Barcode';
    } else {
      instructionText = 'Show the ingredients and nutrition label';
      scanButtonText = 'Analyze with AI';
    }

    return Container(
      // The camera area has a dark background like the design
      decoration: const BoxDecoration(
        color: Colors.black,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(20),
          topRight: Radius.circular(20),
        ),
      ),
      child: Column(
        children: [
          // Camera Placeholder Area
          Expanded(
            child: Center(
              child: Stack(
                alignment: Alignment.center,
                children: [
                  // Mock Camera Feed (Dark, placeholder square)
                  Container(
                    width: 300,
                    height: 300,
                    decoration: BoxDecoration(
                      border: Border.all(color: AppColors.primaryGreen, width: 3),
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  
                  // Instruction Text (always visible)
                  Positioned(
                    bottom: 20,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      decoration: BoxDecoration(
                        color: Colors.black54,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        instructionText,
                        style: const TextStyle(color: Colors.white, fontSize: 14),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          
          // Scan Button Area (Bottom of the dark screen)
          Padding(
            padding: const EdgeInsets.only(bottom: 24.0, left: 24, right: 24),
            child: ElevatedButton.icon(
              onPressed: onScanPressed,
              icon: Icon(mode == ScanMode.barcode ? Icons.camera_alt : Icons.scanner, color: Colors.white),
              label: Text(
                scanButtonText,
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              style: ElevatedButton.styleFrom(
                backgroundColor: AppColors.primaryGreen,
                minimumSize: const Size(double.infinity, 56),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
