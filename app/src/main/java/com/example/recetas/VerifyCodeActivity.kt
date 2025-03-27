package com.example.recetas

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.snackbar.Snackbar

class VerifyCodeActivity : AppCompatActivity() {
    private lateinit var etVerificationCode: EditText
    private lateinit var btnVerifyCode: Button
    private lateinit var progressBar: ProgressBar
    private lateinit var email: String
    private lateinit var recoveryCode: String
    private val TAG = "VerifyCodeDebug"

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

        etVerificationCode = findViewById(R.id.etVerificationCode)
        btnVerifyCode = findViewById(R.id.btnVerifyCode)
        progressBar = findViewById(R.id.progressBar)

        btnVerifyCode.setOnClickListener {
            val code = etVerificationCode.text.toString()
            if (code.length == 6) {
                setLoadingState(true)
                verifyCode(code)
            } else {
                Snackbar.make(it, "Por favor ingrese el código de 6 dígitos", Snackbar.LENGTH_SHORT).show()
            }
        }
    }

    private fun setLoadingState(isLoading: Boolean) {
        btnVerifyCode.isEnabled = !isLoading
        progressBar.visibility = if (isLoading) android.view.View.VISIBLE else android.view.View.GONE
        etVerificationCode.isEnabled = !isLoading
    }

    private fun verifyCode(code: String) {
        // Simulamos una pequeña demora para mostrar el loading
        android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({
            setLoadingState(false)
            if (code == recoveryCode) {
                Log.d(TAG, "Código verificado correctamente")
                val intent = Intent(this@VerifyCodeActivity, ChangePasswordActivity::class.java)
                intent.putExtra("email", email)
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
} 