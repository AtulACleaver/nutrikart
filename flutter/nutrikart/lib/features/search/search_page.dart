import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nutrikart/core/theme/app_colors.dart';
import 'package:nutrikart/core/widgets/custom_search_bar.dart';
import 'package:nutrikart/features/search/widgets/search_suggestion_tile.dart';
import 'package:nutrikart/services/api_service.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';

// State providers
final searchQueryProvider = StateProvider<String>((ref) => '');
final showResultsProvider = StateProvider<bool>((ref) => false);

// API search provider
final searchResultsProvider = FutureProvider.family<SearchResponse, String>((ref, query) async {
  if (query.trim().isEmpty) {
    return SearchResponse(query: query, count: 0, products: []);
  }
  return await apiService.searchProducts(query, limit: 20);
});

// Mock suggestions for autocomplete
final suggestionsProvider = Provider<List<String>>((ref) {
  final query = ref.watch(searchQueryProvider);
  final allSuggestions = [
    'Chocolate',
    'Milk',
    'Bread',
    'Cookies',
    'Juice',
    'Yogurt',
    'Cheese',
    'Pasta',
    'Cereal',
    'Snacks',
  ];
  if (query.isEmpty) return [];
  return allSuggestions
      .where((item) => item.toLowerCase().contains(query.toLowerCase()))
      .take(5)
      .toList();
});

class SearchPage extends ConsumerStatefulWidget {
  const SearchPage({super.key});

  @override
  ConsumerState<SearchPage> createState() => _SearchPageState();
}

class _SearchPageState extends ConsumerState<SearchPage> {
  final TextEditingController _searchController = TextEditingController();
  
  void _performSearch(String query) {
    if (query.trim().isNotEmpty) {
      ref.read(searchQueryProvider.notifier).state = query;
      ref.read(showResultsProvider.notifier).state = true;
    }
  }
  
  @override
  Widget build(BuildContext context) {
    final suggestions = ref.watch(suggestionsProvider);
    final query = ref.watch(searchQueryProvider);
    final showResults = ref.watch(showResultsProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        titleSpacing: 0,
        title: Padding(
          padding: const EdgeInsets.only(right: 16.0),
          child: TextField(
            controller: _searchController,
            decoration: InputDecoration(
              hintText: "Search for groceries...",
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: BorderSide.none,
              ),
              filled: true,
              fillColor: Colors.grey.shade100,
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              suffixIcon: IconButton(
                icon: const Icon(Icons.search),
                onPressed: () => _performSearch(_searchController.text),
              ),
            ),
            onChanged: (value) {
              ref.read(searchQueryProvider.notifier).state = value;
              ref.read(showResultsProvider.notifier).state = false;
            },
            onSubmitted: _performSearch,
          ),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16.0),
        child: showResults && query.isNotEmpty
            ? _buildSearchResults(query)
            : query.isEmpty
                ? _buildEmptyState()
                : _buildSuggestions(suggestions),
      ),
    );
  }
  
  Widget _buildEmptyState() {
    return const Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.search, size: 64, color: Colors.grey),
          SizedBox(height: 16),
          Text(
            'Search groceries, categories, or brands',
            style: TextStyle(color: Colors.grey, fontSize: 16),
          ),
        ],
      ),
    );
  }
  
  Widget _buildSuggestions(List<String> suggestions) {
    if (suggestions.isEmpty) {
      return const SizedBox.shrink();
    }
    
    return ListView(
      children: [
        const SizedBox(height: 8),
        const Text(
          'Suggestions',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Colors.grey,
          ),
        ),
        const SizedBox(height: 8),
        ...suggestions.map((s) => SearchSuggestionTile(
              title: s,
              onTap: () {
                _searchController.text = s;
                _performSearch(s);
              },
            )),
      ],
    );
  }
  
  Widget _buildSearchResults(String query) {
    final searchAsync = ref.watch(searchResultsProvider(query));
    
    return searchAsync.when(
      data: (searchResponse) {
        if (searchResponse.products.isEmpty) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.search_off, size: 64, color: Colors.grey),
                const SizedBox(height: 16),
                Text(
                  'No products found for "$query"',
                  style: const TextStyle(fontSize: 16, color: Colors.grey),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Try a different search term',
                  style: TextStyle(fontSize: 14, color: Colors.grey),
                ),
              ],
            ),
          );
        }
        
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 8),
            Text(
              'Found ${searchResponse.count} products for "$query"',
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: GridView.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 0.75,
                ),
                itemCount: searchResponse.products.length,
                itemBuilder: (context, index) {
                  final product = searchResponse.products[index];
                  return _buildProductCard(product);
                },
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
            Text(
              'Error searching products',
              style: const TextStyle(fontSize: 16, color: Colors.grey),
            ),
            const SizedBox(height: 8),
            Text(
              error.toString(),
              style: const TextStyle(fontSize: 12, color: Colors.grey),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () {
                ref.refresh(searchResultsProvider(query));
              },
              child: const Text('Retry'),
            ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildProductCard(ProductSummary product) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        onTap: () {
          if (product.code != null) {
            context.push('/product/${product.code}');
          }
        },
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Container(
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: Colors.grey.shade100,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: product.imageSmallUrl != null
                      ? CachedNetworkImage(
                          imageUrl: product.imageSmallUrl!,
                          fit: BoxFit.cover,
                          placeholder: (context, url) => const Center(
                            child: CircularProgressIndicator(),
                          ),
                          errorWidget: (context, url, error) => Icon(
                            Icons.fastfood,
                            size: 40,
                            color: Colors.grey.shade400,
                          ),
                        )
                      : Icon(
                          Icons.fastfood,
                          size: 40,
                          color: Colors.grey.shade400,
                        ),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                product.productName,
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 14,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              if (product.brands.isNotEmpty) ..[
                const SizedBox(height: 4),
                Text(
                  product.brands,
                  style: TextStyle(
                    color: Colors.grey.shade600,
                    fontSize: 12,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
