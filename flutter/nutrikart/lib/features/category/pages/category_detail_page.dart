import 'package:flutter/material.dart';
import '../models/product_model.dart';
import '../widgets/product_card.dart';
import '../widgets/health_score_bar.dart';
import '../widgets/sort_filter_dropdown.dart';

class CategoryDetailPage extends StatefulWidget {
  final String categoryName;

  const CategoryDetailPage({super.key, required this.categoryName});

  @override
  State<CategoryDetailPage> createState() => _CategoryDetailPageState();
}

class _CategoryDetailPageState extends State<CategoryDetailPage> {
  double overallHealthScore = 55;
  List<ProductModel> products = [
    ProductModel(
      name: 'Breakfast Biscuits',
      imageUrl: 'https://via.placeholder.com/150',
      price: 120.0,
      healthScore: 80,
    ),
    ProductModel(
      name: 'Chocolate Spread',
      imageUrl: 'https://via.placeholder.com/150',
      price: 230.0,
      healthScore: 60,
    ),
    ProductModel(
      name: 'Granola Bar',
      imageUrl: 'https://via.placeholder.com/150',
      price: 99.0,
      healthScore: 75,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.categoryName),
        elevation: 0,
      ),
      body: Column(
        children: [
          // Search bar
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search for groceries...',
                prefixIcon: const Icon(Icons.search),
                filled: true,
                fillColor: Colors.grey.shade100,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),

          // Health score and sort/filter
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 12.0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(child: HealthScoreBar(score: overallHealthScore)),
                const SizedBox(width: 10),
                SortFilterDropdown(onChanged: (val) {
                  // Add sorting/filter logic here
                }),
              ],
            ),
          ),

          const SizedBox(height: 10),

          // Product Grid
          Expanded(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              child: GridView.builder(
                itemCount: products.length,
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  mainAxisExtent: 230,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                ),
                itemBuilder: (context, index) {
                  return ProductCard(
                    product: products[index],
                    onTap: () {
                      // Navigate to product detail page
                    },
                  );
                },
              ),
            ),
          ),
        ],
      ),
    );
  }
}
