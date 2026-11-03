package com.smartqueue.app.ui.screens.cart

import androidx.compose.foundation.BorderStroke
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
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.smartqueue.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CartScreen(
    onNavigateBack: () -> Unit,
    onProceedToCheckout: () -> Unit,
    viewModel: CartViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        containerColor = JetBlack,
        topBar = {
            TopAppBar(
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = JetBlack,
                    titleContentColor = TextPrimary
                ),
                title = { Text("My Shopping Cart", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = TextPrimary)
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
                    CircularProgressIndicator(color = CeruleanBlue)
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
                            tint = TextMuted,
                            modifier = Modifier.size(56.dp)
                        )
                        Spacer(modifier = Modifier.height(12.dp))
                        Text("Your shopping cart is empty", fontWeight = FontWeight.Bold, color = TextSecondary)
                        Text("Scan items in the aisles to add them to your cart", fontSize = 12.sp, color = TextMuted)
                    }
                }
            } else {
                Column(modifier = Modifier.weight(1f)) {
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(bottom = 8.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            "${uiState.itemCount} Items in Digital Cart",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary
                        )
                    }

                    LazyColumn(
                        verticalArrangement = Arrangement.spacedBy(10.dp),
                        modifier = Modifier.fillMaxSize()
                    ) {
                        items(uiState.items) { item ->
                            Card(
                                modifier = Modifier.fillMaxWidth(),
                                shape = RoundedCornerShape(16.dp),
                                colors = CardDefaults.cardColors(containerColor = SurfaceElevated),
                                border = BorderStroke(1.dp, BorderLuminous),
                                elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                            ) {
                                Row(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .padding(14.dp),
                                    verticalAlignment = Alignment.CenterVertically
                                ) {
                                    Column(modifier = Modifier.weight(1f)) {
                                        Text(
                                            item.productId.name,
                                            fontWeight = FontWeight.Bold,
                                            fontSize = 14.sp,
                                            color = TextPrimary
                                        )
                                        Text(
                                            "₹${item.priceAtAdd.toInt()} each • ${item.productId.aisleLocation ?: "Aisle 1"}",
                                            style = MaterialTheme.typography.labelSmall,
                                            color = TextSecondary
                                        )
                                        Spacer(modifier = Modifier.height(2.dp))
                                        Text(
                                            "₹${(item.priceAtAdd * item.quantity).toInt()}",
                                            fontWeight = FontWeight.Black,
                                            fontFamily = FontFamily.Monospace,
                                            color = CeruleanGlow,
                                            fontSize = 15.sp
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
                                            modifier = Modifier.size(30.dp),
                                            shape = RoundedCornerShape(8.dp),
                                            colors = ButtonDefaults.outlinedButtonColors(containerColor = SurfaceSecondary),
                                            border = BorderStroke(1.dp, BorderLuminous)
                                        ) {
                                            Text("-", fontWeight = FontWeight.Bold, color = TextPrimary)
                                        }

                                        Text(
                                            text = "${item.quantity}",
                                            fontWeight = FontWeight.Bold,
                                            fontFamily = FontFamily.Monospace,
                                            fontSize = 14.sp,
                                            color = TextPrimary,
                                            modifier = Modifier.padding(horizontal = 10.dp)
                                        )

                                        OutlinedButton(
                                            onClick = { viewModel.updateQuantity(item.productId._id, item.quantity, 1) },
                                            contentPadding = PaddingValues(0.dp),
                                            modifier = Modifier.size(30.dp),
                                            shape = RoundedCornerShape(8.dp),
                                            colors = ButtonDefaults.outlinedButtonColors(containerColor = SurfaceSecondary),
                                            border = BorderStroke(1.dp, BorderLuminous)
                                        ) {
                                            Text("+", fontWeight = FontWeight.Bold, color = TextPrimary)
                                        }
                                    }

                                    IconButton(
                                        onClick = { viewModel.removeItem(item.productId._id) },
                                        modifier = Modifier.size(28.dp)
                                    ) {
                                        Icon(
                                            Icons.Default.DeleteOutline,
                                            contentDescription = "Remove",
                                            tint = NeonRose
                                        )
                                    }
                                }
                            }
                        }
                    }
                }

                // Bottom Checkout & Payment Section
                Column {
                    // Payment Method Options
                    Text(
                        "Payment Preference:",
                        fontSize = 11.sp,
                        fontFamily = FontFamily.Monospace,
                        fontWeight = FontWeight.Bold,
                        color = TextSecondary
                    )
                    Row(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 6.dp),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        listOf("UPI", "CARD", "CASH").forEach { method ->
                            FilterChip(
                                selected = uiState.selectedPaymentMethod == method,
                                onClick = { viewModel.selectPaymentMethod(method) },
                                label = { Text(method, fontSize = 11.sp, fontWeight = FontWeight.Bold, fontFamily = FontFamily.Monospace) },
                                colors = FilterChipDefaults.filterChipColors(
                                    selectedContainerColor = if (method == "UPI") NeonRose else CeruleanBlue,
                                    selectedLabelColor = Color.White,
                                    containerColor = SurfaceElevated,
                                    labelColor = TextSecondary
                                ),
                                border = FilterChipDefaults.filterChipBorder(
                                    enabled = true,
                                    selected = uiState.selectedPaymentMethod == method,
                                    borderColor = if (uiState.selectedPaymentMethod == method) CeruleanBlue else BorderLuminous
                                ),
                                modifier = Modifier.weight(1f)
                            )
                        }
                    }

                    // Price Breakdown Card
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 8.dp),
                        shape = RoundedCornerShape(16.dp),
                        colors = CardDefaults.cardColors(containerColor = SurfaceElevated),
                        border = BorderStroke(1.dp, BorderLuminous)
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("Subtotal", fontSize = 12.sp, color = TextSecondary, fontFamily = FontFamily.Monospace)
                                Text("₹${uiState.subtotal.toInt()}", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary, fontFamily = FontFamily.Monospace)
                            }
                            Spacer(modifier = Modifier.height(4.dp))
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween
                            ) {
                                Text("Estimated Tax (5%)", fontSize = 12.sp, color = TextSecondary, fontFamily = FontFamily.Monospace)
                                Text("₹${uiState.estimatedTax.toInt()}", fontSize = 12.sp, fontWeight = FontWeight.SemiBold, color = TextPrimary, fontFamily = FontFamily.Monospace)
                            }
                            HorizontalDivider(modifier = Modifier.padding(vertical = 8.dp), color = BorderLuminous)
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text("Total", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = TextPrimary)
                                Text(
                                    "₹${uiState.estimatedTotal.toInt()}",
                                    fontWeight = FontWeight.Black,
                                    fontSize = 20.sp,
                                    fontFamily = FontFamily.Monospace,
                                    color = CeruleanGlow
                                )
                            }
                        }
                    }

                    Button(
                        onClick = { viewModel.joinQueueAndCheckout(onProceedToCheckout) },
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(52.dp),
                        shape = RoundedCornerShape(14.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = CeruleanBlue),
                        enabled = !uiState.isJoiningQueue && uiState.items.isNotEmpty()
                    ) {
                        if (uiState.isJoiningQueue) {
                            CircularProgressIndicator(color = Color.White, modifier = Modifier.size(24.dp))
                        } else {
                            Text("Join Smart Checkout Queue", fontWeight = FontWeight.Bold, fontSize = 15.sp, color = Color.White)
                        }
                    }
                }
            }
        }
    }
}
