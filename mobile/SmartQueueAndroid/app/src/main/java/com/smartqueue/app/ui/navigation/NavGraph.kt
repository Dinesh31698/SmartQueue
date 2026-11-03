package com.smartqueue.app.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.smartqueue.app.ui.screens.cart.CartScreen
import com.smartqueue.app.ui.screens.home.HomeScreen
import com.smartqueue.app.ui.screens.queue.QueueScreen
import com.smartqueue.app.ui.screens.scan.BarcodeScannerScreen

@Composable
fun SmartQueueNavGraph(
    navController: NavHostController = rememberNavController()
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Home.route
    ) {
        composable(Screen.Home.route) {
            HomeScreen(
                onNavigateToScan = { navController.navigate(Screen.Scan.route) },
                onNavigateToCart = { navController.navigate(Screen.Cart.route) }
            )
        }

        composable(Screen.Scan.route) {
            BarcodeScannerScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(Screen.Cart.route) {
            CartScreen(
                onNavigateBack = { navController.popBackStack() },
                onProceedToCheckout = { navController.navigate(Screen.Queue.route) }
            )
        }

        composable(Screen.Queue.route) {
            QueueScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
    }
}
