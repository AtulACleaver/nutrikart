import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nutrikart/core/theme/app_colors.dart';
import 'package:nutrikart/core/widgets/custom_app_bar.dart';
import 'package:nutrikart/features/category/models/product_model.dart';
import 'package:nutrikart/features/grocery_cart/widgets/budget_tracker_progress.dart';
import 'package:nutrikart/features/grocery_cart/widgets/cart_product_tile.dart';
import 'package:nutrikart/providers/cart_provider.dart';

// import other necessary widgets like HealthScoreBar...

class GroceryCartView extends ConsumerStatefulWidget {
  const GroceryCartView({super.key});

  @override
  ConsumerState<GroceryCartView> createState() => _GroceryCartViewState();
}

class _GroceryCartViewState extends ConsumerState<GroceryCartView> {
  final PageController _pageController = PageController();

  // Helper widget for the Health Score Bar
  Widget _buildHealthScoreBar(double score) {
    final healthColor = score >= 50 ? AppColors.primaryGreen : Colors.amber;
    return Container(
      height: 60,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey.shade200),
      ),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Health Score', style: TextStyle(fontSize: 12)),
          const SizedBox(height: 4),
          Row(
            children: [
              Expanded(
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(10),
                  child: LinearProgressIndicator(
                    value: score / 100,
                    backgroundColor: Colors.grey.shade200,
                    valueColor: AlwaysStoppedAnimation<Color>(healthColor),
                    minHeight: 10,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Text('${score.toInt()}/100', style: TextStyle(fontWeight: FontWeight.bold, color: healthColor)),
            ],
          ),
        ],
      ),
    );
  }

  // Page 1: Grocery Summary (05 Grocery Cart 2)
  Widget _buildGrocerySummaryPage(CartState state) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHealthScoreBar(state.healthScore),
          const SizedBox(height: 12),
          BudgetTrackerProgress(current: state.currentBudget, max: state.maxBudget),
          const SizedBox(height: 20),
          const Text('Suggest Products', style: TextStyle(fontWeight: FontWeight.bold)),
          TextButton(
            onPressed: () {},
            child: const Text('Select items to get personalized suggestion', style: TextStyle(fontSize: 12)),
          ),
          const SizedBox(height: 10),
          // Suggested Products Carousel (simplified as a list for this example)
          ...state.suggestedItems.map((item) => CartProductTile(item: item)),
          const Divider(height: 30),
          Text(
            '${state.cartItems.length} Items',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
          const SizedBox(height: 10),
          // Cart Product List
          ...state.cartItems.map((item) => CartProductTile(item: item)),
          const SizedBox(height: 100), // Space for bottom nav
        ],
      ),
    );
  }

  // Page 2: Scrollable Product List with Edit Icons (05 Grocery Cart 3)
  Widget _buildProductListPage(CartState state) {
    // This is essentially the same as the list on page 1, but with edit icons and suggested items mixed/reorganized
    // The design shows 'Suggested alternatives' prominently.

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHealthScoreBar(state.healthScore),
          const SizedBox(height: 12),
          BudgetTrackerProgress(current: state.currentBudget, max: state.maxBudget),
          const SizedBox(height: 20),

          const Text('Suggested alternatives', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 10),
          // Suggested Items (showing two cards as in the design)
          Row(
            children: [
              Expanded(child: SuggestedAlternativeCard(item: state.suggestedItems.first)),
              const SizedBox(width: 10),
              Expanded(child: SuggestedAlternativeCard(item: state.suggestedItems.last)),
            ],
          ),

          const Divider(height: 30),
          Text(
            '${state.cartItems.length} Items',
            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
          ),
          const SizedBox(height: 10),
          // Cart Product List with Edit Icon to open Page 3 modal
          ...state.cartItems.map((item) => CartProductTile(item: item, showEditIcon: true)),
          const SizedBox(height: 100),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final cartState = ref.watch(cartProvider);

    return Scaffold(
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(kToolbarHeight),
        child: CustomAppBar(
          title: 'Grocery Summary',
          leadingIcon: Icons.arrow_back,
          trailingText: '${cartState.cartItems.length} Items',
          actions: const [],
        ),
      ),
      body: PageView(
        controller: _pageController,
        children: [
          // Page 1: Summary/Suggested Products
          _buildGrocerySummaryPage(cartState),
          // Page 2: Suggested Alternatives/Editable List
          _buildProductListPage(cartState),
        ],
      ),
      // Optional: Add a floating action button or persistent bottom sheet for checkout
    );
  }
}

// Widget for the special 'Suggested alternative' cards on Page 2
class SuggestedAlternativeCard extends StatelessWidget {
  final CartItem item;
  const SuggestedAlternativeCard({super.key, required this.item});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        border: Border.all(color: AppColors.primaryGreen, width: 2),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          //  - placeholder
          const Icon(Icons.shopping_bag_outlined, size: 40, color: AppColors.primaryGreen),
          const SizedBox(height: 8),
          Text(item.name, style: const TextStyle(fontWeight: FontWeight.bold)),
          Text('₹${item.price.toStringAsFixed(2)}', style: const TextStyle(fontSize: 16, color: AppColors.primaryGreen)),
          Text(item.details, style: TextStyle(fontSize: 10, color: Colors.grey.shade600)),
        ],
      ),
    );
  }
}
