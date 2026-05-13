package com.anyneeds.listing.repository;

import com.anyneeds.listing.entity.Listing;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Long>, JpaSpecificationExecutor<Listing> {

    Page<Listing> findByStatusAndUserIdInOrderByCreatedAtDesc(Listing.ListingStatus status, List<Long> userIds, Pageable pageable);

    @Query("SELECT DISTINCT l.city FROM Listing l WHERE l.status = 'ACTIVE' AND l.city IS NOT NULL")
    List<String> findDistinctActiveCities();

    Page<Listing> findByStatusAndCategoryIdOrderByCreatedAtDesc(
        Listing.ListingStatus status, Long categoryId, Pageable pageable);

    Page<Listing> findByStatusOrderByCreatedAtDesc(Listing.ListingStatus status, Pageable pageable);

    Page<Listing> findByUserIdAndStatusNotOrderByCreatedAtDesc(
        Long userId, Listing.ListingStatus status, Pageable pageable);

    @Query("""
        SELECT DISTINCT l.title FROM Listing l
        WHERE l.status = 'ACTIVE'
        AND LOWER(l.title) LIKE :q
        ORDER BY l.title
        """)
    List<String> findTitleSuggestions(@Param("q") String q, Pageable pageable);

    long countByUserIdAndStatus(Long userId, Listing.ListingStatus status);

    long countByUserIdAndStatusNot(Long userId, Listing.ListingStatus status);
}
