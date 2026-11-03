package com.smartqueue.app.ui.screens.queue

import androidx.compose.foundation.BorderStroke
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
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.smartqueue.app.ui.theme.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QueueScreen(
    onNavigateBack: () -> Unit,
    viewModel: QueueViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()

    Scaffold(
        containerColor = JetBlack,
        topBar = {
            TopAppBar(
                colors = TopAppBarDefaults.topAppBarColors(
                    containerColor = JetBlack,
                    titleContentColor = TextPrimary
                ),
                title = { Text("Smart Queue Token", fontWeight = FontWeight.Bold) },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Back", tint = TextPrimary)
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
                    shape = RoundedCornerShape(24.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceElevated),
                    border = BorderStroke(1.dp, BorderLuminous),
                    elevation = CardDefaults.cardElevation(defaultElevation = 0.dp)
                ) {
                    Column(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(24.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            "LIVE QUEUE TOKEN",
                            style = MaterialTheme.typography.labelSmall,
                            fontWeight = FontWeight.Bold,
                            color = CeruleanGlow,
                            letterSpacing = 1.5.sp
                        )

                        Text(
                            text = uiState.ticket?.ticketNumber ?: "Q-104",
                            fontSize = 60.sp,
                            fontWeight = FontWeight.Black,
                            fontFamily = FontFamily.Monospace,
                            color = TextPrimary,
                            modifier = Modifier.padding(vertical = 8.dp)
                        )

                        val status = uiState.ticket?.status ?: "WAITING"
                        val isCalled = status == "CALLED" || status == "SERVING"

                        Surface(
                            shape = RoundedCornerShape(50),
                            color = if (isCalled) NeonRose else CeruleanBlue.copy(alpha = 0.2f),
                            border = BorderStroke(1.dp, if (isCalled) NeonRose else CeruleanBlue),
                            modifier = Modifier.padding(bottom = 16.dp)
                        ) {
                            Text(
                                text = if (isCalled) "NOW SERVING • HEAD TO COUNTER" else "ESTIMATING BEST LANE",
                                color = if (isCalled) Color.White else CeruleanGlow,
                                fontWeight = FontWeight.Bold,
                                fontFamily = FontFamily.Monospace,
                                fontSize = 11.sp,
                                modifier = Modifier.padding(horizontal = 16.dp, vertical = 6.dp)
                            )
                        }

                        HorizontalDivider(color = BorderLuminous, thickness = 1.dp)

                        Spacer(modifier = Modifier.height(18.dp))

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.SpaceEvenly
                        ) {
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("Ahead of You", style = MaterialTheme.typography.labelSmall, color = TextSecondary)
                                Text(
                                    "${uiState.ticketsAhead} Shoppers",
                                    fontWeight = FontWeight.Bold,
                                    fontFamily = FontFamily.Monospace,
                                    fontSize = 15.sp,
                                    color = TextPrimary
                                )
                            }
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("Est. Wait", style = MaterialTheme.typography.labelSmall, color = TextSecondary)
                                Text(
                                    "~${uiState.estimatedWaitMinutes} Mins",
                                    fontWeight = FontWeight.Black,
                                    fontFamily = FontFamily.Monospace,
                                    fontSize = 15.sp,
                                    color = NeonRose
                                )
                            }
                            Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                Text("Assigned Lane", style = MaterialTheme.typography.labelSmall, color = TextSecondary)
                                Text(
                                    uiState.calledCounterNumber?.let { "Counter $it" } ?: "Auto-Routing",
                                    fontWeight = FontWeight.Bold,
                                    fontFamily = FontFamily.Monospace,
                                    fontSize = 15.sp,
                                    color = CeruleanGlow
                                )
                            }
                        }
                    }
                }

                // Live status instruction
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = SurfaceSecondary),
                    border = BorderStroke(1.dp, BorderRose),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(Icons.Default.HourglassTop, contentDescription = null, tint = NeonRose)
                        Spacer(modifier = Modifier.width(12.dp))
                        Text(
                            "Feel free to explore! You will receive an audio chime and prompt when your assigned counter calls your token.",
                            fontSize = 12.sp,
                            color = TextSecondary
                        )
                    }
                }
            }

            // Leave Queue Button
            OutlinedButton(
                onClick = { viewModel.cancelTicket(onNavigateBack) },
                modifier = Modifier
                    .fillMaxWidth()
                    .height(48.dp),
                shape = RoundedCornerShape(12.dp),
                colors = ButtonDefaults.outlinedButtonColors(contentColor = TextSecondary),
                border = BorderStroke(1.dp, BorderLuminous)
            ) {
                Text("Leave Queue", fontFamily = FontFamily.Monospace, fontSize = 13.sp)
            }
        }
    }

    // Called to Counter Alert Dialog
    if (uiState.isCalledAlert) {
        AlertDialog(
            onDismissRequest = { viewModel.dismissCalledAlert() },
            containerColor = SurfaceElevated,
            icon = {
                Icon(
                    Icons.Default.NotificationsActive,
                    contentDescription = null,
                    tint = NeonRose,
                    modifier = Modifier.size(36.dp)
                )
            },
            title = {
                Text(
                    "It's Your Turn!",
                    fontWeight = FontWeight.Black,
                    fontSize = 20.sp,
                    color = NeonRose
                )
            },
            text = {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "Ticket #${uiState.ticket?.ticketNumber ?: ""}",
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold,
                        fontFamily = FontFamily.Monospace,
                        color = TextPrimary
                    )
                    Spacer(modifier = Modifier.height(8.dp))
                    Text(
                        text = "Please proceed to Counter ${uiState.calledCounterNumber ?: "1"} (${uiState.calledCounterName ?: "Express Lane"}) to complete your checkout.",
                        fontSize = 13.sp,
                        color = TextSecondary
                    )
                }
            },
            confirmButton = {
                Button(
                    onClick = { viewModel.dismissCalledAlert() },
                    colors = ButtonDefaults.buttonColors(containerColor = CeruleanBlue)
                ) {
                    Text("Got It, Heading to Counter", color = Color.White, fontWeight = FontWeight.Bold)
                }
            }
        )
    }
}
