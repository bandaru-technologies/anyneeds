package com.anyneeds.auth.service;

import com.anyneeds.auth.dto.AuthResponse;
import com.anyneeds.common.JwtUtil;
import com.anyneeds.user.entity.User;
import com.anyneeds.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final OtpService otpService;
    private final UserService userService;
    private final JwtUtil jwtUtil;

    public void sendOtp(String phoneNumber) {
        otpService.sendOtp(phoneNumber);
    }

    public AuthResponse verifyOtp(String phoneNumber, String otpCode) {
        boolean valid = otpService.verifyOtp(phoneNumber, otpCode);
        if (!valid) throw new RuntimeException("Invalid or expired OTP");

        User user = userService.findOrCreateUser(phoneNumber);
        String token = jwtUtil.generateToken(user.getId(), user.getPhoneNumber());

        return AuthResponse.builder()
            .token(token)
            .user(com.anyneeds.user.dto.UserProfileDto.from(user))
            .build();
    }
}
