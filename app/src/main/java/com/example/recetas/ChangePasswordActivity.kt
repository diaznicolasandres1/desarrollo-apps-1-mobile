package com.example.recetas

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.button.MaterialButton
import com.google.android.material.progressindicator.CircularProgressIndicator
import com.google.android.material.snackbar.Snackbar
import com.google.android.material.textfield.TextInputEditText
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

class ChangePasswordActivity : AppCompatActivity() {
    private lateinit var etNewPassword: TextInputEditText
    private lateinit var etConfirmPassword: TextInputEditText
    private lateinit var btnChangePassword: MaterialButton
    private lateinit var progressBar: CircularProgressIndicator
    private val client = OkHttpClient()
    private val BASE_URL = "https://desarrollo-apps-1-back-end.vercel.app"
    private val TAG = "ChangePasswordDebug"
    private lateinit var email: String
    private lateinit var recoveryCode: String

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_change_password)

        email = intent.getStringExtra("email") ?: ""
        recoveryCode = intent.getStringExtra("recoveryCode") ?: ""
        
        if (email.isEmpty() || recoveryCode.isEmpty()) {
            Log.e(TAG, "Email o código de recuperación no proporcionados")
            finish()
            return
        }

        etNewPassword = findViewById(R.id.etNewPassword)
        etConfirmPassword = findViewById(R.id.etConfirmPassword)
        btnChangePassword = findViewById(R.id.btnChangePassword)
        progressBar = findViewById(R.id.progressBar)

        btnChangePassword.setOnClickListener {
            val newPassword = etNewPassword.text.toString()
            val confirmPassword = etConfirmPassword.text.toString()

            when {
                newPassword.isEmpty() || confirmPassword.isEmpty() -> {
                    Snackbar.make(it, "Por favor complete todos los campos", Snackbar.LENGTH_SHORT).show()
                }
                newPassword != confirmPassword -> {
                    Snackbar.make(it, "Las contraseñas no coinciden", Snackbar.LENGTH_SHORT).show()
                }
                else -> {
                    setLoadingState(true)
                    changePassword(newPassword)
                }
            }
        }
    }

    private fun setLoadingState(isLoading: Boolean) {
        btnChangePassword.isEnabled = !isLoading
        progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
        etNewPassword.isEnabled = !isLoading
        etConfirmPassword.isEnabled = !isLoading
    }

    private fun changePassword(newPassword: String) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val jsonBody = "{\"email\":\"$email\",\"newPassword\":\"$newPassword\",\"recoveryCode\":\"$recoveryCode\"}"
                Log.d(TAG, "Intentando cambiar contraseña con: $jsonBody")
                
                val request = Request.Builder()
                    .url("$BASE_URL/users/change-password")
                    .put(jsonBody.toRequestBody("application/json".toMediaType()))
                    .build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string()
                Log.d(TAG, "Código de respuesta: ${response.code}")
                Log.d(TAG, "Cuerpo de respuesta: $responseBody")

                withContext(Dispatchers.Main) {
                    setLoadingState(false)
                    when (response.code) {
                        200 -> {
                            Log.d(TAG, "Contraseña cambiada exitosamente")
                            Snackbar.make(
                                findViewById(android.R.id.content),
                                "Contraseña cambiada exitosamente",
                                Snackbar.LENGTH_SHORT
                            ).show()
                            findViewById<android.view.View>(android.R.id.content).postDelayed({
                                startActivity(Intent(this@ChangePasswordActivity, LoginActivity::class.java))
                                finishAffinity()
                            }, 1500)
                        }
                        else -> {
                            Log.d(TAG, "Error al cambiar la contraseña: ${response.code}")
                            Snackbar.make(
                                findViewById(android.R.id.content),
                                "Error al cambiar la contraseña",
                                Snackbar.LENGTH_SHORT
                            ).show()
                        }
                    }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error de conexión", e)
                Log.e(TAG, "Mensaje de error: ${e.message}")
                withContext(Dispatchers.Main) {
                    setLoadingState(false)
                    Snackbar.make(
                        findViewById(android.R.id.content),
                        "Error de conexión",
                        Snackbar.LENGTH_SHORT
                    ).show()
                }
            }
        }
    }
} 