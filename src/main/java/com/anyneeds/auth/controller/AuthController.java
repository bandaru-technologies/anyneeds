package com.anyneeds.auth.controller;

import com.anyneeds.auth.dto.AuthResponse;
import com.anyneeds.auth.dto.SendOtpRequest;
import com.anyneeds.auth.dto.VerifyOtpRequest;
import com.anyneeds.auth.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/send-otp")
    public ResponseEntity<Map<String, String>> sendOtp(@Valid @RequestBody SendOtpRequest req) {
        authService.sendOtp(req.getPhoneNumber());
        return ResponseEntity.ok(Map.of("message", "OTP sent successfully"));
    }

    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest req) {
        AuthResponse response = authService.verifyOtp(req.getPhoneNumber(), req.getOtpCode(), req.getReferralCode());
        return ResponseEntity.ok(response);
    }
}
