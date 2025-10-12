import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nutrikart/core/theme/app_colors.dart';
import 'package:nutrikart/models/product_model.dart'; // Product Model
// ignore: unused_import
import 'package:nutrikart/core/widgets/custom_app_bar.dart';
import 'package:nutrikart/features/product_description/widgets/nutrition_facts_card.dart';
import 'package:nutrikart/features/product_description/widgets/insight_analysis_tab.dart';

// Note: In a real app, this view would take a ProductModel as an argument
class ProductDescriptionView extends ConsumerStatefulWidget {
  final ProductModel product;

  const ProductDescriptionView({super.key, this.product = ProductModel.mockEspresso});

  @override
  ConsumerState<ProductDescriptionView> createState() => _ProductDescriptionViewState();
}

class _ProductDescriptionViewState extends ConsumerState<ProductDescriptionView> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: CustomAppBar(
        title: '',
        leadingIcon: Icons.arrow_back,
        // The design shows a green circle with '92' health score in the top right
        actions: [
          Padding(
            padding: const EdgeInsets.only(right: 16.0),
            child: Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(
                color: AppColors.primaryGreen,
                shape: BoxShape.circle,
              ),
              child: const Center(
                child: Text(
                  '92', // Mock Health Score
                  style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                ),
              ),
            ),
          ),
        ],
      ),
      
      // Use Stack to place the 'Add to Cart' button stickily at the bottom
      body: Stack(
        children: [
          // Scrollable content
          SingleChildScrollView(
            padding: const EdgeInsets.only(bottom: 80.0), // Padding for the fixed button
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Product Image and Name Section
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Image Placeholder
                      Center(
                        child: Container(
                          height: 150,
                          width: 150,
                          decoration: BoxDecoration(
                            color: Colors.grey.shade100,
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Center(
                            child: Icon(Icons.fastfood, size: 60, color: Colors.grey.shade400),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        widget.product.name,
                        style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                      ),
                      Text(
                        widget.product.description,
                        style: TextStyle(fontSize: 16, color: AppColors.textSecondary),
                      ),
                      const SizedBox(height: 24),
                    ],
                  ),
                ),

                // Tabs (Nutrition Facts / Insights & Analysis)
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16.0),
                  child: TabBar(
                    controller: _tabController,
                    labelColor: AppColors.primaryGreen,
                    unselectedLabelColor: AppColors.textSecondary,
                    indicatorColor: AppColors.primaryGreen,
                    indicatorWeight: 3.0,
                    tabs: const [
                      Tab(text: 'Nutrition Facts'),
                      Tab(text: 'Insights & Analysis'),
                    ],
                  ),
                ),

                // Tab Content
                SizedBox(
                  height: MediaQuery.of(context).size.height, // Arbitrarily large height
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: TabBarView(
                      controller: _tabController,
                      physics: const NeverScrollableScrollPhysics(), // Managed by parent SingleChildScrollView
                      children: [
                        NutritionFactsCard(data: widget.product.nutritionData),
                        const InsightAnalysisTab(),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Sticky "Add to Cart" Button at the bottom
          Positioned(
            bottom: 0,
            left: 0,
            right: 0,
            child: Container(
              padding: const EdgeInsets.all(16.0),
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
              child: ElevatedButton(
                onPressed: () {
                  // TODO: Add to Cart logic (e.g., using Riverpod)
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text('${widget.product.name} added to cart!')),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryGreen,
                  foregroundColor: Colors.white,
                  minimumSize: const Size(double.infinity, 56),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: const Text(
                  'Add to Cart',
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),
              ),
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
  final List<Widget>? actions;

  const CustomAppBar({
    Key? key,
    required this.title,
    required this.leadingIcon,
    this.actions,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      title: Text(title),
      leading: Icon(leadingIcon),
      actions: actions,
      backgroundColor: Colors.white,
      elevation: 0,
    );
  }

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);
}
