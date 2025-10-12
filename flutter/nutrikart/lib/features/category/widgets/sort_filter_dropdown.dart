import 'package:flutter/material.dart';

class SortFilterDropdown extends StatefulWidget {
  final Function(String) onChanged;
  const SortFilterDropdown({super.key, required this.onChanged});

  @override
  State<SortFilterDropdown> createState() => _SortFilterDropdownState();
}

class _SortFilterDropdownState extends State<SortFilterDropdown> {
  String selected = 'Sort by';

  @override
  Widget build(BuildContext context) {
    return DropdownButtonHideUnderline(
      child: DropdownButton<String>(
        value: selected,
        icon: const Icon(Icons.arrow_drop_down),
        items: const [
          DropdownMenuItem(value: 'Sort by', child: Text('Sort by')),
          DropdownMenuItem(value: 'Price: Low to High', child: Text('Price: Low to High')),
          DropdownMenuItem(value: 'Price: High to Low', child: Text('Price: High to Low')),
          DropdownMenuItem(value: 'Health Score', child: Text('Health Score')),
        ],
        onChanged: (value) {
          if (value != null) {
            setState(() => selected = value);
            widget.onChanged(value);
          }
        },
      ),
    );
  }
}
