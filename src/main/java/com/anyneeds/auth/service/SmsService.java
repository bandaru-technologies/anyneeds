package com.anyneeds.auth.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SmsService {

    // Replace this method body with Twilio/MSG91 SDK calls in production
    public void sendOtp(String phoneNumber, String otpCode) {
        log.info("========================================");
        log.info("OTP for {}: {}", phoneNumber, otpCode);
        log.info("========================================");
        // TODO: integrate with Twilio or MSG91
        // twilioClient.messages.create(phoneNumber, "Your AnyNeeds OTP is: " + otpCode);
    }
}
