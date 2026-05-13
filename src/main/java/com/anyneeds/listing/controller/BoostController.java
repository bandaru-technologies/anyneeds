package com.anyneeds.listing.controller;

import com.anyneeds.listing.dto.BoostResponse;
import com.anyneeds.listing.dto.ListingResponse;
import com.anyneeds.listing.entity.ListingBoost;
import com.anyneeds.listing.service.BoostService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class BoostController {

    private final BoostService boostService;

    @PostMapping("/api/boosts")
    public ResponseEntity<BoostResponse> boost(
            @RequestBody Map<String, Object> body,
            HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        Long listingId = Long.valueOf(body.get("listingId").toString());
        ListingBoost.BoostPlan plan = ListingBoost.BoostPlan.valueOf(body.get("plan").toString().toUpperCase());
        return ResponseEntity.ok(boostService.boost(userId, listingId, plan));
    }

    @GetMapping("/api/boosts/my")
    public ResponseEntity<List<BoostResponse>> myBoosts(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(boostService.getActiveBoosts(userId));
    }

    @GetMapping("/api/listings/featured")
    public ResponseEntity<List<ListingResponse>> featured() {
        return ResponseEntity.ok(boostService.getFeaturedListings());
    }
}
