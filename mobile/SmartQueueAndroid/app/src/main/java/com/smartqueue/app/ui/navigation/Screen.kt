package com.smartqueue.app.ui.navigation

sealed class Screen(val route: String, val title: String) {
    object Home : Screen("home", "Supermarket")
    object Scan : Screen("scan", "Scan Barcode")
    object Cart : Screen("cart", "Cart")
    object Queue : Screen("queue", "Smart Queue")
    object Profile : Screen("profile", "Profile")
}
