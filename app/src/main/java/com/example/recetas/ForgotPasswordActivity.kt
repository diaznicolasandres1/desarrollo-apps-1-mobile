package com.example.recetas

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
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
import org.json.JSONObject

class ForgotPasswordActivity : AppCompatActivity() {
    private lateinit var etEmail: EditText
    private lateinit var btnRecoverPassword: Button
    private lateinit var progressBar: ProgressBar
    private val client = OkHttpClient()
    private val BASE_URL = "https://desarrollo-apps-1-back-end.vercel.app"
    private val TAG = "ForgotPasswordDebug"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_forgot_password)

        etEmail = findViewById(R.id.etEmail)
        btnRecoverPassword = findViewById(R.id.btnRecoverPassword)
        progressBar = findViewById(R.id.progressBar)

        btnRecoverPassword.setOnClickListener {
            val email = etEmail.text.toString()
            if (email.isNotEmpty()) {
                setLoadingState(true)
                requestPasswordRecovery(email)
            } else {
                Snackbar.make(it, "Por favor ingrese su email", Snackbar.LENGTH_SHORT).show()
            }
        }
    }

    private fun setLoadingState(isLoading: Boolean) {
        btnRecoverPassword.isEnabled = !isLoading
        progressBar.visibility = if (isLoading) android.view.View.VISIBLE else android.view.View.GONE
        etEmail.isEnabled = !isLoading
    }

    private fun requestPasswordRecovery(email: String) {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val jsonBody = "{\"email\":\"$email\"}"
                Log.d(TAG, "Intentando recuperar contraseña con: $jsonBody")
                
                val request = Request.Builder()
                    .url("$BASE_URL/users/recovery-code")
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
                            try {
                                val jsonResponse = JSONObject(responseBody ?: "")
                                val recoveryCode = jsonResponse.getString("recoveryCode")
                                Log.d(TAG, "Código de recuperación generado: $recoveryCode")
                                
                                val intent = Intent(this@ForgotPasswordActivity, VerifyCodeActivity::class.java)
                                intent.putExtra("email", email)
                                intent.putExtra("recoveryCode", recoveryCode)
                                startActivity(intent)
                                finish()
                            } catch (e: Exception) {
                                Log.e(TAG, "Error al parsear respuesta", e)
                                Snackbar.make(
                                    findViewById(android.R.id.content),
                                    "Error al procesar la respuesta",
                                    Snackbar.LENGTH_SHORT
                                ).show()
                            }
                        }
                        404 -> {
                            Log.d(TAG, "Error 404: Email no registrado")
                            Snackbar.make(
                                findViewById(android.R.id.content),
                                "El email no está registrado",
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
                                "Error al procesar la solicitud",
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