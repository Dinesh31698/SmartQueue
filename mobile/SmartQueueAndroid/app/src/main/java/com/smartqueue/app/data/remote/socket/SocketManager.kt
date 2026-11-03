package com.smartqueue.app.data.remote.socket

import android.content.Context
import android.media.RingtoneManager
import android.os.Build
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import android.util.Log
import dagger.hilt.android.qualifiers.ApplicationContext
import io.socket.client.IO
import io.socket.client.Socket
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.launch
import org.json.JSONObject
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class SocketManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private var socket: Socket? = null
    private val scope = CoroutineScope(Dispatchers.IO)

    private val _queueEvents = MutableSharedFlow<JSONObject>(extraBufferCapacity = 10)
    val queueEvents: SharedFlow<JSONObject> = _queueEvents

    private val _customerCalledEvents = MutableSharedFlow<JSONObject>(extraBufferCapacity = 10)
    val customerCalledEvents: SharedFlow<JSONObject> = _customerCalledEvents

    init {
        try {
            val options = IO.Options().apply {
                reconnection = true
                reconnectionAttempts = 10
                reconnectionDelay = 2000
                timeout = 10000
            }
            socket = IO.socket("http://10.0.2.2:5000", options)
            setupListeners()
            socket?.connect()
        } catch (e: Exception) {
            Log.e("SocketManager", "Socket initialization error: ${e.message}")
        }
    }

    private fun setupListeners() {
        socket?.on(Socket.EVENT_CONNECT) {
            Log.d("SocketManager", "Connected to SmartQueue Socket.IO server")
            joinStore("STORE-001")
        }

        socket?.on("queue_updated") { args ->
            if (args.isNotEmpty() && args[0] is JSONObject) {
                val data = args[0] as JSONObject
                scope.launch { _queueEvents.emit(data) }
            }
        }

        socket?.on("customer_called") { args ->
            if (args.isNotEmpty() && args[0] is JSONObject) {
                val data = args[0] as JSONObject
                triggerAlertChimeAndVibration()
                scope.launch { _customerCalledEvents.emit(data) }
            }
        }

        socket?.on(Socket.EVENT_DISCONNECT) {
            Log.d("SocketManager", "Disconnected from SmartQueue Socket.IO server")
        }
    }

    fun joinStore(storeId: String) {
        socket?.emit("join_store", storeId)
    }

    fun joinUser(userId: String) {
        socket?.emit("join_user", userId)
    }

    private fun triggerAlertChimeAndVibration() {
        try {
            // Play notification ringtone chime
            val notificationUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
            val ringtone = RingtoneManager.getRingtone(context, notificationUri)
            ringtone?.play()

            // Vibrate pattern
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                val vibratorManager = context.getSystemService(Context.VIBRATOR_MANAGER_SERVICE) as? VibratorManager
                vibratorManager?.defaultVibrator?.vibrate(
                    VibrationEffect.createWaveform(longArrayOf(0, 300, 200, 400), -1)
                )
            } else {
                @Suppress("DEPRECATION")
                val vibrator = context.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
                @Suppress("DEPRECATION")
                vibrator?.vibrate(longArrayOf(0, 300, 200, 400), -1)
            }
        } catch (e: Exception) {
            Log.e("SocketManager", "Could not trigger alert chime: ${e.message}")
        }
    }
}
