package com.smartqueue.app.ui.screens.queue

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.HourglassTop
import androidx.compose.material.icons.filled.NotificationsActive
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.smartqueue.app.ui.theme.PrimaryGreen

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QueueScreen(
    onNavigateBack: () -> Unit,
    viewModel: QueueViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Smart Queue Ticket", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
                .padding(20.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.SpaceBetween
        ) {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.fillMaxWidth()
            ) {
                // Ticket Card
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 16.dp),
                    shape = RoundedCornerShape(20.dp),
                    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
                    elevation = CardDefaults.cardElevation(defaultElevation = 3.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            "YOUR QUEUE NUMBER",
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = Color.Gray,
                            letterSpacing = 1.sp
                        )

                        Text(
                            text = uiState.ticket?.ticketNumber ?: "Q-104",
                            fontSize = 54.sp,
                            fontWeight = FontWeight.Black,
                            color = MaterialTheme.colorScheme.secondary,
                            modifier = Modifier.padding(vertical = 8.dp)
                        )

                        val status = uiState.ticket?.status ?: "WAITING"
                        val isCalled = status == "CALLED" || status == "SERVING"

                        Surface(
                            shape = RoundedCornerShape(50),
                            color = if (isCalled) Color(0xFFFEF3C7) else PrimaryGreen.copy(alpha = 0.15f),
                            modifier = Modifier.padding(bottom = 16.dp)
                        ) {
                            Text(
                                text = if (isCalled) "PROCEED TO COUNTER" else "WAITING FOR CASHIER",
                                color = if (isCalled) Color(0xFFD97706) else PrimaryGreen,
                                fontWeight = FontWeight.Bold,
                                fontSize = 11.sp,
                                modifier = Modifier.padding(horizontal = 14.dp, vertical = 6.dp)
                            )
                        }

                        Divider(color = Color.LightGray.copy(alpha = 0.4f), thickness = 1.dp)

                        Spacer(modifier = Modifier.height(16.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceEvenly
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("Ahead of You", style = MaterialTheme.typography.labelSmall, color = Color.Gray)
                                Text("${uiState.ticketsAhead} Shoppers", fontWeight = FontWeight.Bold, fontSize = 16.sp)
                            }
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("Est. Wait", style = MaterialTheme.typography.labelSmall, color = Color.Gray)
                                Text(
                                    "~${uiState.estimatedWaitMinutes} Mins",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 16.sp,
                                    color = PrimaryGreen
                                )
                            }
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("Assigned Lane", style = MaterialTheme.typography.labelSmall, color = Color.Gray)
                                Text(
                                    uiState.calledCounterNumber?.let { "Counter $it" } ?: "Auto-Routing",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 16.sp
                                )
                            }
                        }
                    }
                }

                // Live status instruction
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFFEF3C7)),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.HourglassTop, contentDescription = null, tint = Color(0xFFD97706))
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            "Continue shopping! You will receive an audio chime and notification when your counter is ready.",
                            fontSize = 12.sp,
                            color = Color(0xFF92400E)
                        )
                    }
                }
            }

            // Leave Queue Button
            OutlinedButton(
                onClick = { viewModel.cancelTicket(onNavigateBack) },
                modifier = Modifier.fillMaxWidth(),
                shape = RoundedCornerShape(12.dp)
            ) {
                Text("Leave Queue")
            }
        }
    }

    // Called to Counter Alert Dialog
    if (uiState.isCalledAlert) {
        AlertDialog(
            onDismissRequest = { viewModel.dismissCalledAlert() },
            icon = {
                Icon(
                    Icons.Default.NotificationsActive,
                    contentDescription = null,
                    tint = PrimaryGreen,
                    modifier = Modifier.size(36.dp)
                )
            },
            title = {
                Text(
                    "It's Your Turn!",
                    fontWeight = FontWeight.Black,
                    fontSize = 20.sp,
                    color = PrimaryGreen
                )
            },
            text = {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "Ticket #${uiState.ticket?.ticketNumber ?: ""}",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Please proceed to Counter ${uiState.calledCounterNumber ?: "1"} (${uiState.calledCounterName ?: "Express Lane"}) to complete your checkout.",
                        fontSize = 14.sp
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = { viewModel.dismissCalledAlert() },
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryGreen)
                ) {
                    Text("Got It, Heading to Counter")
                }
            }
        )
    }
}
