import 'package:flutter/material.dart';
// ignore: unused_import
import 'package:lucide_icons/lucide_icons.dart';

import '../../../core/widgets/custom_bottom_nav.dart';
import '../../../core/widgets/search_bar_widget.dart';
import '../widgets/category_tile.dart';
import '../../../models/category_model.dart';

class CategoryPage extends StatefulWidget {
  const CategoryPage({super.key});

  @override
  State<CategoryPage> createState() => _CategoryPageState();
}

class _CategoryPageState extends State<CategoryPage> {
  final TextEditingController _searchController = TextEditingController();

  // Mock category data
  final List<CategoryModel> categories = [
    CategoryModel('Breakfast & Spreads', 'assets/images/breakfast.png'),
    CategoryModel('Biscuits', 'assets/images/biscuits.png'),
    CategoryModel('Chocolates', 'assets/images/chocolates.png'),
    CategoryModel('Cold Drinks & Juices', 'assets/images/juices.png'),
    CategoryModel('Snacks', 'assets/images/snacks.png'),
    CategoryModel('Cereals', 'assets/images/cereals.png'),
    CategoryModel('Health Drinks', 'assets/images/health_drinks.png'),
    CategoryModel('Dairy', 'assets/images/dairy.png'),
  ];

  @override
  Widget build(BuildContext context) {
    // ignore: unused_local_variable
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        toolbarHeight: 0, // hides top bar shadow
        backgroundColor: Colors.green.shade700,
        elevation: 0,
      ),
      body: SafeArea(
        child: Column(
          children: [
            // Top Search Bar
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: SearchBarWidget(
                controller: _searchController,
                hintText: 'Search for groceries...',
                backgroundColor: Colors.green.shade100,
              ),
            ),

            // Category Grid
            Expanded(
              child: Container(
                color: Colors.white,
                padding: const EdgeInsets.symmetric(horizontal: 12),
                child: GridView.builder(
                  physics: const BouncingScrollPhysics(),
                  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                    crossAxisCount: 2,
                    crossAxisSpacing: 14,
                    mainAxisSpacing: 14,
                    childAspectRatio: 1,
                  ),
                  itemCount: categories.length,
                  itemBuilder: (context, index) {
                    final category = categories[index];
                    return CategoryTile(
                      title: category.name,
                      imagePath: category.imagePath,
                      onTap: () {
                        Navigator.pushNamed(context, '/category_detail',
                            arguments: category);
                      },
                    );
                  },
                ),
              ),
            ),
          ],
        ),
      ),

      // Bottom Navigation
      bottomNavigationBar: const CustomBottomNav(currentIndex: 1),
    );
  }
}
