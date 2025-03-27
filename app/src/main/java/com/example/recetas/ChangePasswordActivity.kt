package com.example.recetas

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.EditText
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.snackbar.Snackbar
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody

class ChangePasswordActivity : AppCompatActivity() {
    private lateinit var etNewPassword: EditText
    private lateinit var etConfirmPassword: EditText
    private lateinit var btnChangePassword: Button
    private val client = OkHttpClient()
    private lateinit var email: String

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_change_password)

        email = intent.getStringExtra("email") ?: ""
        if (email.isEmpty()) {
            finish()
            return
        }

        etNewPassword = findViewById(R.id.etNewPassword)
        etConfirmPassword = findViewById(R.id.etConfirmPassword)
        btnChangePassword = findViewById(R.id.btnChangePassword)

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
                    changePassword(newPassword)
                }
            }
        }
    }

    private fun changePassword(newPassword: String) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val jsonBody = "{\"email\":\"$email\",\"password\":\"$newPassword\"}"
                val request = Request.Builder()
                    .url("https://api.ejemplo.com/change-password")
                    .put(jsonBody.toRequestBody("application/json".toMediaType()))
                    .build()

                val response = client.newCall(request).execute()

                withContext(Dispatchers.Main) {
                    when (response.code) {
                        200 -> {
                            Snackbar.make(
                                findViewById(android.R.id.content),
                                "Contraseña cambiada exitosamente",
                                Snackbar.LENGTH_SHORT
                            ).show()
                            // Redirigir al login después de un breve delay
                            findViewById<android.view.View>(android.R.id.content).postDelayed({
                                startActivity(Intent(this@ChangePasswordActivity, LoginActivity::class.java))
                                finishAffinity()
                            }, 1500)
                        }
                        else -> {
                            Snackbar.make(
                                findViewById(android.R.id.content),
                                "Error al cambiar la contraseña",
                                Snackbar.LENGTH_SHORT
                            ).show()
                        }
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
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