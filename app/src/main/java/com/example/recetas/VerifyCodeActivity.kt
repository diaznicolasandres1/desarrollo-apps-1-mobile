package com.example.recetas

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.ProgressBar
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.google.android.material.snackbar.Snackbar
import android.text.Editable
import android.text.TextWatcher

class VerifyCodeActivity : AppCompatActivity() {
    private lateinit var etVerificationCode: EditText
    private lateinit var progressBar: ProgressBar
    private lateinit var tvEmailInfo: TextView
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
        progressBar = findViewById(R.id.progressBar)
        tvEmailInfo = findViewById(R.id.tvEmailInfo)

        tvEmailInfo.text = "Se ha enviado un código de 6 dígitos a $email"

        etVerificationCode.addTextChangedListener(object : TextWatcher {
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
    }

    private fun setLoadingState(isLoading: Boolean) {
        progressBar.visibility = if (isLoading) android.view.View.VISIBLE else android.view.View.GONE
        etVerificationCode.isEnabled = !isLoading
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
} 