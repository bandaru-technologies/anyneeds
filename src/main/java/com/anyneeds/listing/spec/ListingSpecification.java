package com.anyneeds.listing.spec;

import com.anyneeds.listing.entity.Listing;
import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ListingSpecification {

    public static Specification<Listing> build(
        Long categoryId, String city, String area, String keyword, Long sellerId,
        BigDecimal minPrice, BigDecimal maxPrice, Listing.ListingCondition condition,
        Boolean negotiable, LocalDateTime createdAfter) {

        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("status"), Listing.ListingStatus.ACTIVE));

            if (categoryId != null)
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));

            if (city != null)
                predicates.add(cb.like(cb.lower(root.get("city")), city));

            if (area != null)
                predicates.add(cb.like(cb.lower(root.get("location")), area));

            if (keyword != null)
                predicates.add(cb.or(
                    cb.like(cb.lower(root.get("title")), keyword),
                    cb.like(cb.lower(root.get("description")), keyword)
                ));

            if (sellerId != null)
                predicates.add(cb.equal(root.get("user").get("id"), sellerId));

            if (minPrice != null)
                predicates.add(cb.greaterThanOrEqualTo(root.get("price"), minPrice));

            if (maxPrice != null)
                predicates.add(cb.lessThanOrEqualTo(root.get("price"), maxPrice));

            if (condition != null)
                predicates.add(cb.equal(root.get("condition"), condition));

            if (negotiable != null)
                predicates.add(cb.equal(root.get("negotiable"), negotiable));

            if (createdAfter != null)
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), createdAfter));

            if (query.getResultType() != Long.class) {
                Expression<Object> boostPriority = cb.selectCase()
                    .when(cb.and(
                        cb.isNotNull(root.get("boostedUntil")),
                        cb.greaterThan(root.<java.time.LocalDateTime>get("boostedUntil"), java.time.LocalDateTime.now())
                    ), 0)
                    .otherwise(1);
                query.orderBy(cb.asc(boostPriority), cb.desc(root.get("createdAt")));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
