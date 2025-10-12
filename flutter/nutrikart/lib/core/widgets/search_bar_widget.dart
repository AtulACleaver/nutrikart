import 'package:flutter/material.dart';

class SearchBarWidget extends StatelessWidget {
  final TextEditingController controller;
  final String hintText;
  final Color? backgroundColor;

  const SearchBarWidget({
    super.key,
    required this.controller,
    required this.hintText,
    this.backgroundColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 46,
      decoration: BoxDecoration(
        color: backgroundColor ?? Colors.grey.shade100,
        borderRadius: BorderRadius.circular(12),
      ),
      child: TextField(
        controller: controller,
        cursorColor: Colors.green.shade800,
        decoration: InputDecoration(
          prefixIcon: Icon(Icons.search, color: Colors.grey.shade700),
          hintText: hintText,
          border: InputBorder.none,
          hintStyle: TextStyle(color: Colors.grey.shade500),
        ),
      ),
    );
  }
}
