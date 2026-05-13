package com.anyneeds.follow.controller;

import com.anyneeds.follow.dto.FollowStatusResponse;
import com.anyneeds.follow.service.SellerFollowService;
import com.anyneeds.listing.dto.ListingResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/follows")
@RequiredArgsConstructor
public class SellerFollowController {

    private final SellerFollowService sellerFollowService;

    @PostMapping("/{sellerId}")
    public ResponseEntity<FollowStatusResponse> toggle(
            @PathVariable Long sellerId, HttpServletRequest request) {
        Long followerId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(sellerFollowService.toggle(followerId, sellerId));
    }

    @GetMapping("/status/{sellerId}")
    public ResponseEntity<FollowStatusResponse> getStatus(
            @PathVariable Long sellerId, HttpServletRequest request) {
        Long followerId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(sellerFollowService.getStatus(followerId, sellerId));
    }

    @GetMapping("/feed")
    public ResponseEntity<Page<ListingResponse>> getFeed(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            HttpServletRequest request) {
        Long followerId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(sellerFollowService.getFollowingFeed(followerId, PageRequest.of(page, size)));
    }

    @GetMapping("/feed/preview")
    public ResponseEntity<List<ListingResponse>> getFeedPreview(HttpServletRequest request) {
        Long followerId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(sellerFollowService.getFollowingFeedPreview(followerId));
    }
}
