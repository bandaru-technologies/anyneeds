package com.anyneeds.wishlist.controller;

import com.anyneeds.listing.dto.ListingResponse;
import com.anyneeds.wishlist.service.WishlistService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @PostMapping("/{listingId}")
    public ResponseEntity<Map<String, Object>> toggle(
        HttpServletRequest request, @PathVariable Long listingId) {
        Long userId = (Long) request.getAttribute("userId");
        boolean saved = wishlistService.toggle(userId, listingId);
        return ResponseEntity.ok(Map.of("saved", saved, "listingId", listingId));
    }

    @GetMapping
    public ResponseEntity<List<ListingResponse>> getSaved(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(wishlistService.getSaved(userId));
    }

    @GetMapping("/ids")
    public ResponseEntity<List<Long>> getSavedIds(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(wishlistService.getSavedIds(userId));
    }
}
