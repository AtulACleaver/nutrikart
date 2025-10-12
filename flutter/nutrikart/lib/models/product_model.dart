import 'package:nutrikart/models/nutrition_model.dart';

class ProductModel {
  final String id;
  final String name;
  final String description;
  final double price;
  final String imageUrl;
  final NutritionData nutritionData;

  const ProductModel({
    required this.id,
    required this.name,
    required this.description,
    required this.price,
    required this.imageUrl,
    required this.nutritionData,
  });

  // Mock product data matching the design
  static const mockEspresso = ProductModel(
    id: 'p1',
    name: 'Espresso',
    description: '320 kcal per serving',
    price: 99.00,
    imageUrl: 'assets/espresso.jpeg', // Placeholder for actual asset
    nutritionData: NutritionData.mockEspressoData,
  );
}
