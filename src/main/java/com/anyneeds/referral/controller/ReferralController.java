package com.anyneeds.referral.controller;

import com.anyneeds.referral.dto.ReferralStatsDto;
import com.anyneeds.referral.service.ReferralService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/referral")
@RequiredArgsConstructor
public class ReferralController {

    private final ReferralService referralService;

    @GetMapping("/my")
    public ResponseEntity<ReferralStatsDto> getMyReferralStats(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        referralService.getOrAssignCode(userId);
        return ResponseEntity.ok(referralService.getStats(userId));
    }
}
