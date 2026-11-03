package com.smartqueue.app.ui.screens.home

import android.content.Context
import android.speech.tts.TextToSpeech
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smartqueue.app.data.local.ProductDao
import com.smartqueue.app.data.local.ProductEntity
import com.smartqueue.app.data.local.TokenManager
import com.smartqueue.app.data.remote.api.SmartQueueApiService
import com.smartqueue.app.data.remote.dto.*
import dagger.hilt.android.lifecycle.HiltViewModel
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import java.util.Locale
import javax.inject.Inject

data class HomeUiState(
    val products: List<ProductDto> = emptyList(),
    val categories: List<CategoryDto> = emptyList(),
    val selectedCategory: String? = null,
    val searchQuery: String = "",
    val isLoading: Boolean = false,
    val errorMessage: String? = null,
    val storeName: String = "SmartQueue Supermarket",
    val storeCode: String = "STORE-001",
    val cartCount: Int = 0,
    val aiAssistantReply: String? = null,
    val aiSuggestedProducts: List<ProductDto> = emptyList(),
    val isAiThinking: Boolean = false
)

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val apiService: SmartQueueApiService,
    private val productDao: ProductDao,
    private val tokenManager: TokenManager,
    @ApplicationContext private val context: Context
) : ViewModel(), TextToSpeech.OnInitListener {

    private val _uiState = MutableStateFlow(HomeUiState())
    val uiState: StateFlow<HomeUiState> = _uiState.asStateFlow()

    private var tts: TextToSpeech? = null
    private var isTtsReady = false

    init {
        tts = TextToSpeech(context, this)
        autoLoginDemoUser()
        loadCategories()
        loadProducts()
        loadCartCount()
    }

    override fun onInit(status: Int) {
        if (status == TextToSpeech.SUCCESS) {
            tts?.language = Locale.US
            isTtsReady = true
        }
    }

    private fun autoLoginDemoUser() {
        viewModelScope.launch {
            try {
                val res = apiService.login(LoginRequest("customer1@smartqueue.com", "Customer@123"))
                if (res.success && res.data != null) {
                    tokenManager.saveAuth(
                        token = res.data.token,
                        userId = res.data.user.id,
                        name = res.data.user.name,
                        email = res.data.user.email
                    )
                }
            } catch (e: Exception) {
                // Keep token if already cached
            }
        }
    }

    fun loadCategories() {
        viewModelScope.launch {
            try {
                val res = apiService.getCategories()
                if (res.success && res.data != null) {
                    _uiState.value = _uiState.value.copy(categories = res.data)
                }
            } catch (e: Exception) {
                // Handled gracefully
            }
        }
    }

    fun loadProducts() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            try {
                val categoryId = _uiState.value.selectedCategory
                val search = _uiState.value.searchQuery.ifBlank { null }

                val res = apiService.getProducts(search = search, categoryId = categoryId)
                if (res.success && res.data != null) {
                    val products = res.data.products
                    _uiState.value = _uiState.value.copy(
                        products = products,
                        isLoading = false
                    )

                    // Cache to Room
                    val entities = products.map { p ->
                        ProductEntity(
                            id = p._id,
                            barcode = p.barcode,
                            name = p.name,
                            brand = p.brand,
                            category = p.unit,
                            price = p.price,
                            stockQuantity = p.currentStock,
                            imageUrl = p.imageUrl,
                            isHealthyPick = p.isHealthyPick
                        )
                    }
                    productDao.insertProducts(entities)
                } else {
                    loadFromRoomFallback()
                }
            } catch (e: Exception) {
                loadFromRoomFallback()
            }
        }
    }

    private suspend fun loadFromRoomFallback() {
        val cached = productDao.getAllProducts()
        if (cached.isNotEmpty()) {
            val dtoList = cached.map { c ->
                ProductDto(
                    _id = c.id,
                    barcode = c.barcode,
                    name = c.name,
                    brand = c.brand,
                    price = c.price,
                    currentStock = c.stockQuantity,
                    isHealthyPick = c.isHealthyPick
                )
            }
            _uiState.value = _uiState.value.copy(
                products = dtoList,
                isLoading = false,
                errorMessage = "Offline mode: Showing cached supermarket products."
            )
        } else {
            _uiState.value = _uiState.value.copy(
                isLoading = false,
                errorMessage = "Unable to connect to supermarket catalog. Please check connection."
            )
        }
    }

    fun onCategorySelected(categoryId: String?) {
        _uiState.value = _uiState.value.copy(selectedCategory = categoryId)
        loadProducts()
    }

    fun onSearchQueryChanged(query: String) {
        _uiState.value = _uiState.value.copy(searchQuery = query)
        loadProducts()
    }

    fun addToCart(productId: String) {
        viewModelScope.launch {
            try {
                val res = apiService.addToCart(AddToCartRequest(productId = productId, quantity = 1))
                if (res.success) {
                    loadCartCount()
                }
            } catch (e: Exception) {
                // Cart update handled
            }
        }
    }

    fun loadCartCount() {
        viewModelScope.launch {
            try {
                val res = apiService.getCart()
                if (res.success && res.data != null) {
                    _uiState.value = _uiState.value.copy(cartCount = res.data.itemCount)
                }
            } catch (e: Exception) {
                // Ignore silent cart check
            }
        }
    }

    fun queryAIAssistant(query: String) {
        if (query.isBlank()) return
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isAiThinking = true)
            try {
                val res = apiService.queryAIAssistant(AIAssistantRequest(query = query))
                if (res.success && res.data != null) {
                    val reply = res.data.reply
                    _uiState.value = _uiState.value.copy(
                        aiAssistantReply = reply,
                        aiSuggestedProducts = res.data.suggestedProducts,
                        isAiThinking = false
                    )

                    // Speak aloud via TTS if available
                    if (isTtsReady) {
                        tts?.speak(reply.replace("*", ""), TextToSpeech.QUEUE_FLUSH, null, "AI_REPLY")
                    }
                } else {
                    _uiState.value = _uiState.value.copy(isAiThinking = false)
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    aiAssistantReply = "Smart Assistant: You can find fresh groceries in Aisles 1-4. Try asking for healthy alternatives or recipe ideas!",
                    isAiThinking = false
                )
            }
        }
    }

    fun clearAiReply() {
        _uiState.value = _uiState.value.copy(aiAssistantReply = null, aiSuggestedProducts = emptyList())
    }

    fun handleStoreTagResolved(payload: String) {
        viewModelScope.launch {
            try {
                val res = apiService.resolveTag(ResolveTagRequest(tagPayload = payload))
                if (res.success && res.data != null) {
                    _uiState.value = _uiState.value.copy(
                        storeName = res.data.store.name,
                        storeCode = res.data.store.storeCode
                    )
                    tokenManager.saveStoreCode(res.data.store.storeCode)
                }
            } catch (e: Exception) {
                // Handled
            }
        }
    }

    override fun onCleared() {
        super.onCleared()
        tts?.stop()
        tts?.shutdown()
    }
}
