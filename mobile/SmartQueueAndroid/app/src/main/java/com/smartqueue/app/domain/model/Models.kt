package com.smartqueue.app.domain.model

import kotlinx.serialization.Serializable

@Serializable
data class User(
    val id: String,
    val name: String,
    val email: String,
    val phone: String? = null,
    val role: String = "CUSTOMER",
    val storeId: String? = null
)

@Serializable
data class Product(
    val id: String,
    val barcode: String,
    val name: String,
    val brand: String,
    val category: String,
    val price: Double,
    val stockQuantity: Int,
    val imageUrl: String? = null,
    val isHealthyPick: Boolean = false,
    val isTrending: Boolean = false
)

@Serializable
data class CartItem(
    val product: Product,
    val quantity: Int
)

@Serializable
data class QueueTicket(
    val id: String,
    val storeId: String,
    val ticketNumber: String,
    val paymentMethod: String,
    val status: String,
    val estimatedWaitMinutes: Int = 0,
    val joinedAt: String,
    val calledAt: String? = null,
    val counterNumber: String? = null
)

@Serializable
data class Order(
    val id: String,
    val orderNumber: String,
    val totalAmount: Double,
    val paymentMethod: String,
    val paymentStatus: String,
    val orderStatus: String,
    val createdAt: String
)
