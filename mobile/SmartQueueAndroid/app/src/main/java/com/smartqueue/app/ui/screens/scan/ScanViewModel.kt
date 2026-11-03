package com.smartqueue.app.ui.screens.scan

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smartqueue.app.data.local.ProductDao
import com.smartqueue.app.data.remote.api.SmartQueueApiService
import com.smartqueue.app.data.remote.dto.AddToCartRequest
import com.smartqueue.app.data.remote.dto.ProductDto
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class ScanUiState(
    val scannedProduct: ProductDto? = null,
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val isAddedToCart: Boolean = false,
    val lastScannedBarcode: String? = null
)

@HiltViewModel
class ScanViewModel @Inject constructor(
    private val apiService: SmartQueueApiService,
    private val productDao: ProductDao
) : ViewModel() {

    private val _uiState = MutableStateFlow(ScanUiState())
    val uiState: StateFlow<ScanUiState> = _uiState.asStateFlow()

    fun onBarcodeDetected(barcode: String) {
        val trimmed = barcode.trim()
        if (trimmed.isEmpty() || trimmed == _uiState.value.lastScannedBarcode) return

        _uiState.value = _uiState.value.copy(
            isLoading = true,
            errorMessage = null,
            isAddedToCart = false,
            lastScannedBarcode = trimmed
        )

        viewModelScope.launch {
            try {
                val res = apiService.getProductByBarcode(trimmed)
                if (res.success && res.data != null) {
                    _uiState.value = _uiState.value.copy(
                        scannedProduct = res.data,
                        isLoading = false
                    )
                } else {
                    // Try local Room cache fallback
                    val cached = productDao.getProductByBarcode(trimmed)
                    if (cached != null) {
                        _uiState.value = _uiState.value.copy(
                            scannedProduct = ProductDto(
                                _id = cached.id,
                                barcode = cached.barcode,
                                name = cached.name,
                                brand = cached.brand,
                                price = cached.price,
                                currentStock = cached.stockQuantity,
                                isHealthyPick = cached.isHealthyPick
                            ),
                            isLoading = false
                        )
                    } else {
                        _uiState.value = _uiState.value.copy(
                            isLoading = false,
                            errorMessage = res.error ?: "Product with barcode $trimmed not found in store."
                        )
                    }
                }
            } catch (e: Exception) {
                // Try local Room cache fallback
                val cached = productDao.getProductByBarcode(trimmed)
                if (cached != null) {
                    _uiState.value = _uiState.value.copy(
                        scannedProduct = ProductDto(
                            _id = cached.id,
                            barcode = cached.barcode,
                            name = cached.name,
                            brand = cached.brand,
                            price = cached.price,
                            currentStock = cached.stockQuantity,
                            isHealthyPick = cached.isHealthyPick
                        ),
                        isLoading = false
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        errorMessage = "Could not resolve barcode $trimmed. Verify network connection."
                    )
                }
            }
        }
    }

    fun addScannedProductToCart() {
        val product = _uiState.value.scannedProduct ?: return
        viewModelScope.launch {
            try {
                val res = apiService.addToCart(AddToCartRequest(productId = product._id, quantity = 1))
                if (res.success) {
                    _uiState.value = _uiState.value.copy(isAddedToCart = true)
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(isAddedToCart = true) // optimistic feedback
            }
        }
    }

    fun dismissProduct() {
        _uiState.value = _uiState.value.copy(
            scannedProduct = null,
            lastScannedBarcode = null,
            isAddedToCart = false,
            errorMessage = null
        )
    }
}
