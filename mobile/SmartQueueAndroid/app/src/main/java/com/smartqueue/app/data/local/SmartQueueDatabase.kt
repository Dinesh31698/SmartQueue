package com.smartqueue.app.data.local

import androidx.room.*

@Entity(tableName = "cached_products")
data class ProductEntity(
    @PrimaryKey val id: String,
    val barcode: String,
    val name: String,
    val brand: String,
    val category: String,
    val price: Double,
    val stockQuantity: Int,
    val imageUrl: String?,
    val isHealthyPick: Boolean
)

@Dao
interface ProductDao {
    @Query("SELECT * FROM cached_products")
    suspend fun getAllProducts(): List<ProductEntity>

    @Query("SELECT * FROM cached_products WHERE barcode = :barcode LIMIT 1")
    suspend fun getProductByBarcode(barcode: String): ProductEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertProducts(products: List<ProductEntity>)
}

@Database(entities = [ProductEntity::class], version = 1, exportSchema = false)
abstract class SmartQueueDatabase : RoomDatabase() {
    abstract fun productDao(): ProductDao
}
