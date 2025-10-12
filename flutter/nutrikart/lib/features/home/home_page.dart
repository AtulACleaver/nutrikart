import 'package:flutter/material.dart';
import 'package:nutrikart/core/widgets/category_card.dart';
import 'package:nutrikart/core/widgets/diet_preference_chip.dart';
import 'package:nutrikart/core/widgets/product_card.dart';
import 'package:nutrikart/core/widgets/bottom_nav_bar.dart';

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: Colors.grey[50],
      bottomNavigationBar: const BottomNavBar(currentIndex: 0, currentPath: '/home'),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 👋 Greeting Header
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text("Hey Aqifa 👋",
                            style: theme.textTheme.headlineSmall?.copyWith(
                              fontWeight: FontWeight.bold,
                            )),
                        const SizedBox(height: 4),
                        Text("Time to make good decisions",
                            style: theme.textTheme.bodyMedium?.copyWith(
                              color: Colors.grey[600],
                            )),
                      ],
                    ),
                  ),
                  const CircleAvatar(
                    radius: 22,
                    backgroundImage:
                        AssetImage('assets/images/profile_placeholder.png'),
                  ),
                ],
              ),

              const SizedBox(height: 20),

              // 🔍 Search Bar
              TextField(
                decoration: InputDecoration(
                  hintText: "Search for groceries...",
                  prefixIcon: const Icon(Icons.search),
                  filled: true,
                  fillColor: Colors.white,
                  contentPadding:
                      const EdgeInsets.symmetric(vertical: 0, horizontal: 16),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(14),
                    borderSide: BorderSide.none,
                  ),
                ),
              ),

              const SizedBox(height: 24),

              // 🍞 Top Categories
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text("Top Categories",
                      style: theme.textTheme.titleMedium
                          ?.copyWith(fontWeight: FontWeight.w600)),
                  TextButton(onPressed: () {}, child: const Text("View All")),
                ],
              ),
              const SizedBox(height: 8),
              SizedBox(
                height: 110,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: [
                    CategoryCard(title: "Biscuits", image: "assets/images/biscuits.jpeg"),
                    CategoryCard(title: "Breakfast & Spreads", image: "assets/images/breakfast.jpeg"),
                    CategoryCard(title: "Cold Drinks", image: "assets/images/cold_drink.jpeg"),
                    CategoryCard(title: "Chocolates", image: "assets/images/chocolates.jpeg"),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // 💊 Dietary Preferences
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text("Dietary Preference",
                      style: theme.textTheme.titleMedium
                          ?.copyWith(fontWeight: FontWeight.w600)),
                  TextButton(onPressed: () {}, child: const Text("View All")),
                ],
              ),
              const SizedBox(height: 8),
              Wrap(
                spacing: 8,
                children: const [
                  DietPreferenceChip(label: "Diabetes"),
                  DietPreferenceChip(label: "Hypertension"),
                  DietPreferenceChip(label: "PCOS"),
                ],
              ),

              const SizedBox(height: 24),

              // ☕ Recently Viewed Products
              Text("Recommended for You",
                  style: theme.textTheme.titleMedium
                      ?.copyWith(fontWeight: FontWeight.w600)),
              const SizedBox(height: 8),
              SizedBox(
                height: 210,
                child: ListView(
                  scrollDirection: Axis.horizontal,
                  children: [
                    ProductCard(
                      title: "Espresso",
                      price: 220,
                      image: "assets/images/espresso.jpeg",
                      rating: 4.5,
                    ),
                    ProductCard(
                      title: "White Bread",
                      price: 130,
                      image: "assets/images/white_bread.jpeg",
                      rating: 4.2,
                    ),
                    ProductCard(
                      title: "Peanut Butter",
                      price: 260,
                      image: "assets/images/peanut_butter.jpeg",
                      rating: 4.8,
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class BottomNavBar extends StatelessWidget {
  final String currentPath;
  final int currentIndex;
  const BottomNavBar({Key? key, required this.currentIndex, required this.currentPath}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // TODO: Implement BottomNavBar UI
    return SizedBox.shrink();
  }
}
