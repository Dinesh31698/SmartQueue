package com.smartqueue.app.ui.screens.home

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
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
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.smartqueue.app.data.remote.dto.ProductDto
import com.smartqueue.app.ui.theme.*

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
        containerColor = JetBlack,
        topBar = {
            TopAppBar(
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = JetBlack,
                    titleContentColor = TextPrimary
                ),
                title = {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "SMART",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Black,
                                color = TextPrimary
                            )
                            Text(
                                text = "QUEUE",
                                style = MaterialTheme.typography.titleMedium,
                                fontWeight = FontWeight.Black,
                                color = NeonRose
                            )
                        }
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Box(
                                modifier = Modifier
                                    .size(6.dp)
                                    .clip(CircleShape)
                                    .background(CeruleanBlue)
                            )
                            Spacer(modifier = Modifier.width(4.dp))
                            Text(
                                text = "NFC & QR Synced • ${uiState.storeName}",
                                style = MaterialTheme.typography.labelSmall,
                                color = CeruleanGlow
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
                            tint = NeonRose
                        )
                    }
                    IconButton(onClick = onNavigateToScan) {
                        Icon(
                            Icons.Default.QrCodeScanner,
                            contentDescription = "Scan Item",
                            tint = CeruleanBlue
                        )
                    }
                    BadgedBox(
                        badge = {
                            if (uiState.cartCount > 0) {
                                Badge(
                                    containerColor = NeonRose,
                                    contentColor = Color.White
                                ) {
                                    Text("${uiState.cartCount}", fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    ) {
                        IconButton(onClick = onNavigateToCart) {
                            Icon(
                                Icons.Default.ShoppingBag,
                                contentDescription = "Cart",
                                tint = CeruleanBlue
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
                placeholder = { Text("Search products, brands, or barcodes...", color = TextMuted) },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = CeruleanBlue) },
                shape = RoundedCornerShape(14.dp),
                singleLine = true,
                colors = OutlinedTextFieldDefaults.colors(
                    focusedContainerColor = SurfaceElevated,
                    unfocusedContainerColor = SurfaceElevated,
                    focusedTextColor = TextPrimary,
                    unfocusedTextColor = TextPrimary,
                    focusedBorderColor = CeruleanBlue,
                    unfocusedBorderColor = BorderLuminous
                )
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
                            label = { Text("All Products", fontSize = 12.sp) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = CeruleanBlue,
                                selectedLabelColor = Color.White,
                                containerColor = SurfaceElevated,
                                labelColor = TextSecondary
                            ),
                            border = FilterChipDefaults.filterChipBorder(
                                enabled = true,
                                selected = uiState.selectedCategory == null,
                                borderColor = if (uiState.selectedCategory == null) CeruleanBlue else BorderLuminous
                            )
                        )
                    }
                    items(uiState.categories) { cat ->
                        FilterChip(
                            selected = uiState.selectedCategory == cat._id,
                            onClick = { viewModel.onCategorySelected(cat._id) },
                            label = { Text(cat.name, fontSize = 12.sp) },
                            colors = FilterChipDefaults.filterChipColors(
                                selectedContainerColor = CeruleanBlue,
                                selectedLabelColor = Color.White,
                                containerColor = SurfaceElevated,
                                labelColor = TextSecondary
                            ),
                            border = FilterChipDefaults.filterChipBorder(
                                enabled = true,
                                selected = uiState.selectedCategory == cat._id,
                                borderColor = if (uiState.selectedCategory == cat._id) CeruleanBlue else BorderLuminous
                            )
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
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = SurfaceElevated),
                border = BorderStroke(1.dp, BorderRose)
            ) {
                Row(
                    modifier = Modifier.padding(14.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Box(
                        modifier = Modifier
                            .size(36.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(NeonRose.copy(alpha = 0.2f)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            Icons.Default.AutoAwesome,
                            contentDescription = null,
                            tint = NeonRose,
                            modifier = Modifier.size(20.dp)
                        )
                    }
                    Spacer(modifier = Modifier.width(12.dp))
                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            "AI Supermarket Copilot",
                            fontWeight = FontWeight.Bold,
                            color = TextPrimary,
                            fontSize = 14.sp
                        )
                        Text(
                            "Tap to ask aisle directions, dietary advice or recipe ingredients",
                            style = MaterialTheme.typography.bodySmall,
                            color = TextSecondary,
                            fontSize = 11.sp
                        )
                    }
                    Icon(
                        Icons.Default.ChevronRight,
                        contentDescription = null,
                        tint = NeonRose,
                        modifier = Modifier.size(18.dp)
                    )
                }
            }

            // Products Section Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(top = 10.dp, bottom = 6.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    "Supermarket Catalog",
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold,
                    color = TextPrimary
                )
                Text(
                    "${uiState.products.size} items",
                    style = MaterialTheme.typography.labelSmall,
                    color = CeruleanGlow
                )
            }

            if (uiState.isLoading) {
                Box(
                    modifier = Modifier.fillMaxSize(),
                    contentAlignment = Alignment.Center
                ) {
                    CircularProgressIndicator(color = CeruleanBlue)
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
                            tint = TextMuted,
                            modifier = Modifier.size(48.dp)
                        )
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            "No products found",
                            fontWeight = FontWeight.SemiBold,
                            color = TextSecondary
                        )
                    }
                }
            } else {
                LazyColumn(
                    verticalArrangement = Arrangement.spacedBy(10.dp),
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
            containerColor = SurfaceElevated,
            title = {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    Icon(
                        Icons.Default.AutoAwesome,
                        contentDescription = null,
                        tint = NeonRose
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("AI Shopping Assistant", fontWeight = FontWeight.Bold, color = TextPrimary)
                }
            },
            text = {
                Column(modifier = Modifier.fillMaxWidth()) {
                    OutlinedTextField(
                        value = aiQueryInput,
                        onValueChange = { aiQueryInput = it },
                        modifier = Modifier.fillMaxWidth(),
                        placeholder = { Text("e.g. Gluten-free snacks under ₹100 or where is olive oil?", color = TextMuted, fontSize = 12.sp) },
                        singleLine = false,
                        maxLines = 3,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedContainerColor = SurfaceSecondary,
                            unfocusedContainerColor = SurfaceSecondary,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary,
                            focusedBorderColor = NeonRose,
                            unfocusedBorderColor = BorderRose
                        )
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
                                color = NeonRose
                            )
                        }
                    }

                    uiState.aiAssistantReply?.let { reply ->
                        Spacer(modifier = Modifier.height(12.dp))
                        Surface(
                            shape = RoundedCornerShape(12.dp),
                            color = SurfaceSecondary,
                            border = BorderStroke(1.dp, BorderRose),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Text(
                                text = reply,
                                modifier = Modifier.padding(12.dp),
                                fontSize = 13.sp,
                                color = TextPrimary
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
                    colors = ButtonDefaults.buttonColors(containerColor = NeonRose)
                ) {
                    Text("Ask Copilot", fontWeight = FontWeight.Bold, color = Color.White)
                }
            },
            dismissButton = {
                TextButton(onClick = {
                    showAiDialog = false
                    viewModel.clearAiReply()
                    aiQueryInput = ""
                }) {
                    Text("Close", color = TextSecondary)
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
            Box(
                modifier = Modifier
                    .size(52.dp)
                    .clip(RoundedCornerShape(12.dp))
                    .background(SurfaceSecondary)
                    .border(BorderStroke(1.dp, BorderLuminous), RoundedCornerShape(12.dp)),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = product.name.take(2).uppercase(),
                    fontWeight = FontWeight.Black,
                    fontFamily = FontFamily.Monospace,
                    color = CeruleanGlow,
                    fontSize = 16.sp
                )
            }

            Spacer(modifier = Modifier.width(12.dp))

            Column(modifier = Modifier.weight(1f)) {
                Text(
                    product.name,
                    fontWeight = FontWeight.Bold,
                    fontSize = 14.sp,
                    color = TextPrimary,
                    maxLines = 2
                )
                Text(
                    "${product.brand} • ${product.aisleLocation ?: "Aisle 1"}",
                    style = MaterialTheme.typography.labelSmall,
                    color = TextSecondary
                )

                Spacer(modifier = Modifier.height(4.dp))

                Row(verticalAlignment = Alignment.CenterVertically) {
                    Text(
                        "₹${product.price.toInt()}",
                        fontWeight = FontWeight.Black,
                        fontFamily = FontFamily.Monospace,
                        color = CeruleanGlow,
                        fontSize = 16.sp
                    )
                    if (product.isHealthyPick) {
                        Spacer(modifier = Modifier.width(8.dp))
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = NeonRose.copy(alpha = 0.15f),
                            border = BorderStroke(1.dp, BorderRose)
                        ) {
                            Text(
                                "Healthy Pick",
                                color = NeonRose,
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
                shape = RoundedCornerShape(10.dp),
                colors = ButtonDefaults.buttonColors(containerColor = CeruleanBlue),
                contentPadding = PaddingValues(horizontal = 14.dp, vertical = 6.dp)
            ) {
                Text("+ Add", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White)
            }
        }
    }
}
