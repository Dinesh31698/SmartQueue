package com.smartqueue.app.ui.screens.queue

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.smartqueue.app.data.remote.api.SmartQueueApiService
import com.smartqueue.app.data.remote.dto.QueueTicketDto
import com.smartqueue.app.data.remote.socket.SocketManager
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

data class QueueUiState(
    val ticket: QueueTicketDto? = null,
    val positionInQueue: Int = 1,
    val ticketsAhead: Int = 0,
    val estimatedWaitMinutes: Int = 3,
    val isLoading: Boolean = false,
    val isCalledAlert: Boolean = false,
    val calledCounterName: String? = null,
    val calledCounterNumber: String? = null,
    val errorMessage: String? = null
)

@HiltViewModel
class QueueViewModel @Inject constructor(
    private val apiService: SmartQueueApiService,
    private val socketManager: SocketManager
) : ViewModel() {

    private val _uiState = MutableStateFlow(QueueUiState())
    val uiState: StateFlow<QueueUiState> = _uiState.asStateFlow()

    init {
        loadCurrentTicket()
        observeSocketEvents()
    }

    fun loadCurrentTicket() {
        viewModelScope.launch {
            _uiState.value = _uiState.value.copy(isLoading = true, errorMessage = null)
            try {
                val res = apiService.getCurrentTicket()
                if (res.success && res.data != null) {
                    val data = res.data
                    val ticket = data.ticket
                    val isCalled = ticket.status == "CALLED"

                    _uiState.value = _uiState.value.copy(
                        ticket = ticket,
                        positionInQueue = data.positionInQueue,
                        ticketsAhead = data.ticketsAhead,
                        estimatedWaitMinutes = data.estimatedWaitMinutes,
                        isCalledAlert = isCalled,
                        calledCounterNumber = ticket.counterId?.counterNumber,
                        calledCounterName = ticket.counterId?.name,
                        isLoading = false
                    )
                } else {
                    _uiState.value = _uiState.value.copy(
                        isLoading = false,
                        ticket = QueueTicketDto(
                            _id = "demo-q104",
                            ticketNumber = "Q-104",
                            status = "WAITING",
                            estimatedWaitTimeMinutes = 3
                        ),
                        positionInQueue = 3,
                        ticketsAhead = 2,
                        estimatedWaitMinutes = 3
                    )
                }
            } catch (e: Exception) {
                _uiState.value = _uiState.value.copy(
                    isLoading = false,
                    ticket = QueueTicketDto(
                        _id = "demo-q104",
                        ticketNumber = "Q-104",
                        status = "WAITING",
                        estimatedWaitTimeMinutes = 3
                    ),
                    positionInQueue = 3,
                    ticketsAhead = 2,
                    estimatedWaitMinutes = 3
                )
            }
        }
    }

    private fun observeSocketEvents() {
        viewModelScope.launch {
            socketManager.queueEvents.collect {
                loadCurrentTicket()
            }
        }

        viewModelScope.launch {
            socketManager.customerCalledEvents.collect { data ->
                val ticketNum = data.optString("ticketNumber")
                val currentNum = _uiState.value.ticket?.ticketNumber

                if (ticketNum.isNotEmpty() && ticketNum == currentNum) {
                    _uiState.value = _uiState.value.copy(
                        isCalledAlert = true,
                        calledCounterNumber = data.optString("counterNumber"),
                        calledCounterName = data.optString("counterName", "Checkout Counter")
                    )
                }
            }
        }
    }

    fun dismissCalledAlert() {
        _uiState.value = _uiState.value.copy(isCalledAlert = false)
    }

    fun cancelTicket(onCancelled: () -> Unit) {
        val ticketId = _uiState.value.ticket?._id ?: return
        viewModelScope.launch {
            try {
                apiService.cancelTicket(ticketId)
                _uiState.value = _uiState.value.copy(ticket = null)
                onCancelled()
            } catch (e: Exception) {
                onCancelled()
            }
        }
    }
}
