package com.anyneeds.listing.repository;

import com.anyneeds.listing.entity.Listing;
import com.anyneeds.listing.entity.ListingBoost;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ListingBoostRepository extends JpaRepository<ListingBoost, Long> {

    @Query("""
        SELECT b FROM ListingBoost b
        WHERE b.user.id = :userId AND b.expiresAt > :now
        ORDER BY b.expiresAt DESC
        """)
    List<ListingBoost> findActiveByUserId(@Param("userId") Long userId, @Param("now") LocalDateTime now);

    @Query("""
        SELECT b.listing FROM ListingBoost b
        WHERE b.plan = 'PREMIUM'
          AND b.listing.status = 'ACTIVE'
          AND b.expiresAt > :now
        """)
    List<Listing> findFeaturedListings(@Param("now") LocalDateTime now);

    @Query("""
        SELECT COUNT(b) FROM ListingBoost b
        WHERE b.listing.id = :listingId AND b.expiresAt > :now
        """)
    long countActiveByListingId(@Param("listingId") Long listingId, @Param("now") LocalDateTime now);
}
