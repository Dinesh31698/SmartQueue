package com.smartqueue.app.ui.screens.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.smartqueue.app.data.remote.dto.ProductDto
import com.smartqueue.app.ui.theme.PrimaryGreen

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(
    onNavigateToScan: () -> Unit,
    onNavigateToCart: () -> Unit,
    viewModel: HomeViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var aiQueryInput by remember { mutableStateOf("") }
    var showAiDialog by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Column {
                        Text(
                            text = uiState.storeName,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(6.dp)
                                    .clip(CircleShape)
                                    .background(PrimaryGreen)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "NFC & QR Connected • ${uiState.storeCode}",
                                style = MaterialTheme.typography.labelSmall,
                                color = MaterialTheme.colorScheme.onSurface.copy(alpha = 0.6f)
                            )
                        }
                    }
                },
                actions = {
                    // AI Assistant Quick Action
                    IconButton(onClick = { showAiDialog = true }) {
                        Icon(
                            Icons.Default.AutoAwesome,
                            contentDescription = "AI Assistant",
                            tint = Color(0xFF8B5CF6)
                        )
                    }
                    IconButton(onClick = onNavigateToScan) {
                        Icon(
                            Icons.Default.QrCodeScanner,
                            contentDescription = "Scan Item",
                            tint = PrimaryGreen
                        )
                    }
                    BadgedBox(
                        badge = {
                            if (uiState.cartCount > 0) {
                                Badge(containerColor = Color.Red) {
                                    Text("${uiState.cartCount}")
                                }
                            }
                        }
                    ) {
                        IconButton(onClick = onNavigateToCart) {
                            Icon(
                                Icons.Default.ShoppingBag,
                                contentDescription = "Cart",
                                tint = PrimaryGreen
                            )
                        }
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(horizontal = 16.dp)
        ) {
            // Search Bar
            OutlinedTextField(
                value = uiState.searchQuery,
                onValueChange = { viewModel.onSearchQueryChanged(it) },
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 6.dp),
                placeholder = { Text("Search products, brands, or barcodes...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                shape = RoundedCornerShape(12.dp),
                singleLine = true
            )

            // Category Chips Row
            if (uiState.categories.isNotEmpty()) {
                LazyRow(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.padding(vertical = 6.dp)
                ) {
                    item {
                        FilterChip(
                            selected = uiState.selectedCategory == null,
                            onClick = { viewModel.onCategorySelected(null) },
                            label = { Text("All") }
                        )
                    }
                    items(uiState.categories) { cat ->
                        FilterChip(
                            selected = uiState.selectedCategory == cat._id,
                            onClick = { viewModel.onCategorySelected(cat._id) },
                            label = { Text(cat.name) }
                        )
                    }
                }
            }

            // AI Shopping Assistant Quick Suggestion Card
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 6.dp)
                    .clickable { showAiDialog = true },
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = Color(0xFFF3E8FF))
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Icon(
                        Icons.Default.AutoAwesome,
                        contentDescription = null,
                        tint = Color(0xFF7C3AED),
                        modifier = Modifier.size(24.dp)
                    )
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            "Smart Shopping Assistant",
                            fontWeight = FontWeight.Bold,
                            color = Color(0xFF5B21B6),
                            fontSize = 14.sp
                        )
                        Text(
                            "Ask for healthy picks, recipes, or aisle locations",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFF6D28D9)
                        )
                    }
                }
            }

            // Products Section Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 8.dp, bottom = 4.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    "Supermarket Aisle Products",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    "${uiState.products.size} items",
                    style = MaterialTheme.typography.labelSmall,
                    color = Color.Gray
                )
            }

            if (uiState.isLoading) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = PrimaryGreen)
                }
            } else if (uiState.products.isEmpty()) {
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .padding(32.dp),
                    contentAlignment = Alignment.Center
                ) {
                    Column(horizontalAlignment = Alignment.CenterHorizontally) {
                        Icon(
                            Icons.Default.ShoppingBag,
                            contentDescription = null,
                            tint = Color.LightGray,
                            modifier = Modifier.size(48.dp)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            "No products found",
                            fontWeight = FontWeight.SemiBold,
                            color = Color.Gray
                        )
                    }
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(8.dp),
                    modifier = Modifier.fillMaxSize()
                ) {
                    items(uiState.products) { product ->
                        ProductItemCard(
                            product = product,
                            onAddToCart = { viewModel.addToCart(product._id) }
                        )
                    }
                }
            }
        }
    }

    // AI Shopping Assistant Dialog
    if (showAiDialog) {
        AlertDialog(
            onDismissRequest = { showAiDialog = false },
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.AutoAwesome,
                        contentDescription = null,
                        tint = Color(0xFF7C3AED)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("AI Shopping Assistant", fontWeight = FontWeight.Bold)
                }
            },
            text = {
                Column(modifier = Modifier.fillMaxWidth()) {
                    OutlinedTextField(
                        value = aiQueryInput,
                        onValueChange = { aiQueryInput = it },
                        modifier = Modifier.fillMaxWidth(),
                        placeholder = { Text("e.g. Where is milk? or Healthy snacks under $5") },
                        singleLine = false,
                        maxLines = 3
                    )

                    if (uiState.isAiThinking) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(top = 12.dp),
                            horizontalArrangement = Arrangement.Center
                        ) {
                            CircularProgressIndicator(
                                modifier = Modifier.size(24.dp),
                                color = Color(0xFF7C3AED)
                            )
                        }
                    }

                    uiState.aiAssistantReply?.let { reply ->
                        Spacer(modifier = Modifier.height(12.dp))
                        Surface(
                            shape = RoundedCornerShape(10.dp),
                            color = Color(0xFFF3E8FF),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = reply,
                                modifier = Modifier.padding(12.dp),
                                fontSize = 13.sp,
                                color = Color(0xFF4C1D95)
                            )
                        }
                    }
                }
            },
            confirmButton = {
                Button(
                    onClick = {
                        viewModel.queryAIAssistant(aiQueryInput)
                    },
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF7C3AED))
                ) {
                    Text("Ask AI")
                }
            },
            dismissButton = {
                TextButton(onClick = {
                    showAiDialog = false
                    viewModel.clearAiReply()
                    aiQueryInput = ""
                }) {
                    Text("Close")
                }
            }
        )
    }
}

