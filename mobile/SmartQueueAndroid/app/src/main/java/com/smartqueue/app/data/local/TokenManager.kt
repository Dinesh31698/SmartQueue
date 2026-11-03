package com.smartqueue.app.data.local

import android.content.Context
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

private val Context.dataStore by preferencesDataStore(name = "smartqueue_prefs")

@Singleton
class TokenManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    companion object {
        private val KEY_TOKEN = stringPreferencesKey("jwt_token")
        private val KEY_USER_ID = stringPreferencesKey("user_id")
        private val KEY_USER_NAME = stringPreferencesKey("user_name")
        private val KEY_USER_EMAIL = stringPreferencesKey("user_email")
        private val KEY_STORE_CODE = stringPreferencesKey("store_code")
    }

    val tokenFlow: Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[KEY_TOKEN]
    }

    val storeCodeFlow: Flow<String> = context.dataStore.data.map { preferences ->
        preferences[KEY_STORE_CODE] ?: "STORE-001"
    }

    suspend fun saveAuth(token: String, userId: String, name: String, email: String) {
        context.dataStore.edit { preferences ->
            preferences[KEY_TOKEN] = token
            preferences[KEY_USER_ID] = userId
            preferences[KEY_USER_NAME] = name
            preferences[KEY_USER_EMAIL] = email
        }
    }

    suspend fun saveStoreCode(storeCode: String) {
        context.dataStore.edit { preferences ->
            preferences[KEY_STORE_CODE] = storeCode
        }
    }

    suspend fun clearAuth() {
        context.dataStore.edit { preferences ->
            preferences.remove(KEY_TOKEN)
            preferences.remove(KEY_USER_ID)
            preferences.remove(KEY_USER_NAME)
            preferences.remove(KEY_USER_EMAIL)
        }
    }
}
