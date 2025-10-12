class ProductModel {
  final String name;
  final String imageUrl;
  final double price;
  final double healthScore;

  ProductModel({
    required this.name,
    required this.imageUrl,
    required this.price,
    required this.healthScore,
  });
}


// Assume ProductModel already exists, adding CartItem as a wrapper
class CartItem {
  final String id;
  final String name;
  final double price;
  final String details; // e.g., '1 Pack | 22 Pcs - 500cal'
  int quantity;
  final bool isSuggested;

  CartItem({
    required this.id,
    required this.name,
    required this.price,
    required this.details,
    this.quantity = 1,
    this.isSuggested = false,
  });

  CartItem copyWith({int? quantity}) {
    return CartItem(
      id: id,
      name: name,
      price: price,
      details: details,
      quantity: quantity ?? this.quantity,
      isSuggested: isSuggested,
    );
  }
}