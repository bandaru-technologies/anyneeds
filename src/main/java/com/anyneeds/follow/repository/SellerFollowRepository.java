package com.anyneeds.follow.repository;

import com.anyneeds.follow.entity.SellerFollow;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface SellerFollowRepository extends JpaRepository<SellerFollow, Long> {

    List<SellerFollow> findAllByFollowerIdOrderByCreatedAtDesc(Long followerId);

    boolean existsByFollowerIdAndSellerId(Long followerId, Long sellerId);

    @Transactional
    @Modifying
    void deleteByFollowerIdAndSellerId(Long followerId, Long sellerId);

    long countBySellerId(Long sellerId);

    @Query("SELECT f.seller.id FROM SellerFollow f WHERE f.follower.id = :followerId")
    List<Long> findSellerIdsByFollowerId(@Param("followerId") Long followerId);
}
