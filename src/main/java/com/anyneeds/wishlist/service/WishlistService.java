package com.anyneeds.wishlist.service;

import com.anyneeds.listing.dto.ListingResponse;
import com.anyneeds.listing.entity.Listing;
import com.anyneeds.listing.repository.ListingRepository;
import com.anyneeds.user.entity.User;
import com.anyneeds.user.repository.UserRepository;
import com.anyneeds.wishlist.entity.Wishlist;
import com.anyneeds.wishlist.repository.WishlistRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;

    @Transactional
    public boolean toggle(Long userId, Long listingId) {
        if (wishlistRepository.existsByUserIdAndListingId(userId, listingId)) {
            wishlistRepository.deleteByUserIdAndListingId(userId, listingId);
            return false;
        }
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Listing listing = listingRepository.findById(listingId)
            .orElseThrow(() -> new RuntimeException("Listing not found"));
        wishlistRepository.save(Wishlist.builder().user(user).listing(listing).build());
        return true;
    }

    public List<ListingResponse> getSaved(Long userId) {
        return wishlistRepository.findByUserIdOrderByCreatedAtDesc(userId)
            .stream()
            .filter(w -> w.getListing().getStatus() == Listing.ListingStatus.ACTIVE)
            .map(w -> ListingResponse.from(w.getListing()))
            .toList();
    }

    public List<Long> getSavedIds(Long userId) {
        return wishlistRepository.findListingIdsByUserId(userId);
    }

    public boolean isSaved(Long userId, Long listingId) {
        return wishlistRepository.existsByUserIdAndListingId(userId, listingId);
    }
}
