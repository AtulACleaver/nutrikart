import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nutrikart/core/theme/app_colors.dart';
import 'package:nutrikart/core/widgets/custom_app_bar.dart'; // Global Component
import 'package:nutrikart/features/scanner/widgets/scan_mode_toggle.dart';
import 'package:nutrikart/features/scanner/widgets/camera_preview_area.dart';

// Riverpod state provider for the ScanMode
final scanModeProvider = StateProvider<ScanMode>((ref) => ScanMode.barcode);

class ScannerView extends ConsumerWidget {
  const ScannerView({super.key});

  // Placeholder function for handling the scan action
  void _handleScan(BuildContext context, ScanMode mode) {
    final modeName = mode == ScanMode.barcode ? 'Barcode/QR' : 'AI Vision';
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Starting scan in $modeName mode...'),
        backgroundColor: AppColors.primaryGreen,
      ),
    );
    // In a real app:
    // 1. If Barcode, call a native barcode scanner library.
    // 2. If AI Vision, capture a frame and send it to the API service.
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currentMode = ref.watch(scanModeProvider);

    return Scaffold(
      backgroundColor: Colors.black, // Dark background matching the design
      appBar: CustomAppBar(
        title: 'Scanner',
        leadingIcon: Icons.arrow_back,
        backgroundColor: Colors.black,
        foregroundColor: Colors.white,
        actions: const [], // <- satisfies the required parameter
      ),
      body: Column(
        children: [
          // 1. Scan Mode Toggle (Top center)
          Padding(
            padding: const EdgeInsets.only(top: 16.0, bottom: 8.0),
            child: ScanModeToggle(
              currentMode: currentMode,
              onModeChanged: (newMode) {
                ref.read(scanModeProvider.notifier).state = newMode;
              },
            ),
          ),
          
          // 2. Camera Preview Area (Takes up most of the remaining space)
          Expanded(
            child: CameraPreviewArea(
              mode: currentMode,
              onScanPressed: () => _handleScan(context, currentMode),
            ),
          ),
        ],
      ),
    );
  }
}

class CustomAppBar extends StatelessWidget implements PreferredSizeWidget {
  final String title;
  final IconData leadingIcon;
  final Color backgroundColor;
  final Color foregroundColor;
  final List<Widget> actions;

  const CustomAppBar({
    Key? key,
    required this.title,
    required this.leadingIcon,
    required this.backgroundColor,
    required this.foregroundColor,
    required this.actions,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: Text(
        title,
        style: TextStyle(color: foregroundColor),
      ),
      leading: IconButton(
        icon: Icon(leadingIcon, color: foregroundColor),
        onPressed: () => Navigator.of(context).pop(),
      ),
      backgroundColor: backgroundColor,
      actions: actions,
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
