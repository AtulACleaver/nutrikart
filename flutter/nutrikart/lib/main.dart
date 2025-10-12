import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nutrikart/features/search/search_page.dart';
import 'package:nutrikart/repository/screens/splash/splashscreen.dart';

void main() {
  // Wrap the entire app in ProviderScope to enable Riverpod
  runApp(const ProviderScope(child: MyApp()));
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NutriKart',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
        useMaterial3: false,
      ),

      // 👇 Start with your existing splash screen
      home: SplashScreen(),

      // 👇 Optional: Define routes for easy navigation
      routes: {
        '/search': (context) => const SearchPage(),
      },
    );
  }
}
