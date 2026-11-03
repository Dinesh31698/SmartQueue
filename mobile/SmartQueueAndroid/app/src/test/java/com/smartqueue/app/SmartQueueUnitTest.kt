package com.smartqueue.app

import com.smartqueue.app.domain.model.Product
import com.smartqueue.app.domain.model.QueueTicket
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class SmartQueueUnitTest {

    @Test
    fun productModel_initialization_isCorrect() {
        val product = Product(
            id = "prod-001",
            barcode = "8901262010114",
            name = "Amul Milk 1L",
            brand = "Amul",
            category = "Dairy",
            price = 74.0,
            stockQuantity = 50,
            isHealthyPick = true
        )

        assertEquals("prod-001", product.id)
        assertEquals("8901262010114", product.barcode)
        assertTrue(product.isHealthyPick)
        assertEquals(74.0, product.price, 0.001)
    }

    @Test
    fun queueTicket_initialization_isCorrect() {
        val ticket = QueueTicket(
            id = "ticket-001",
            storeId = "STORE-001",
            ticketNumber = "Q-101",
            paymentMethod = "UPI",
            status = "WAITING",
            estimatedWaitMinutes = 3,
            joinedAt = "2026-11-03T10:00:00Z"
        )

        assertEquals("Q-101", ticket.ticketNumber)
        assertEquals("WAITING", ticket.status)
        assertEquals(3, ticket.estimatedWaitMinutes)
    }

    @Test
    fun nfcPayload_parsing_extractsStoreId() {
        val payload = "SMARTQUEUE:STORE:STORE-001"
        assertTrue(payload.startsWith("SMARTQUEUE:STORE:"))
        val storeId = payload.substringAfter("SMARTQUEUE:STORE:").trim()
        assertEquals("STORE-001", storeId)
    }
}
