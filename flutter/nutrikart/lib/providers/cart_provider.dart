import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nutrikart/features/category/models/product_model.dart'; // Adjust import

class CartState {
  final List<CartItem> cartItems;
  final List<CartItem> suggestedItems;
  final double healthScore;
  final double currentBudget;
  final double maxBudget;

  CartState({
    required this.cartItems,
    required this.suggestedItems,
    required this.healthScore,
    required this.currentBudget,
    required this.maxBudget,
  });

  // Simplified initial/mock state
  factory CartState.initial() {
    return CartState(
      cartItems: [
        CartItem(id: '1', name: 'White Bread', price: 20.00, details: '1 Piece | 200cal'),
        CartItem(id: '2', name: 'Nescafé Espresso', price: 100.00, details: '1 Pack | 22 Pcs - 500cal'),
        // ... other items to match the design (total 32 items)
      ],
      suggestedItems: [
        CartItem(id: 's1', name: 'Brown Bread', price: 35.00, details: '1 Piece | 200cal', isSuggested: true),
        CartItem(id: 's2', name: 'White Bread', price: 20.00, details: '1 Piece | 200cal', isSuggested: true),
      ],
      healthScore: 55,
      currentBudget: 5655,
      maxBudget: 6000,
    );
  }

  double get totalSpent => cartItems.fold(0, (sum, item) => sum + (item.price * item.quantity));

  CartState copyWith({
    List<CartItem>? cartItems,
    List<CartItem>? suggestedItems,
    double? healthScore,
    double? currentBudget,
    double? maxBudget,
  }) {
    return CartState(
      cartItems: cartItems ?? this.cartItems,
      suggestedItems: suggestedItems ?? this.suggestedItems,
      healthScore: healthScore ?? this.healthScore,
      currentBudget: currentBudget ?? this.currentBudget,
      maxBudget: maxBudget ?? this.maxBudget,
    );
  }
}

class CartNotifier extends StateNotifier<CartState> {
  CartNotifier() : super(CartState.initial());

  void updateBudget(double newBudget) {
    state = state.copyWith(maxBudget: newBudget);
  }

  void updateItemQuantity(String itemId, int newQuantity) {
    final updatedList = state.cartItems.map((item) {
      if (item.id == itemId) {
        return item.copyWith(quantity: newQuantity);
      }
      return item;
    }).toList();
    state = state.copyWith(cartItems: updatedList);
  }

  void removeItem(String itemId) {
    final updatedList = state.cartItems.where((item) => item.id != itemId).toList();
    state = state.copyWith(cartItems: updatedList);
  }
}

final cartProvider = StateNotifierProvider<CartNotifier, CartState>((ref) {
  return CartNotifier();
});