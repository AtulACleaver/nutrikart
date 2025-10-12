import 'dart:async';
import 'package:nutrikart/repository/uihelper.dart';
import 'package:nutrikart/repository/screens/login/loginscreen.dart';
// ignore: unused_import
import 'package:nutrikart/domain/constraints/appcolors.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

class SplashScreen extends StatefulWidget {

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen> {
  @override
  void initState() {
    super.initState();
    Timer(Duration(seconds: 3), () {
      // Navigate to home screen instead of login for now
      context.go('/home');
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.scaffoldbackground,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [Uihelper.CustomImage(img: "NutriKart.png")],
        ),
      ),
    );
  }
}

class AppColors {
  static final Color scaffoldbackground = Color(0XFF356A3B);
}
