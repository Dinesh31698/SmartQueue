package com.smartqueue.app

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class SmartQueueApp : Application() {
    override fun onCreate() {
        super.onCreate()
    }
}
