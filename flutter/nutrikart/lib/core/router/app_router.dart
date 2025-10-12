import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:nutrikart/features/home/home_page.dart';
import 'package:nutrikart/features/category/pages/category_page.dart';
import 'package:nutrikart/features/scanner/scanner_view.dart';
import 'package:nutrikart/features/grocery_cart/grocery_cart_view.dart';
import 'package:nutrikart/features/meals/meals_view.dart';
import 'package:nutrikart/features/search/search_page.dart';
import 'package:nutrikart/features/product_description/product_description_view.dart';
import 'package:nutrikart/repository/screens/splash/splashscreen.dart';
import 'package:nutrikart/core/widgets/main_shell.dart';

final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>();
final GlobalKey<NavigatorState> _shellNavigatorKey = GlobalKey<NavigatorState>();

final appRouter = GoRouter(
  navigatorKey: _rootNavigatorKey,
  initialLocation: '/splash',
  routes: [
    // Splash screen (no bottom nav)
    GoRoute(
      path: '/splash',
      builder: (context, state) => SplashScreen(),
    ),
    
    // Search page (no bottom nav)
    GoRoute(
      path: '/search',
      builder: (context, state) => const SearchPage(),
    ),
    
    // Product detail page (no bottom nav)
    GoRoute(
      path: '/product/:productId',
      builder: (context, state) {
        final productId = state.pathParameters['productId']!;
        return ProductDescriptionView(productId: productId);
      },
    ),
    
    // Main shell with bottom navigation
    ShellRoute(
      navigatorKey: _shellNavigatorKey,
      builder: (context, state, child) {
        return MainShell(child: child);
      },
      routes: [
        // Home tab
        GoRoute(
          path: '/home',
          pageBuilder: (context, state) => NoTransitionPage(
            key: state.pageKey,
            child: const HomePage(),
          ),
        ),
        
        // Category tab
        GoRoute(
          path: '/category',
          pageBuilder: (context, state) => NoTransitionPage(
            key: state.pageKey,
            child: const CategoryPage(),
          ),
          routes: [
            // Category detail page (within category tab)
            GoRoute(
              path: '/detail/:categoryName',
              builder: (context, state) {
                final categoryName = state.pathParameters['categoryName']!;
                return CategoryDetailPage(categoryName: categoryName);
              },
            ),
          ],
        ),
        
        // Scanner tab
        GoRoute(
          path: '/scanner',
          pageBuilder: (context, state) => NoTransitionPage(
            key: state.pageKey,
            child: const ScannerView(),
          ),
        ),
        
        // Grocery cart tab
        GoRoute(
          path: '/cart',
          pageBuilder: (context, state) => NoTransitionPage(
            key: state.pageKey,
            child: const GroceryCartView(),
          ),
        ),
        
        // Meals tab
        GoRoute(
          path: '/meals',
          pageBuilder: (context, state) => NoTransitionPage(
            key: state.pageKey,
            child: const MealsView(),
          ),
        ),
      ],
    ),
  ],
  
  // Redirect logic
  redirect: (context, state) {
    // If we're on the splash screen and want to stay there
    if (state.location == '/splash') {
      return null;
    }
    
    // If we're trying to go to root, redirect to home
    if (state.location == '/') {
      return '/home';
    }
    
    return null;
  },
);

// Placeholder for category detail page
class CategoryDetailPage extends StatelessWidget {
  final String categoryName;
  
  const CategoryDetailPage({super.key, required this.categoryName});
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(categoryName),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              'Category: $categoryName',
              style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            const Text('Products will be listed here'),
          ],
        ),
      ),
    );
  }
}