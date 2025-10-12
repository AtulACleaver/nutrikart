// Product models that work with our API service
// The main product models are now in services/api_service.dart
// This file contains additional helper classes and UI-specific models

import 'package:nutrikart/services/api_service.dart';
import 'package:nutrikart/models/nutrition_model.dart';

// Extension to convert API Product to UI-friendly ProductModel
extension ProductToModel on Product {
  ProductModel toProductModel() {
    return ProductModel(
      id: id ?? code ?? '',
      name: productName,
      description: _generateDescription(),
      price: _estimatePrice(),
      imageUrl: imageUrl ?? imageSmallUrl ?? '',
      nutritionData: NutritionData.fromNutriments(nutriments),
      brands: brands,
      ingredientsText: ingredientsText,
      nutriScore: nutriScore,
    );
  }
  
  String _generateDescription() {
    final calories = nutriments['energy-kcal_100g'];
    if (calories != null) {
      return '${calories.round()} kcal per 100g';
    }
    return brands.isNotEmpty ? brands : 'No description available';
  }
  
  double _estimatePrice() {
    // Mock pricing based on product name/category
    final name = productName.toLowerCase();
    if (name.contains('organic') || name.contains('premium')) return 250.0;
    if (name.contains('chocolate')) return 180.0;
    if (name.contains('milk')) return 120.0;
    if (name.contains('bread')) return 80.0;
    return 100.0; // Default price
  }
}

class ProductModel {
  final String id;
  final String name;
  final String description;
  final double price;
  final String imageUrl;
  final NutritionData nutritionData;
  final String brands;
  final String ingredientsText;
  final String? nutriScore;

  const ProductModel({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.imageUrl,
    required this.nutritionData,
    required this.brands,
    required this.ingredientsText,
    this.nutriScore,
  });

  // Mock product data for UI testing
  static ProductModel get mockEspresso => ProductModel(
    id: 'p1',
    name: 'Espresso Coffee',
    description: '320 kcal per serving',
    price: 99.00,
    imageUrl: 'assets/images/espresso.jpeg',
    nutritionData: NutritionData.mockEspressoData,
    brands: 'Premium Coffee Co.',
    ingredientsText: 'Coffee beans, water',
    nutriScore: 'b',
  );
  
  static ProductModel get mockBread => ProductModel(
    id: 'p2',
    name: 'White Bread',
    description: '250 kcal per slice',
    price: 45.00,
    imageUrl: 'assets/images/white_bread.jpeg',
    nutritionData: NutritionData.mockBreadData,
    brands: 'Bakery Fresh',
    ingredientsText: 'Wheat flour, water, yeast, salt',
    nutriScore: 'c',
  );
}
