import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:nutrikart/core/theme/app_colors.dart';

// Defines the items for the bottom navigation bar
class NavItem {
  final String label;
  final IconData icon;
  final String path;

  NavItem({required this.label, required this.icon, required this.path});
}

// List of all navigation items matching the design: Home, Category, Scan, Grocery, Meals
final List<NavItem> navItems = [
  NavItem(label: 'Home', icon: Icons.home, path: '/home'),
  NavItem(label: 'Category', icon: Icons.category, path: '/category'),
  NavItem(label: 'Scan', icon: Icons.qr_code_scanner, path: '/scanner'),
  NavItem(label: 'Grocery', icon: Icons.shopping_cart, path: '/cart'),
  NavItem(label: 'Meals', icon: Icons.menu_book, path: '/meals'),
];

class BottomNavBar extends StatelessWidget {
  final String currentPath;

  const BottomNavBar({super.key, required this.currentPath});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, -5),
          ),
        ],
      ),
      child: BottomAppBar(
        color: Colors.transparent,
        elevation: 0,
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceAround,
          children: navItems.map((item) {
            final isSelected = currentPath == item.path;
            
            return Expanded(
              child: InkWell(
                onTap: () {
                  // Use go_router for navigation
                  GoRouter.of(context).go(item.path);
                  // or the shorter helper:
                  // context.go(item.path);
                },
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8.0),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        isSelected ? item.icon : item.icon, // For outlined icons, you'd use Icons.icon_outlined
                        color: isSelected ? AppColors.primaryGreen : Colors.grey.shade600,
                        size: 24,
                      ),
                      const SizedBox(height: 4),
                      Text(
                        item.label,
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                          color: isSelected ? AppColors.primaryGreen : Colors.grey.shade600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }
}
