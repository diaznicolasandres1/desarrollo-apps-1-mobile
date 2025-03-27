package com.example.recetas

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.TextView
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

class LoginActivity : AppCompatActivity() {
    private lateinit var etUsername: EditText
    private lateinit var etPassword: EditText
    private lateinit var btnLogin: Button
    private lateinit var tvForgotPassword: TextView
    private lateinit var loginProgress: ProgressBar
    private val client = OkHttpClient()
    private val BASE_URL = "https://desarrollo-apps-1-back-end.vercel.app"
    private val TAG = "LoginDebug"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        etUsername = findViewById(R.id.etUsername)
        etPassword = findViewById(R.id.etPassword)
        btnLogin = findViewById(R.id.btnLogin)
        tvForgotPassword = findViewById(R.id.tvForgotPassword)
        loginProgress = findViewById(R.id.loginProgress)

        btnLogin.setOnClickListener {
            val email = etUsername.text.toString()
            val password = etPassword.text.toString()

            if (email.isNotEmpty() && password.isNotEmpty()) {
                setLoadingState(true)
                performLogin(email, password)
            } else {
                Snackbar.make(it, "Por favor complete todos los campos", Snackbar.LENGTH_SHORT).show()
            }
        }

        tvForgotPassword.setOnClickListener {
            startActivity(Intent(this, ForgotPasswordActivity::class.java))
        }
    }

    private fun setLoadingState(isLoading: Boolean) {
        btnLogin.isEnabled = !isLoading
        loginProgress.visibility = if (isLoading) View.VISIBLE else View.GONE
        etUsername.isEnabled = !isLoading
        etPassword.isEnabled = !isLoading
        tvForgotPassword.isEnabled = !isLoading
    }

    private fun performLogin(email: String, password: String) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val jsonBody = "{\"email\":\"$email\",\"password\":\"$password\"}"
                Log.d(TAG, "Intentando login con: $jsonBody")
                
                val request = Request.Builder()
                    .url("$BASE_URL/users/auth")
                    .post(jsonBody.toRequestBody("application/json".toMediaType()))
                    .build()

                val response = client.newCall(request).execute()
                val responseBody = response.body?.string()
                Log.d(TAG, "Código de respuesta: ${response.code}")
                Log.d(TAG, "Cuerpo de respuesta: $responseBody")

                withContext(Dispatchers.Main) {
                    setLoadingState(false)
                    when (response.code) {
                        201 -> {
                            Log.d(TAG, "Login exitoso")
                            startActivity(Intent(this@LoginActivity, MainActivity::class.java))
                            finish()
                        }
                        404 -> {
                            Log.d(TAG, "Error 404: Usuario o contraseña incorrectos")
                            Snackbar.make(
                                findViewById(android.R.id.content),
                                "Usuario o contraseña incorrectos",
                                Snackbar.LENGTH_SHORT
                            ).show()
                        }
                        400 -> {
                            Log.d(TAG, "Error 400: Usuario con registro incompleto")
                            Snackbar.make(
                                findViewById(android.R.id.content),
                                "Usuario con registro incompleto",
                                Snackbar.LENGTH_SHORT
                            ).show()
                        }
                        else -> {
                            Log.d(TAG, "Error no manejado: ${response.code}")
                            Snackbar.make(
                                findViewById(android.R.id.content),
                                "Error al iniciar sesión",
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