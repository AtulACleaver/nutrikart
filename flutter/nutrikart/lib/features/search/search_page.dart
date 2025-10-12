import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nutrikart/core/theme/app_colors.dart';
import 'package:nutrikart/core/widgets/custom_search_bar.dart';
import 'package:nutrikart/features/search/widgets/search_suggestion_tile.dart';

final searchQueryProvider = StateProvider<String>((ref) => '');
final suggestionsProvider = Provider<List<String>>((ref) {
  final query = ref.watch(searchQueryProvider);
  final allSuggestions = [
    'Choco',
    'Chocolates',
    'Choco Chips',
    'Chocolate Spread',
    'Choco Milk',
  ];
  if (query.isEmpty) return [];
  return allSuggestions
      .where((item) => item.toLowerCase().contains(query.toLowerCase()))
      .toList();
});

class SearchPage extends ConsumerWidget {
  const SearchPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final suggestions = ref.watch(suggestionsProvider);
    final query = ref.watch(searchQueryProvider);

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        automaticallyImplyLeading: false,
        backgroundColor: Colors.white,
        elevation: 0,
        titleSpacing: 0,
        title: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: CustomSearchBar(
            hintText: "Search for groceries...",
            onChanged: (value) {
              ref.read(searchQueryProvider.notifier).state = value;
            },
          ),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16.0),
        child: query.isEmpty
            ? const Center(
                child: Text(
                  'Search groceries, categories, or brands',
                  style: TextStyle(color: Colors.grey, fontSize: 16),
                ),
              )
            : ListView(
                children: [
                  const SizedBox(height: 8),
                  ...suggestions.map((s) => SearchSuggestionTile(
                        title: s,
                        onTap: () {
                          FocusScope.of(context).unfocus();
                          // Navigate to search results page
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(content: Text('Selected: $s')),
                          );
                        },
                      )),
                  if (suggestions.isNotEmpty) const SizedBox(height: 8),
                  if (suggestions.isNotEmpty)
                    Center(
                      child: TextButton(
                        onPressed: () {
                          // Navigate to full results
                        },
                        child: const Text(
                          'See all results',
                          style: TextStyle(
                            fontSize: 16,
                            color: AppColors.primaryGreen,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        selectedItemColor: AppColors.primaryGreen,
        unselectedItemColor: Colors.grey,
        items: const [
          BottomNavigationBarItem(icon: Icon(Icons.home_outlined), label: 'Home'),
          BottomNavigationBarItem(icon: Icon(Icons.grid_view_outlined), label: 'Category'),
          BottomNavigationBarItem(icon: Icon(Icons.qr_code_scanner_outlined), label: 'Scan'),
          BottomNavigationBarItem(icon: Icon(Icons.shopping_cart_outlined), label: 'Grocery'),
          BottomNavigationBarItem(icon: Icon(Icons.restaurant_menu_outlined), label: 'Meals'),
        ],
      ),
    );
  }
}
