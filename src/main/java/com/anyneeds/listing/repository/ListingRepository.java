package com.anyneeds.listing.repository;

import com.anyneeds.listing.entity.Listing;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Long> {

    Page<Listing> findByStatusAndCategoryIdOrderByCreatedAtDesc(
        Listing.ListingStatus status, Long categoryId, Pageable pageable);

    Page<Listing> findByStatusOrderByCreatedAtDesc(Listing.ListingStatus status, Pageable pageable);

    Page<Listing> findByUserIdAndStatusNotOrderByCreatedAtDesc(
        Long userId, Listing.ListingStatus status, Pageable pageable);

    @Query("""
        SELECT l FROM Listing l
        WHERE l.status = 'ACTIVE'
        AND (:categoryId IS NULL OR l.category.id = :categoryId)
        AND (:city IS NULL OR LOWER(l.city) LIKE :city)
        AND (:area IS NULL OR LOWER(l.location) LIKE :area)
        AND (:keyword IS NULL OR LOWER(l.title) LIKE :keyword
             OR LOWER(l.description) LIKE :keyword)
        ORDER BY l.createdAt DESC
        """)
    Page<Listing> searchListings(
        @Param("categoryId") Long categoryId,
        @Param("city") String city,
        @Param("area") String area,
        @Param("keyword") String keyword,
        Pageable pageable);
}
