package com.anyneeds.listing.service;

import com.anyneeds.category.entity.Category;
import com.anyneeds.category.service.CategoryService;
import com.anyneeds.listing.dto.ListingRequest;
import com.anyneeds.listing.dto.ListingResponse;
import com.anyneeds.listing.entity.Listing;
import com.anyneeds.listing.repository.ListingRepository;
import com.anyneeds.user.entity.User;
import com.anyneeds.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ListingService {

    private final ListingRepository listingRepository;
    private final CategoryService categoryService;
    private final UserRepository userRepository;

    @Transactional
    public ListingResponse create(Long userId, ListingRequest req) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Category category = categoryService.getById(req.getCategoryId());

        Listing listing = Listing.builder()
            .title(req.getTitle())
            .description(req.getDescription())
            .price(req.getPrice())
            .category(category)
            .user(user)
            .imageUrls(req.getImageUrls() != null ? req.getImageUrls() : java.util.List.of())
            .location(req.getLocation())
            .city(req.getCity())
            .state(req.getState())
            .build();

        return ListingResponse.from(listingRepository.save(listing));
    }

    public Page<ListingResponse> search(Long categoryId, String city, String area, String keyword, Pageable pageable) {
        String cityParam = (city != null && !city.isBlank()) ? "%" + city.toLowerCase() + "%" : null;
        String areaParam = (area != null && !area.isBlank()) ? "%" + area.toLowerCase() + "%" : null;
        String keywordParam = (keyword != null && !keyword.isBlank()) ? "%" + keyword.toLowerCase() + "%" : null;
        return listingRepository.searchListings(categoryId, cityParam, areaParam, keywordParam, pageable)
            .map(ListingResponse::from);
    }

    public ListingResponse getById(Long id) {
        return listingRepository.findById(id)
            .filter(l -> l.getStatus() == Listing.ListingStatus.ACTIVE)
            .map(ListingResponse::from)
            .orElseThrow(() -> new RuntimeException("Listing not found"));
    }

    public Page<ListingResponse> getMyListings(Long userId, Pageable pageable) {
        return listingRepository.findByUserIdAndStatusNotOrderByCreatedAtDesc(
            userId, Listing.ListingStatus.DELETED, pageable)
            .map(ListingResponse::from);
    }

    public ListingResponse getByIdForOwner(Long userId, Long listingId) {
        Listing listing = listingRepository.findById(listingId)
            .orElseThrow(() -> new RuntimeException("Listing not found"));
        if (!listing.getUser().getId().equals(userId)) throw new RuntimeException("Unauthorized");
        if (listing.getStatus() == Listing.ListingStatus.DELETED) throw new RuntimeException("Listing not found");
        return ListingResponse.from(listing);
    }

    @Transactional
    public ListingResponse update(Long userId, Long listingId, ListingRequest req) {
        Listing listing = listingRepository.findById(listingId)
            .orElseThrow(() -> new RuntimeException("Listing not found"));
        if (!listing.getUser().getId().equals(userId)) throw new RuntimeException("Unauthorized");
        if (listing.getStatus() == Listing.ListingStatus.DELETED) throw new RuntimeException("Listing not found");

        Category category = categoryService.getById(req.getCategoryId());
        listing.setTitle(req.getTitle());
        listing.setDescription(req.getDescription());
        listing.setPrice(req.getPrice());
        listing.setCategory(category);
        listing.setImageUrls(req.getImageUrls() != null ? req.getImageUrls() : java.util.List.of());
        listing.setLocation(req.getLocation());
        listing.setCity(req.getCity());
        listing.setState(req.getState());

        return ListingResponse.from(listingRepository.save(listing));
    }

    @Transactional
    public void markAsSold(Long userId, Long listingId) {
        Listing listing = listingRepository.findById(listingId)
            .orElseThrow(() -> new RuntimeException("Listing not found"));
        if (!listing.getUser().getId().equals(userId)) throw new RuntimeException("Unauthorized");
        listing.setStatus(Listing.ListingStatus.SOLD);
        listingRepository.save(listing);
    }

    @Transactional
    public void delete(Long userId, Long listingId) {
        Listing listing = listingRepository.findById(listingId)
            .orElseThrow(() -> new RuntimeException("Listing not found"));
        if (!listing.getUser().getId().equals(userId)) throw new RuntimeException("Unauthorized");
        listing.setStatus(Listing.ListingStatus.DELETED);
        listingRepository.save(listing);
    }
}
