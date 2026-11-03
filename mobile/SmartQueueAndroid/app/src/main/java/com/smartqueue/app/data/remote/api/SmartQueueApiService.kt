package com.smartqueue.app.data.remote.api

import com.smartqueue.app.data.remote.dto.*
import retrofit2.http.*

interface SmartQueueApiService {

    // Authentication
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): ApiResponse<AuthResponseData>

    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): ApiResponse<AuthResponseData>

    @GET("auth/me")
    suspend fun getCurrentUser(): ApiResponse<AuthUserData>

    // Store & NFC resolution
    @POST("stores/resolve-tag")
    suspend fun resolveTag(@Body request: ResolveTagRequest): ApiResponse<ResolveTagResponse>

    // Catalog & Products
    @GET("categories")
    suspend fun getCategories(): ApiResponse<List<CategoryDto>>

    @GET("products")
    suspend fun getProducts(
        @Query("search") search: String? = null,
        @Query("categoryId") categoryId: String? = null,
        @Query("isHealthyPick") isHealthyPick: Boolean? = null,
        @Query("isTrending") isTrending: Boolean? = null,
        @Query("limit") limit: Int = 50
    ): ApiResponse<ProductListResponse>

    @GET("products/barcode/{barcode}")
    suspend fun getProductByBarcode(
        @Path("barcode") barcode: String
    ): ApiResponse<ProductDto>

    // Cart
    @GET("cart")
    suspend fun getCart(): ApiResponse<CartResponse>

    @POST("cart/items")
    suspend fun addToCart(@Body request: AddToCartRequest): ApiResponse<CartDto>

    @PUT("cart/items/{productId}")
    suspend fun updateCartItem(
        @Path("productId") productId: String,
        @Body request: UpdateCartItemRequest
    ): ApiResponse<CartDto>

    @DELETE("cart/items/{productId}")
    suspend fun removeCartItem(
        @Path("productId") productId: String
    ): ApiResponse<CartDto>

    @DELETE("cart")
    suspend fun clearCart(): ApiResponse<CartDto>

    // Queue
    @POST("queue/join")
    suspend fun joinQueue(@Body request: JoinQueueRequest): ApiResponse<QueueJoinResponse>

    @GET("queue/ticket/current")
    suspend fun getCurrentTicket(): ApiResponse<QueueJoinResponse>

    @POST("queue/ticket/{id}/cancel")
    suspend fun cancelTicket(@Path("id") ticketId: String): ApiResponse<Map<String, String>>

    // AI Assistant
    @POST("recommendations/ai-assistant")
    suspend fun queryAIAssistant(@Body request: AIAssistantRequest): ApiResponse<AIAssistantResponse>
}
