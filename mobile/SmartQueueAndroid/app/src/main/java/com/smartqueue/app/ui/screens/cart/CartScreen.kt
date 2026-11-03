package com.smartqueue.app.ui.screens.cart

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.DeleteOutline
import androidx.compose.material.icons.filled.ShoppingBag
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.smartqueue.app.ui.theme.PrimaryGreen

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CartScreen(
    onNavigateBack: () -> Unit,
    onProceedToCheckout: () -> Unit,
    viewModel: CartViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("My Shopping Cart", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(16.dp),
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            if (uiState.isLoading) {
                Box(modifier = Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
                    CircularProgressIndicator(color = PrimaryGreen)
                }
            } else if (uiState.items.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            Icons.Default.ShoppingBag,
                            contentDescription = null,
                            tint = Color.LightGray,
                            modifier = Modifier.size(56.dp)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text("Your shopping cart is empty", fontWeight = FontWeight.Bold, color = Color.Gray)
                        Text("Scan items in the aisles to add them to your cart", fontSize = 12.sp, color = Color.LightGray)
                    }
                }
            } else {
                Column(modifier = Modifier.weight(1f)) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(bottom = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            "${uiState.itemCount} Items in Cart",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                    }

                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(8.dp),
                        modifier = Modifier.fillMaxSize()
                    ) {
                        items(uiState.items) { item ->
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(12.dp),
                                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                                elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
                            ) {
                                Row(
                                    modifier = Modifier.fillMaxWidth().padding(12.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(item.productId.name, fontWeight = FontWeight.SemiBold, fontSize = 14.sp)
                                        Text(
                                            "₹${item.priceAtAdd.toInt()} each • ${item.productId.aisleLocation ?: "Aisle 1"}",
                                            style = MaterialTheme.typography.labelSmall,
                                            color = Color.Gray
                                        )
                                        Text(
                                            "₹${(item.priceAtAdd * item.quantity).toInt()}",
                                            fontWeight = FontWeight.Bold,
                                            color = PrimaryGreen,
                                            fontSize = 14.sp
                                        )
                                    }

                                    // Quantity Selector
                                    Row(
                                        verticalAlignment = Alignment.CenterVertically,
                                        modifier = Modifier.padding(end = 8.dp)
                                    ) {
                                        OutlinedButton(
                                            onClick = { viewModel.updateQuantity(item.productId._id, item.quantity, -1) },
                                            contentPadding = PaddingValues(0.dp),
                                            modifier = Modifier.size(28.dp),
                                            shape = RoundedCornerShape(6.dp)
                                        ) {
                                            Text("-", fontWeight = FontWeight.Bold)
                                        }

                                        Text(
                                            text = "${item.quantity}",
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 14.sp,
                                            modifier = Modifier.padding(horizontal = 8.dp)
                                        )

                                        OutlinedButton(
                                            onClick = { viewModel.updateQuantity(item.productId._id, item.quantity, 1) },
                                            contentPadding = PaddingValues(0.dp),
                                            modifier = Modifier.size(28.dp),
                                            shape = RoundedCornerShape(6.dp)
                                        ) {
                                            Text("+", fontWeight = FontWeight.Bold)
                                        }
                                    }

                                    IconButton(
                                        onClick = { viewModel.removeItem(item.productId._id) },
                                        modifier = Modifier.size(28.dp)
                                    ) {
                                        Icon(Icons.Default.DeleteOutline, contentDescription = "Remove", tint = Color.Gray)
                                    }
                                }
                            }
                        }
                    }
                }

                // Bottom Checkout & Payment Section
                Column {
                    // Payment Method Options
                    Text("Select Payment Preference:", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.Gray)
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 6.dp),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        listOf("UPI", "CARD", "CASH").forEach { method ->
                            FilterChip(
                                selected = uiState.selectedPaymentMethod == method,
                                onClick = { viewModel.selectPaymentMethod(method) },
                                label = { Text(method, fontSize = 11.sp, fontWeight = FontWeight.Bold) },
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }

                    // Price Breakdown Card
                    Card(
                        modifier = Modifier.fillMaxWidth().padding(vertical = 8.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = CardDefaults.cardColors(containerColor = Color.LightGray.copy(alpha = 0.15f))
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("Subtotal", fontSize = 13.sp, color = Color.DarkGray)
                                Text("₹${uiState.subtotal.toInt()}", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("Estimated Tax (5%)", fontSize = 13.sp, color = Color.DarkGray)
                                Text("₹${uiState.estimatedTax.toInt()}", fontSize = 13.sp, fontWeight = FontWeight.SemiBold)
                            }
                            Divider(modifier = Modifier.padding(vertical = 6.dp), color = Color.LightGray.copy(alpha = 0.4f))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("Total", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                                Text("₹${uiState.estimatedTotal.toInt()}", fontWeight = FontWeight.Black, fontSize = 20.sp, color = PrimaryGreen)
                            }
                        }
                    }

                    Button(
                        onClick = { viewModel.joinQueueAndCheckout(onProceedToCheckout) },
                        modifier = Modifier.fillMaxWidth().height(50.dp),
                        shape = RoundedCornerShape(12.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
                        enabled = !uiState.isJoiningQueue && uiState.items.isNotEmpty()
                    ) {
                        if (uiState.isJoiningQueue) {
                            CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                        } else {
                            Text("Join Smart Checkout Queue", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                        }
                    }
                }
            }
        }
    }
}
