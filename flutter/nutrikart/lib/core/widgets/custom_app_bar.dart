import 'package:flutter/material.dart';

// Assuming you have a file for main colors
// import 'package:app_name/core/constants/app_colors.dart'; 

class CustomAppBar extends StatelessWidget {
  final String title;
  final IconData? leadingIcon;
  final VoidCallback? onLeadingTap;
  final String? trailingText;
  final List<Widget>? actions;

  // ADDED: optional colors
  final Color? backgroundColor;
  final Color? foregroundColor;

  const CustomAppBar({
    Key? key,
    this.title = '',
    this.leadingIcon,
    this.onLeadingTap,
    this.trailingText,
    this.actions,
    this.backgroundColor,    // added
    this.foregroundColor,    // added
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final bg = backgroundColor ?? Theme.of(context).appBarTheme.backgroundColor ?? Colors.transparent;
    final fg = foregroundColor ?? Theme.of(context).appBarTheme.foregroundColor ?? Theme.of(context).textTheme.titleMedium?.color;

    return SafeArea(
      child: Container(
        height: kToolbarHeight,
        padding: const EdgeInsets.symmetric(horizontal: 12),
        color: bg, // use backgroundColor
        child: Row(
          children: [
            if (leadingIcon != null)
              IconButton(
                icon: Icon(leadingIcon, color: fg),
                onPressed: onLeadingTap ?? () => Navigator.of(context).pop(),
              ),
            Expanded(
              child: Text(
                title,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(color: fg),
              ),
            ),
            if (trailingText != null) Text(trailingText!, style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: fg)),
            if (actions != null) Row(mainAxisSize: MainAxisSize.min, children: actions!),
          ],
        ),
      ),
    );
  }
}