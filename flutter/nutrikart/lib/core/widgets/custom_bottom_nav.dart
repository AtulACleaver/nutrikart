import 'package:flutter/material.dart';
import 'package:lucide_icons/lucide_icons.dart';

class CustomBottomNav extends StatelessWidget {
  final int currentIndex;

  const CustomBottomNav({super.key, required this.currentIndex});

  @override
  Widget build(BuildContext context) {
    return BottomNavigationBar(
      type: BottomNavigationBarType.fixed,
      currentIndex: currentIndex,
      selectedItemColor: Colors.green.shade700,
      unselectedItemColor: Colors.grey.shade500,
      onTap: (index) {
        // Replace with actual route navigation
        switch (index) {
          case 0:
            Navigator.pushReplacementNamed(context, '/home');
            break;
          case 1:
            Navigator.pushReplacementNamed(context, '/category');
            break;
          case 2:
            Navigator.pushReplacementNamed(context, '/scan');
            break;
          case 3:
            Navigator.pushReplacementNamed(context, '/grocery');
            break;
          case 4:
            Navigator.pushReplacementNamed(context, '/meals');
            break;
        }
      },
      items: const [
        BottomNavigationBarItem(icon: Icon(LucideIcons.home), label: 'Home'),
        BottomNavigationBarItem(icon: Icon(LucideIcons.grid), label: 'Category'),
        BottomNavigationBarItem(icon: Icon(LucideIcons.scanLine), label: 'Scan'),
        BottomNavigationBarItem(icon: Icon(LucideIcons.shoppingCart), label: 'Grocery'),
        BottomNavigationBarItem(icon: Icon(LucideIcons.utensilsCrossed), label: 'Meals'),
      ],
    );
  }
}
