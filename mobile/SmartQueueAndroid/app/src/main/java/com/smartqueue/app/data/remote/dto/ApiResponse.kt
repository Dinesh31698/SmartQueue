package com.smartqueue.app.data.remote.dto

import kotlinx.serialization.Serializable

@Serializable
data class ApiResponse<T>(
    val success: Boolean,
    val data: T? = null,
    val message: String? = null,
    val error: String? = null
)

@Serializable
data class LoginRequest(
    val email: String,
    val password: String
)

@Serializable
data class RegisterRequest(
    val name: String,
    val email: String,
    val password: String,
    val phone: String = "",
    val storeCode: String = "STORE-001"
)

@Serializable
data class AuthUserData(
    val id: String,
    val name: String,
    val email: String,
    val phone: String = "",
    val role: String = "CUSTOMER"
)

@Serializable
data class AuthResponseData(
    val token: String,
    val user: AuthUserData
)

@Serializable
data class CategoryDto(
    val _id: String,
    val name: String,
    val slug: String,
    val icon: String? = null
)

@Serializable
data class ProductDto(
    val _id: String,
    val barcode: String,
    val name: String,
    val brand: String = "",
    val price: Double,
    val currentStock: Int = 0,
    val unit: String = "item",
    val aisleLocation: String? = null,
    val imageUrl: String? = null,
    val isHealthyPick: Boolean = false,
    val isTrending: Boolean = false
)

@Serializable
data class ProductListResponse(
    val products: List<ProductDto> = emptyList(),
    val total: Int = 0,
    val page: Int = 1,
    val pages: Int = 1
)

@Serializable
data class CartItemProductDto(
    val _id: String,
    val name: String,
    val brand: String = "",
    val barcode: String,
    val price: Double,
    val aisleLocation: String? = null
)

@Serializable
data class CartItemDto(
    val productId: CartItemProductDto,
    val quantity: Int,
    val priceAtAdd: Double
)

@Serializable
data class CartDto(
    val _id: String,
    val items: List<CartItemDto> = emptyList(),
    val subtotal: Double = 0.0
)

@Serializable
data class CartResponse(
    val cart: CartDto,
    val itemCount: Int = 0,
    val subtotal: Double = 0.0,
    val estimatedTax: Double = 0.0,
    val estimatedTotal: Double = 0.0
)

@Serializable
data class AddToCartRequest(
    val productId: String,
    val quantity: Int = 1
)

@Serializable
data class UpdateCartItemRequest(
    val quantity: Int
)

@Serializable
data class JoinQueueRequest(
    val storeId: String? = null,
    val notes: String = ""
)

@Serializable
data class CounterRef(
    val _id: String? = null,
    val counterNumber: String? = null,
    val name: String? = null
)

@Serializable
data class QueueTicketDto(
    val _id: String,
    val ticketNumber: String,
    val sequenceNumber: Int = 0,
    val status: String,
    val estimatedWaitTimeMinutes: Int = 0,
    val counterId: CounterRef? = null,
    val calledAt: String? = null,
    val createdAt: String? = null
)

@Serializable
data class QueueJoinResponse(
    val ticket: QueueTicketDto,
    val positionInQueue: Int = 1,
    val ticketsAhead: Int = 0,
    val estimatedWaitMinutes: Int = 3
)

@Serializable
data class AIAssistantRequest(
    val query: String,
    val storeId: String? = null
)

@Serializable
data class AIAssistantResponse(
    val reply: String,
    val suggestedProducts: List<ProductDto> = emptyList(),
    val intent: String = "GENERAL",
    val tips: List<String> = emptyList()
)

@Serializable
data class ResolveTagRequest(
    val tagPayload: String? = null,
    val qrCode: String? = null,
    val storeCode: String? = null
)

@Serializable
data class LiveStatusDto(
    val waitingTickets: Int = 0,
    val openCounters: Int = 0,
    val estimatedWaitMinutes: Int = 3
)

@Serializable
data class StoreDto(
    val _id: String,
    val storeCode: String,
    val name: String,
    val address: String = ""
)

@Serializable
data class ResolveTagResponse(
    val store: StoreDto,
    val liveStatus: LiveStatusDto
)
