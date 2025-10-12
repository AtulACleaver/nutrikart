import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:nutrikart/core/theme/app_colors.dart';
import 'package:nutrikart/features/category/models/product_model.dart';
import 'package:nutrikart/providers/cart_provider.dart'; // Adjust import

class CartProductTile extends ConsumerWidget {
  final CartItem item;
  final bool showEditIcon;

  const CartProductTile({super.key, required this.item, this.showEditIcon = false});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Determine the color for the health icon (based on the design, green/yellow/red would be used)
    final healthIconColor = item.name.contains('Espresso') ? Colors.red : Colors.green;

    return ListTile(
      contentPadding: EdgeInsets.zero,
      leading: Container(
        width: 20,
        height: 20,
        decoration: BoxDecoration(
          color: healthIconColor.withOpacity(0.1),
          borderRadius: BorderRadius.circular(4),
        ),
        child: Center(
          child: Text(
            '${item.quantity}',
            style: TextStyle(color: healthIconColor, fontWeight: FontWeight.bold),
          ),
        ),
      ),
      title: Text(item.name, style: const TextStyle(fontWeight: FontWeight.bold)),
      subtitle: Text(item.details, style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
      trailing: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text('₹${item.price.toStringAsFixed(2)}', style: const TextStyle(fontWeight: FontWeight.bold)),
          if (showEditIcon)
            IconButton(
              icon: const Icon(Icons.edit, size: 20, color: Colors.grey),
              onPressed: () {
                // Action to show the Product Detail Modal (Page 3)
                showModalBottomSheet(
                  context: context,
                  builder: (context) => CartProductDetailModal(item: item),
                );
              },
            ),
        ],
      ),
    );
  }
}

// ---------------- Page 3: Product Detail Modal ----------------

class CartProductDetailModal extends ConsumerStatefulWidget {
  final CartItem item;
  const CartProductDetailModal({super.key, required this.item});

  @override
  ConsumerState<CartProductDetailModal> createState() => _CartProductDetailModalState();
}

class _CartProductDetailModalState extends ConsumerState<CartProductDetailModal> {
  late int _quantity;

  @override
  void initState() {
    super.initState();
    _quantity = widget.item.quantity;
  }

  void _increment() => setState(() => _quantity++);
  void _decrement() => setState(() => _quantity = _quantity > 1 ? _quantity - 1 : 1);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(20.0),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                widget.item.name,
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              IconButton(
                icon: const Icon(Icons.close),
                onPressed: () => Navigator.pop(context),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(widget.item.details, style: TextStyle(color: Colors.grey.shade600)),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Quantity', style: TextStyle(fontWeight: FontWeight.bold)),
              Container(
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey.shade300),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    IconButton(icon: const Icon(Icons.remove, size: 18), onPressed: _decrement),
                    Text('$_quantity', style: const TextStyle(fontWeight: FontWeight.bold)),
                    IconButton(icon: const Icon(Icons.add, size: 18), onPressed: _increment),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              // 'Remove' button (SecondaryButton global component)
              TextButton(
                onPressed: () {
                  ref.read(cartProvider.notifier).removeItem(widget.item.id);
                  Navigator.pop(context);
                },
                child: const Text('Remove', style: TextStyle(color: Colors.red)),
              ),
              // 'Update Cart' button (PrimaryButton global component)
              ElevatedButton(
                onPressed: () {
                  ref.read(cartProvider.notifier).updateItemQuantity(widget.item.id, _quantity);
                  Navigator.pop(context);
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primaryGreen,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                ),
                child: const Text('Update Cart'),
              ),
            ],
          ),
        ],
      ),
    );
  }
}