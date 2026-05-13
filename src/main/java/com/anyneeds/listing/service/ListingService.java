package com.anyneeds.listing.service;

import com.anyneeds.category.entity.Category;
import com.anyneeds.category.service.CategoryService;
import com.anyneeds.listing.dto.ListingRequest;
import com.anyneeds.listing.dto.ListingResponse;
import com.anyneeds.listing.entity.Listing;
import com.anyneeds.listing.repository.ListingRepository;
import com.anyneeds.listing.spec.ListingSpecification;
import com.anyneeds.user.entity.User;
import com.anyneeds.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ListingService {

    private static final Map<String, String> CITY_ALIASES = Map.ofEntries(
        Map.entry("bengaluru", "Bangalore"),
        Map.entry("bengalore", "Bangalore"),
        Map.entry("bangaluru", "Bangalore"),
        Map.entry("blr", "Bangalore"),
        Map.entry("bombay", "Mumbai"),
        Map.entry("madras", "Chennai"),
        Map.entry("calcutta", "Kolkata"),
        Map.entry("new delhi", "Delhi"),
        Map.entry("ncr", "Delhi"),
        Map.entry("gurgaon", "Gurugram"),
        Map.entry("greater noida", "Noida")
    );

    private String normalizeCity(String city) {
        if (city == null || city.isBlank()) return city;
        return CITY_ALIASES.getOrDefault(city.trim().toLowerCase(), city.trim());
    }

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
            .condition(parseCondition(req.getCondition()))
            .negotiable(req.getNegotiable() != null && req.getNegotiable())
            .build();

        return ListingResponse.from(listingRepository.save(listing));
    }

    private Listing.ListingCondition parseCondition(String condition) {
        if (condition == null || condition.isBlank()) return null;
        try { return Listing.ListingCondition.valueOf(condition.toUpperCase()); }
        catch (IllegalArgumentException e) { return null; }
    }

    @Transactional
    public ListingResponse incrementView(Long id) {
        Listing listing = listingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Listing not found"));
        listing.setViewCount(listing.getViewCount() + 1);
        return ListingResponse.from(listingRepository.save(listing));
    }

    public Page<ListingResponse> search(Long categoryId, String city, String area, String keyword, Long sellerId,
                                        BigDecimal minPrice, BigDecimal maxPrice, String condition,
                                        Boolean negotiable, String postedIn, Pageable pageable) {
        city = normalizeCity(city);
        String cityParam = (city != null && !city.isBlank()) ? "%" + city.toLowerCase() + "%" : null;
        String areaParam = (area != null && !area.isBlank()) ? "%" + area.toLowerCase() + "%" : null;
        String keywordParam = (keyword != null && !keyword.isBlank()) ? "%" + keyword.toLowerCase() + "%" : null;

        Listing.ListingCondition conditionEnum = null;
        if (condition != null && !condition.isBlank()) {
            try { conditionEnum = Listing.ListingCondition.valueOf(condition.toUpperCase()); }
            catch (IllegalArgumentException ignored) {}
        }

        LocalDateTime createdAfter = null;
        if ("today".equals(postedIn)) createdAfter = LocalDate.now().atStartOfDay();
        else if ("week".equals(postedIn)) createdAfter = LocalDateTime.now().minusDays(7);
        else if ("month".equals(postedIn)) createdAfter = LocalDateTime.now().minusDays(30);

        Specification<Listing> spec = ListingSpecification.build(
            categoryId, cityParam, areaParam, keywordParam, sellerId,
            minPrice, maxPrice, conditionEnum, negotiable, createdAfter);

        return listingRepository.findAll(spec, pageable).map(ListingResponse::from);
    }

    public List<String> getSuggestions(String q) {
        if (q == null || q.length() < 2) return List.of();
        String param = "%" + q.toLowerCase() + "%";
        return listingRepository.findTitleSuggestions(param, PageRequest.of(0, 8));
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
        listing.setCondition(parseCondition(req.getCondition()));
        listing.setNegotiable(req.getNegotiable() != null && req.getNegotiable());

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
