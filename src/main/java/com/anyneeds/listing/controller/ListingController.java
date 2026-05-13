package com.anyneeds.listing.controller;

import com.anyneeds.listing.dto.ListingRequest;
import com.anyneeds.listing.dto.ListingResponse;
import com.anyneeds.listing.service.ListingService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/listings")
@RequiredArgsConstructor
public class ListingController {

    private final ListingService listingService;

    @GetMapping
    public ResponseEntity<Page<ListingResponse>> search(
        @RequestParam(required = false) Long categoryId,
        @RequestParam(required = false) String city,
        @RequestParam(required = false) String area,
        @RequestParam(required = false) String keyword,
        @RequestParam(required = false) Long sellerId,
        @RequestParam(required = false) BigDecimal minPrice,
        @RequestParam(required = false) BigDecimal maxPrice,
        @RequestParam(required = false) String condition,
        @RequestParam(required = false) Boolean negotiable,
        @RequestParam(required = false) String postedIn,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(listingService.search(
            categoryId, city, area, keyword, sellerId,
            minPrice, maxPrice, condition, negotiable, postedIn, pageable));
    }

    @GetMapping("/suggestions")
    public ResponseEntity<List<String>> suggestions(@RequestParam String q) {
        return ResponseEntity.ok(listingService.getSuggestions(q));
    }

    @PatchMapping("/{id}/view")
    public ResponseEntity<Void> trackView(@PathVariable Long id) {
        listingService.incrementView(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ListingResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(listingService.getById(id));
    }

    @PostMapping
    public ResponseEntity<ListingResponse> create(
        HttpServletRequest request, @Valid @RequestBody ListingRequest req) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(listingService.create(userId, req));
    }

    @GetMapping("/my")
    public ResponseEntity<Page<ListingResponse>> getMyListings(
        HttpServletRequest request,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size) {
        Long userId = (Long) request.getAttribute("userId");
        Pageable pageable = PageRequest.of(page, size);
        return ResponseEntity.ok(listingService.getMyListings(userId, pageable));
    }

    @GetMapping("/my/{id}")
    public ResponseEntity<ListingResponse> getMyListingById(
        HttpServletRequest request, @PathVariable Long id) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(listingService.getByIdForOwner(userId, id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ListingResponse> update(
        HttpServletRequest request, @PathVariable Long id, @Valid @RequestBody ListingRequest req) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(listingService.update(userId, id, req));
    }

    @PatchMapping("/{id}/sold")
    public ResponseEntity<Void> markAsSold(HttpServletRequest request, @PathVariable Long id) {
        Long userId = (Long) request.getAttribute("userId");
        listingService.markAsSold(userId, id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(HttpServletRequest request, @PathVariable Long id) {
        Long userId = (Long) request.getAttribute("userId");
        listingService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }
}
