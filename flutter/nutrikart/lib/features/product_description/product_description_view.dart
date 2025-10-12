import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nutrikart/core/theme/app_colors.dart';
import 'package:nutrikart/models/product_model.dart'; // Product Model
// ignore: unused_import
import 'package:nutrikart/core/widgets/custom_app_bar.dart';
import 'package:nutrikart/features/product_description/widgets/nutrition_facts_card.dart';
import 'package:nutrikart/features/product_description/widgets/insight_analysis_tab.dart';
import 'package:nutrikart/services/api_service.dart';
import 'package:go_router/go_router.dart';

// Provider for loading product data
final productProvider = FutureProvider.family<Product, String>((ref, productId) async {
  return await apiService.getProduct(productId);
});

// Provider for health score (scan data)
final productHealthProvider = FutureProvider.family<ScannedProduct?, String>((ref, productId) async {
  try {
    return await apiService.scanProduct(productId);
  } catch (e) {
    // If scan fails, return null (we still have basic product data)
    return null;
  }
});

class ProductDescriptionView extends ConsumerStatefulWidget {
  final String productId;

  const ProductDescriptionView({super.key, required this.productId});

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
    final productAsync = ref.watch(productProvider(widget.productId));
    final healthAsync = ref.watch(productHealthProvider(widget.productId));
    
    return Scaffold(
      appBar: CustomAppBar(
        title: '',
        leadingIcon: Icons.arrow_back,
        actions: [
          // Health score circle - show when available
          healthAsync.when(
            data: (scannedProduct) => scannedProduct != null ? Padding(
              padding: const EdgeInsets.only(right: 16.0),
              child: Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: AppColors.primaryGreen,
                  shape: BoxShape.circle,
                ),
                child: Center(
                  child: Text(
                    '${scannedProduct.score}',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                  ),
                ),
              ),
            ) : const SizedBox.shrink(),
            loading: () => const Padding(
              padding: EdgeInsets.only(right: 16.0),
              child: SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(strokeWidth: 2),
              ),
            ),
            error: (_, __) => const SizedBox.shrink(),
          ),
        ],
      ),
      
      // Use Stack to place the 'Add to Cart' button stickily at the bottom
      body: productAsync.when(
        data: (product) {
          final productModel = product.toProductModel();
          return Stack(
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
                          // Product Image
                          Center(
                            child: Container(
                              height: 150,
                              width: 150,
                              decoration: BoxDecoration(
                                color: Colors.grey.shade100,
                                borderRadius: BorderRadius.circular(16),
                              ),
                              child: product.imageUrl != null 
                                ? ClipRRect(
                                    borderRadius: BorderRadius.circular(16),
                                    child: Image.network(
                                      product.imageUrl!,
                                      fit: BoxFit.cover,
                                      errorBuilder: (context, error, stackTrace) {
                                        return Icon(Icons.fastfood, size: 60, color: Colors.grey.shade400);
                                      },
                                    ),
                                  )
                                : Icon(Icons.fastfood, size: 60, color: Colors.grey.shade400),
                            ),
                          ),
                          const SizedBox(height: 16),
                          Text(
                            product.productName,
                            style: const TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
                          ),
                          if (product.brands.isNotEmpty)
                            Text(
                              product.brands,
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
                            NutritionFactsCard(data: productModel.nutritionData),
                            healthAsync.when(
                              data: (scannedProduct) => InsightAnalysisTab(
                                product: scannedProduct ?? ScannedProduct(
                                  id: product.id,
                                  code: product.code,
                                  productName: product.productName,
                                  brands: product.brands,
                                  imageUrl: product.imageUrl,
                                  imageSmallUrl: product.imageSmallUrl,
                                  ingredientsText: product.ingredientsText,
                                  nutriments: product.nutriments,
                                  nutriScore: product.nutriScore,
                                  score: 50, // Default score
                                  reasons: ['No health analysis available'],
                                ),
                              ),
                              loading: () => const Center(child: CircularProgressIndicator()),
                              error: (error, stack) => Center(
                                child: Text('Error loading health data: ${error.toString()}'),
                              ),
                            ),
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
                        SnackBar(content: Text('${product.productName} added to cart!')),
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
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, stack) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error, size: 64, color: Colors.red),
              const SizedBox(height: 16),
              Text('Error loading product: ${error.toString()}'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () => context.pop(),
                child: const Text('Go Back'),
              ),
            ],
          ),
        ),
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
