package com.smartqueue.app.ui.screens.scan

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.FlashOn
import androidx.compose.material.icons.filled.Search
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
fun BarcodeScannerScreen(
    onNavigateBack: () -> Unit,
    viewModel: ScanViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    var manualBarcodeInput by remember { mutableStateOf("") }
    var showManualDialog by remember { mutableStateOf(false) }

    Scaffold(
        containerColor = JetBlack,
        topBar = {
            TopAppBar(
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = JetBlack,
                    titleContentColor = TextPrimary
                ),
                title = { Text("Vision Barcode Scanner", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = TextPrimary)
                    }
                },
                actions = {
                    IconButton(onClick = { showManualDialog = true }) {
                        Icon(Icons.Default.Search, contentDescription = "Manual Code", tint = CeruleanBlue)
                    }
                    IconButton(onClick = {}) {
                        Icon(Icons.Default.FlashOn, contentDescription = "Flash", tint = NeonRose)
                    }
                }
            )
        }
    ) { paddingValues ->
        Box(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .background(JetBlack),
            contentAlignment = Alignment.Center
        ) {
            // Futuristic Viewfinder Target Frame
            Box(
                modifier = Modifier
                    .size(280.dp)
                    .background(Color.Transparent),
                contentAlignment = Alignment.Center
            ) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    shape = RoundedCornerShape(20.dp),
                    color = Color.Transparent,
                    border = BorderStroke(2.dp, CeruleanBlue)
                ) {}

                // Laser scanline indicator
                Box(
                    modifier = Modifier
                        .fillMaxWidth(0.9f)
                        .height(2.dp)
                        .background(NeonRose)
                )
            }

            // Quick Barcode Simulator Buttons for Emulator Testing
            Column(
                modifier = Modifier
                    .align(Alignment.TopCenter)
                    .padding(16.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                Text(
                    text = "Vision Scanner Simulator (ML Kit Active):",
                    color = TextSecondary,
                    fontSize = 11.sp,
                    fontFamily = FontFamily.Monospace
                )
                Spacer(modifier = Modifier.height(6.dp))
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    Button(
                        onClick = { viewModel.onBarcodeDetected("8901262010114") },
                        colors = ButtonDefaults.buttonColors(containerColor = SurfaceElevated),
                        border = BorderStroke(1.dp, BorderLuminous),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text("Amul Milk", fontSize = 11.sp, color = TextPrimary)
                    }
                    Button(
                        onClick = { viewModel.onBarcodeDetected("8901030383321") },
                        colors = ButtonDefaults.buttonColors(containerColor = SurfaceElevated),
                        border = BorderStroke(1.dp, BorderLuminous),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text("Atta 5kg", fontSize = 11.sp, color = TextPrimary)
                    }
                    Button(
                        onClick = { viewModel.onBarcodeDetected("8901058852441") },
                        colors = ButtonDefaults.buttonColors(containerColor = SurfaceElevated),
                        border = BorderStroke(1.dp, BorderRose),
                        contentPadding = PaddingValues(horizontal = 10.dp, vertical = 4.dp)
                    ) {
                        Text("Maggi", fontSize = 11.sp, color = NeonRose)
                    }
                }
            }

            // Lookup Error Banner
            uiState.errorMessage?.let { errorMsg ->
                Card(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .fillMaxWidth()
                        .padding(16.dp),
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceElevated),
                    border = BorderStroke(1.dp, BorderRose)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp)
                    ) {
                        Text(
                            text = errorMsg,
                            color = NeonRose,
                            fontSize = 13.sp,
                            fontFamily = FontFamily.Monospace,
                            fontWeight = FontWeight.SemiBold
                        )
                        Spacer(modifier = Modifier.height(10.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.End
                        ) {
                            Button(
                                onClick = { viewModel.dismissProduct() },
                                colors = ButtonDefaults.buttonColors(containerColor = SurfaceSecondary),
                                border = BorderStroke(1.dp, BorderRose)
                            ) {
                                Text("Dismiss & Retry", color = TextPrimary, fontSize = 12.sp)
                            }
                        }
                    }
                }
            }

            // Bottom Status / Scanned Product Popup
            uiState.scannedProduct?.let { product ->
                Card(
                    modifier = Modifier
                        .align(Alignment.BottomCenter)
                        .fillMaxWidth()
                        .padding(16.dp),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceElevated),
                    border = BorderStroke(1.dp, BorderLuminous)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(16.dp)
                    ) {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Icon(
                                Icons.Default.CheckCircle,
                                contentDescription = null,
                                tint = CeruleanGlow
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                "SKU Barcode Detected",
                                fontWeight = FontWeight.Bold,
                                color = CeruleanGlow,
                                fontSize = 13.sp,
                                fontFamily = FontFamily.Monospace
                            )
                        }
                        Spacer(modifier = Modifier.height(8.dp))
                        Text(
                            product.name,
                            fontWeight = FontWeight.Bold,
                            fontSize = 15.sp,
                            color = TextPrimary
                        )
                        Text(
                            "${product.brand} • ${product.aisleLocation ?: "Aisle 1"}",
                            fontSize = 12.sp,
                            color = TextSecondary
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                "₹${product.price.toInt()}",
                                fontWeight = FontWeight.Black,
                                fontSize = 18.sp,
                                fontFamily = FontFamily.Monospace,
                                color = TextPrimary
                            )
                            Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                                OutlinedButton(
                                    onClick = { viewModel.dismissProduct() },
                                    border = BorderStroke(1.dp, BorderLuminous)
                                ) {
                                    Text("Dismiss", color = TextSecondary)
                                }
                                Button(
                                    onClick = { viewModel.addScannedProductToCart() },
                                    colors = ButtonDefaults.buttonColors(containerColor = CeruleanBlue)
                                ) {
                                    Text("Add to Cart", color = Color.White, fontWeight = FontWeight.Bold)
                                }
                            }
                        }
                    }
                }
            }

            // Manual Barcode Dialog
            if (showManualDialog) {
                AlertDialog(
                    onDismissRequest = { showManualDialog = false },
                    containerColor = SurfaceElevated,
                    title = { Text("Manual SKU Entry", fontWeight = FontWeight.Bold, color = TextPrimary) },
                    text = {
                        Column {
                            Text("Enter 13-digit EAN barcode:", color = TextSecondary, fontSize = 12.sp)
                            Spacer(modifier = Modifier.height(8.dp))
                            OutlinedTextField(
                                value = manualBarcodeInput,
                                onValueChange = { manualBarcodeInput = it },
                                modifier = Modifier.fillMaxWidth(),
                                placeholder = { Text("e.g. 8901262010114", color = TextMuted) },
                                singleLine = true,
                                colors = OutlinedTextFieldDefaults.colors(
                                    focusedContainerColor = SurfaceSecondary,
                                    unfocusedContainerColor = SurfaceSecondary,
                                    focusedTextColor = TextPrimary,
                                    unfocusedTextColor = TextPrimary,
                                    focusedBorderColor = CeruleanBlue,
                                    unfocusedBorderColor = BorderLuminous
                                )
                            )
                        }
                    },
                    confirmButton = {
                        Button(
                            onClick = {
                                if (manualBarcodeInput.isNotBlank()) {
                                    viewModel.onBarcodeDetected(manualBarcodeInput.trim())
                                    showManualDialog = false
                                    manualBarcodeInput = ""
                                }
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = CeruleanBlue)
                        ) {
                            Text("Lookup SKU", color = Color.White, fontWeight = FontWeight.Bold)
                        }
                    },
                    dismissButton = {
                        TextButton(onClick = { showManualDialog = false }) {
                            Text("Cancel", color = TextSecondary)
                        }
                    }
                )
            }
        }
    }
}
