package com.example.recetas

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.View
import android.text.Editable
import android.text.TextWatcher
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

class VerifyCodeActivity : AppCompatActivity() {
    private lateinit var etCode: TextInputEditText
    private lateinit var btnResendCode: MaterialButton
    private lateinit var progressBar: CircularProgressIndicator
    private val client = OkHttpClient()
    private val BASE_URL = "https://desarrollo-apps-1-back-end.vercel.app"
    private val TAG = "VerifyCodeDebug"
    private lateinit var email: String
    private lateinit var recoveryCode: String

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_verify_code)

        email = intent.getStringExtra("email") ?: ""
        recoveryCode = intent.getStringExtra("recoveryCode") ?: ""
        
        if (email.isEmpty() || recoveryCode.isEmpty()) {
            Log.e(TAG, "Email o código de recuperación no proporcionados")
            finish()
            return
        }

        etCode = findViewById(R.id.etCode)
        btnResendCode = findViewById(R.id.btnResendCode)
        progressBar = findViewById(R.id.progressBar)

        etCode.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                val code = s?.toString() ?: ""
                if (code.length == 6) {
                    setLoadingState(true)
                    verifyCode(code)
                }
            }
        })

        btnResendCode.setOnClickListener {
            setLoadingState(true)
            requestNewCode()
        }
    }

    private fun setLoadingState(isLoading: Boolean) {
        btnResendCode.isEnabled = !isLoading
        progressBar.visibility = if (isLoading) View.VISIBLE else View.GONE
        etCode.isEnabled = !isLoading
    }

    private fun verifyCode(code: String) {
        android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
            setLoadingState(false)
            if (code == recoveryCode) {
                Log.d(TAG, "Código verificado correctamente")
                val intent = Intent(this@VerifyCodeActivity, ChangePasswordActivity::class.java)
                intent.putExtra("email", email)
                intent.putExtra("recoveryCode", recoveryCode)
                startActivity(intent)
                finish()
            } else {
                Log.d(TAG, "Código incorrecto")
                Snackbar.make(
                    findViewById(android.R.id.content),
                    "Código incorrecto",
                    Snackbar.LENGTH_SHORT
                ).show()
            }
        }, 1000)
    }

    private fun requestNewCode() {
        CoroutineScope(Dispatchers.IO).launch {
            try {
                val jsonBody = "{\"email\":\"$email\"}"
                Log.d(TAG, "Intentando solicitar nuevo código con: $jsonBody")
                
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
                            Log.d(TAG, "Nuevo código enviado exitosamente")
                            Snackbar.make(
                                findViewById(android.R.id.content),
                                "Nuevo código enviado a tu email",
                                Snackbar.LENGTH_SHORT
                            ).show()
                        }
                        else -> {
                            Log.d(TAG, "Error no manejado: ${response.code}")
                            Snackbar.make(
                                findViewById(android.R.id.content),
                                "Error al enviar el nuevo código",
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