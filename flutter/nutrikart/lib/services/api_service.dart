import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:flutter/foundation.dart';

class ApiService {
  static const String _baseUrl = 'http://127.0.0.1:8000';
  static const Duration _timeout = Duration(seconds: 10);
  
  late final http.Client _client;
  
  ApiService() {
    _client = http.Client();
  }
  
  // Helper method to handle HTTP responses
  Map<String, dynamic> _handleResponse(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return json.decode(response.body);
    } else {
      throw ApiException(
        message: 'API request failed',
        statusCode: response.statusCode,
        body: response.body,
      );
    }
  }
  
  // Search for products
  Future<SearchResponse> searchProducts(String query, {int limit = 5}) async {
    try {
      final uri = Uri.parse('$_baseUrl/search')
          .replace(queryParameters: {
            'query': query,
            'limit': limit.toString(),
          });
      
      final response = await _client.get(uri).timeout(_timeout);
      final data = _handleResponse(response);
      
      return SearchResponse.fromJson(data);
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // Get product details by barcode
  Future<Product> getProduct(String barcode) async {
    try {
      final uri = Uri.parse('$_baseUrl/product/$barcode');
      final response = await _client.get(uri).timeout(_timeout);
      final data = _handleResponse(response);
      
      return Product.fromJson(data);
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // Scan product by barcode
  Future<ScannedProduct> scanProduct(String barcode) async {
    try {
      final uri = Uri.parse('$_baseUrl/scan');
      final response = await _client.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: json.encode({'barcode': barcode}),
      ).timeout(_timeout);
      
      final data = _handleResponse(response);
      return ScannedProduct.fromJson(data);
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // Get product recommendations
  Future<RecommendationResponse> getRecommendations(String barcode, {int limit = 3}) async {
    try {
      final uri = Uri.parse('$_baseUrl/recommend/$barcode')
          .replace(queryParameters: {'limit': limit.toString()});
      
      final response = await _client.get(uri).timeout(_timeout);
      final data = _handleResponse(response);
      
      return RecommendationResponse.fromJson(data);
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // Get grocery summary
  Future<GrocerySummary> getGrocerySummary(List<GroceryItem> items, {double? budget}) async {
    try {
      final uri = Uri.parse('$_baseUrl/summary');
      final requestBody = {
        'items': items.map((item) => item.toJson()).toList(),
        if (budget != null) 'budget': budget,
      };
      
      final response = await _client.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: json.encode(requestBody),
      ).timeout(_timeout);
      
      final data = _handleResponse(response);
      return GrocerySummary.fromJson(data);
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // Get health information
  Future<HealthInfo> getHealthInfo() async {
    try {
      final uri = Uri.parse('$_baseUrl/health-info');
      final response = await _client.get(uri).timeout(_timeout);
      final data = _handleResponse(response);
      
      return HealthInfo.fromJson(data);
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // Upload image for OCR
  Future<OCRResponse> uploadImageForOCR(File imageFile) async {
    try {
      final uri = Uri.parse('$_baseUrl/ocr');
      final request = http.MultipartRequest('POST', uri);
      
      request.files.add(
        await http.MultipartFile.fromPath('file', imageFile.path),
      );
      
      final streamedResponse = await request.send().timeout(_timeout);
      final response = await http.Response.fromStream(streamedResponse);
      
      final data = _handleResponse(response);
      return OCRResponse.fromJson(data);
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  ApiException _handleError(dynamic error) {
    if (error is ApiException) {
      return error;
    } else if (error is SocketException) {
      return ApiException(
        message: 'No internet connection',
        statusCode: 0,
      );
    } else {
      return ApiException(
        message: 'An unexpected error occurred: ${error.toString()}',
        statusCode: 0,
      );
    }
  }
  
  void dispose() {
    _client.close();
  }
}

// Exception class for API errors
class ApiException implements Exception {
  final String message;
  final int statusCode;
  final String? body;
  
  ApiException({required this.message, required this.statusCode, this.body});
  
  @override
  String toString() {
    return 'ApiException: $message (Status: $statusCode)';
  }
}

// Data models matching backend responses
class SearchResponse {
  final String query;
  final int count;
  final List<ProductSummary> products;
  
  SearchResponse({required this.query, required this.count, required this.products});
  
  factory SearchResponse.fromJson(Map<String, dynamic> json) {
    return SearchResponse(
      query: json['query'] ?? '',
      count: json['count'] ?? 0,
      products: (json['products'] as List? ?? [])
          .map((item) => ProductSummary.fromJson(item))
          .toList(),
    );
  }
}

class ProductSummary {
  final String? id;
  final String? code;
  final String productName;
  final String brands;
  final String? imageSmallUrl;
  
  ProductSummary({
    this.id,
    this.code,
    required this.productName,
    required this.brands,
    this.imageSmallUrl,
  });
  
  factory ProductSummary.fromJson(Map<String, dynamic> json) {
    return ProductSummary(
      id: json['id'],
      code: json['code'],
      productName: json['product_name'] ?? '',
      brands: json['brands'] ?? '',
      imageSmallUrl: json['image_small_url'],
    );
  }
}

class Product {
  final String? id;
  final String? code;
  final String productName;
  final String brands;
  final String? imageUrl;
  final String? imageSmallUrl;
  final String ingredientsText;
  final Map<String, dynamic> nutriments;
  final String? nutriScore;
  
  Product({
    this.id,
    this.code,
    required this.productName,
    required this.brands,
    this.imageUrl,
    this.imageSmallUrl,
    required this.ingredientsText,
    required this.nutriments,
    this.nutriScore,
  });
  
  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      code: json['code'],
      productName: json['product_name'] ?? '',
      brands: json['brands'] ?? '',
      imageUrl: json['image_url'],
      imageSmallUrl: json['image_small_url'],
      ingredientsText: json['ingredients_text'] ?? '',
      nutriments: json['nutriments'] ?? {},
      nutriScore: json['nutri_score'],
    );
  }
}

class ScannedProduct extends Product {
  final int score;
  final List<String> reasons;
  
  ScannedProduct({
    required super.id,
    required super.code,
    required super.productName,
    required super.brands,
    super.imageUrl,
    super.imageSmallUrl,
    required super.ingredientsText,
    required super.nutriments,
    super.nutriScore,
    required this.score,
    required this.reasons,
  });
  
  factory ScannedProduct.fromJson(Map<String, dynamic> json) {
    return ScannedProduct(
      id: json['id'],
      code: json['code'],
      productName: json['product_name'] ?? '',
      brands: json['brands'] ?? '',
      imageUrl: json['image_url'],
      imageSmallUrl: json['image_small_url'],
      ingredientsText: json['ingredients_text'] ?? '',
      nutriments: json['nutriments'] ?? {},
      nutriScore: json['nutri_score'],
      score: json['score'] ?? 0,
      reasons: List<String>.from(json['reasons'] ?? []),
    );
  }
}

class RecommendationResponse {
  final ScannedProduct originalProduct;
  final List<ScannedProduct> recommendations;
  final String message;
  
  RecommendationResponse({
    required this.originalProduct,
    required this.recommendations,
    required this.message,
  });
  
  factory RecommendationResponse.fromJson(Map<String, dynamic> json) {
    return RecommendationResponse(
      originalProduct: ScannedProduct.fromJson(json['original_product']),
      recommendations: (json['recommendations'] as List? ?? [])
          .map((item) => ScannedProduct.fromJson(item))
          .toList(),
      message: json['message'] ?? '',
    );
  }
}

class GroceryItem {
  final String barcode;
  final int quantity;
  
  GroceryItem({required this.barcode, this.quantity = 1});
  
  Map<String, dynamic> toJson() {
    return {
      'barcode': barcode,
      'quantity': quantity,
    };
  }
}

class GrocerySummary {
  final int totalItems;
  final double averageHealthScore;
  final String healthGrade;
  final double? totalEstimatedCost;
  final Map<String, dynamic> nutritionBreakdown;
  final List<String> healthInsights;
  final List<String> costSavingsSuggestions;
  
  GrocerySummary({
    required this.totalItems,
    required this.averageHealthScore,
    required this.healthGrade,
    this.totalEstimatedCost,
    required this.nutritionBreakdown,
    required this.healthInsights,
    required this.costSavingsSuggestions,
  });
  
  factory GrocerySummary.fromJson(Map<String, dynamic> json) {
    return GrocerySummary(
      totalItems: json['total_items'] ?? 0,
      averageHealthScore: (json['average_health_score'] ?? 0).toDouble(),
      healthGrade: json['health_grade'] ?? 'F',
      totalEstimatedCost: json['total_estimated_cost']?.toDouble(),
      nutritionBreakdown: json['nutrition_breakdown'] ?? {},
      healthInsights: List<String>.from(json['health_insights'] ?? []),
      costSavingsSuggestions: List<String>.from(json['cost_savings_suggestions'] ?? []),
    );
  }
}

class HealthInfo {
  final Map<String, String> nutritionGuidelines;
  final Map<String, String> healthScoreRanges;
  final List<String> tips;
  
  HealthInfo({
    required this.nutritionGuidelines,
    required this.healthScoreRanges,
    required this.tips,
  });
  
  factory HealthInfo.fromJson(Map<String, dynamic> json) {
    return HealthInfo(
      nutritionGuidelines: Map<String, String>.from(json['nutrition_guidelines'] ?? {}),
      healthScoreRanges: Map<String, String>.from(json['health_score_ranges'] ?? {}),
      tips: List<String>.from(json['tips'] ?? []),
    );
  }
}

class OCRResponse {
  final Map<String, dynamic> nutritionFacts;
  final int healthScore;
  final List<String> reasons;
  final String confidence;
  final String? rawText;
  
  OCRResponse({
    required this.nutritionFacts,
    required this.healthScore,
    required this.reasons,
    required this.confidence,
    this.rawText,
  });
  
  factory OCRResponse.fromJson(Map<String, dynamic> json) {
    return OCRResponse(
      nutritionFacts: json['nutrition_facts'] ?? {},
      healthScore: json['health_score'] ?? 0,
      reasons: List<String>.from(json['reasons'] ?? []),
      confidence: json['confidence'] ?? 'low',
      rawText: json['raw_text'],
    );
  }
}

// Singleton instance for global access
final apiService = ApiService();