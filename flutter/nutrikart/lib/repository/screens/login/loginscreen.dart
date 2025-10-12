import 'package:flutter/material.dart';
import 'package:nutrikart/repository/uihelper.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Column(
          children: [
            Uihelper.CustomImage(img: ""),
            SizedBox(height: 30),
            Uihelper.CustomText(
              text: "NutriKart Slogan",
              color: Color(0XFF000000),
              fontWeight: FontWeight.bold,
              fontsize: 20,
              fontfamily: "bold",
            ),

            SizedBox(height: 20),
            Card(
              elevation: 4,
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(10),
              ),
              child: Container(
                height: 200,
                width: 350,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(10),
                  color: Color(0XFFFFFFFF),
                ),
                child: Column(
                  children: [
                    SizedBox(height: 20),
                    Uihelper.CustomText(
                      text: "Harsha",
                      color: Color(0XFF000000),
                      fontWeight: FontWeight.w500,
                      fontsize: 14,
                    ),
                    SizedBox(height: 5),
                    Uihelper.CustomText(
                      text: "96189XXXXX",
                      color: Color(0XFF9C9C9C),
                      fontWeight: FontWeight.bold,
                      fontsize: 14,
                      fontfamily: "bold",
                    ),
                    SizedBox(height: 20),
                    SizedBox(
                      height: 40,
                      width: 295,
                      child: ElevatedButton(
                        onPressed: () {},
                        child: Row(children: [
                          // fill up
                    ],),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
