package com.anyneeds.subscription.controller;

import com.anyneeds.subscription.dto.SubscriptionResponse;
import com.anyneeds.subscription.entity.UserSubscription.SubscriptionTier;
import com.anyneeds.subscription.service.SubscriptionService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @GetMapping("/my")
    public ResponseEntity<SubscriptionResponse> getMySubscription(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(subscriptionService.getMySubscription(userId));
    }

    @PostMapping
    public ResponseEntity<SubscriptionResponse> subscribe(
            @RequestBody Map<String, String> body,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        SubscriptionTier tier = SubscriptionTier.valueOf(body.get("tier").toUpperCase());
        return ResponseEntity.ok(subscriptionService.subscribe(userId, tier));
    }

    @DeleteMapping
    public ResponseEntity<SubscriptionResponse> cancel(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(subscriptionService.cancel(userId));
    }
}