@Composable
fun ProductItemCard(
    product: ProductDto,
    onAddToCart: () -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
        elevation = CardDefaults.cardElevation(defaultElevation = 1.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(48.dp)
                    .clip(RoundedCornerShape(8.dp))
                    .background(Color.LightGray.copy(alpha = 0.25f)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = product.name.take(2).uppercase(),
                    fontWeight = FontWeight.Bold,
                    color = Color.DarkGray
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    product.name,
                    fontWeight = FontWeight.SemiBold,
                    fontSize = 14.sp,
                    maxLines = 2
                )
                Text(
                    "${product.brand} • ${product.aisleLocation ?: "Aisle 1"}",
                    style = MaterialTheme.typography.labelSmall,
                    color = Color.Gray
                )

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        "₹${product.price.toInt()}",
                        fontWeight = FontWeight.Bold,
                        color = PrimaryGreen,
                        fontSize = 15.sp
                    )
                    if (product.isHealthyPick) {
                        Spacer(modifier = Modifier.width(8.dp))
                        Surface(
                            shape = RoundedCornerShape(4.dp),
                            color = PrimaryGreen.copy(alpha = 0.15f)
                        ) {
                            Text(
                                "Healthy",
                                color = PrimaryGreen,
                                fontSize = 10.sp,
                                fontWeight = FontWeight.Bold,
                                modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                            )
                        }
                    }
                }
            }

            Button(
                onClick = onAddToCart,
                shape = RoundedCornerShape(8.dp),
                colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen),
                contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
            ) {
                Text("+ Add", fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}
