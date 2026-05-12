package com.anyneeds.auth.service;

import com.anyneeds.auth.entity.OtpVerification;
import com.anyneeds.auth.repository.OtpVerificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OtpService {

    private final OtpVerificationRepository otpRepo;
    private final SmsService smsService;
    private final SecureRandom random = new SecureRandom();

    @Value("${anyneeds.otp.expiry-minutes:10}")
    private int expiryMinutes;

    @Value("${anyneeds.otp.length:6}")
    private int otpLength;

    @Transactional
    public void sendOtp(String phoneNumber) {
        otpRepo.deleteAllByPhoneNumber(phoneNumber);

        String code = generateCode();
        OtpVerification otp = OtpVerification.builder()
            .phoneNumber(phoneNumber)
            .otpCode(code)
            .expiresAt(LocalDateTime.now().plusMinutes(expiryMinutes))
            .build();
        otpRepo.save(otp);
        smsService.sendOtp(phoneNumber, code);
    }

    @Transactional
    public boolean verifyOtp(String phoneNumber, String code) {
        Optional<OtpVerification> otpOpt = otpRepo
            .findTopByPhoneNumberAndVerifiedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
                phoneNumber, LocalDateTime.now());

        if (otpOpt.isEmpty()) return false;

        OtpVerification otp = otpOpt.get();
        if (!otp.getOtpCode().equals(code)) return false;

        otp.setVerified(true);
        otpRepo.save(otp);
        return true;
    }

    private String generateCode() {
        int max = (int) Math.pow(10, otpLength);
        int min = (int) Math.pow(10, otpLength - 1);
        return String.valueOf(min + random.nextInt(max - min));
    }
}
