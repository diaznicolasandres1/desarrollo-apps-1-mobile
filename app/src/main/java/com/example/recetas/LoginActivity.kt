package com.example.recetas

import android.content.Intent
import android.content.SharedPreferences
import android.os.Bundle
import android.util.Log
import android.view.View
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.button.MaterialButton
import com.google.android.material.checkbox.MaterialCheckBox
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

class LoginActivity : AppCompatActivity() {
    private lateinit var etUsername: TextInputEditText
    private lateinit var etPassword: TextInputEditText
    private lateinit var btnLogin: MaterialButton
    private lateinit var tvForgotPassword: MaterialButton
    private lateinit var loginProgress: CircularProgressIndicator
    private lateinit var cbRememberMe: MaterialCheckBox
    private lateinit var sharedPreferences: SharedPreferences
    private val client = OkHttpClient()
    private val BASE_URL = "https://desarrollo-apps-1-back-end.vercel.app"
    private val TAG = "LoginDebug"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        sharedPreferences = getSharedPreferences("LoginPrefs", MODE_PRIVATE)
        
        // Verificar si hay una sesión guardada
        if (sharedPreferences.getBoolean("isLoggedIn", false)) {
            navigateToMain()
            return
        }

        etUsername = findViewById(R.id.etUsername)
        etPassword = findViewById(R.id.etPassword)
        btnLogin = findViewById(R.id.btnLogin)
        tvForgotPassword = findViewById(R.id.tvForgotPassword)
        loginProgress = findViewById(R.id.loginProgress)
        cbRememberMe = findViewById(R.id.cbRememberMe)

        // Restaurar email guardado si existe
        val savedEmail = sharedPreferences.getString("savedEmail", "")
        if (!savedEmail.isNullOrEmpty()) {
            etUsername.setText(savedEmail)
            cbRememberMe.isChecked = true
        }

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
        cbRememberMe.isEnabled = !isLoading
    }

    private fun saveLoginState(email: String) {
        with(sharedPreferences.edit()) {
            putBoolean("isLoggedIn", true)
            if (cbRememberMe.isChecked) {
                putString("savedEmail", email)
            } else {
                remove("savedEmail")
            }
            apply()
        }
    }

    private fun navigateToMain() {
        startActivity(Intent(this, MainActivity::class.java))
        finish()
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
                    when (response.code) {
                        201 -> {
                            Log.d(TAG, "Login exitoso")
                            saveLoginState(email)
                            navigateToMain()
                        }
                        404 -> {
                            Log.d(TAG, "Error 404: Usuario o contraseña incorrectos")
                            setLoadingState(false)
                            Snackbar.make(
                                findViewById(android.R.id.content),
                                "Usuario o contraseña incorrectos",
                                Snackbar.LENGTH_SHORT
                            ).show()
                        }
                        400 -> {
                            Log.d(TAG, "Error 400: Usuario con registro incompleto")
                            setLoadingState(false)
                            Snackbar.make(
                                findViewById(android.R.id.content),
                                "Usuario con registro incompleto",
                                Snackbar.LENGTH_SHORT
                            ).show()
                        }
                        else -> {
                            Log.d(TAG, "Error no manejado: ${response.code}")
                            setLoadingState(false)
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