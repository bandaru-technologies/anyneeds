package com.anyneeds.chat.repository;

import com.anyneeds.chat.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long> {

    Optional<Conversation> findByBuyerIdAndListingId(Long buyerId, Long listingId);

    @Query("""
        SELECT c FROM Conversation c
        WHERE c.buyer.id = :userId OR c.seller.id = :userId
        ORDER BY c.lastMessageAt DESC NULLS LAST, c.createdAt DESC
        """)
    List<Conversation> findAllByParticipant(@Param("userId") Long userId);

    @Query("""
        SELECT COALESCE(SUM(
            CASE WHEN c.buyer.id = :userId THEN c.buyerUnread
                 ELSE c.sellerUnread END
        ), 0)
        FROM Conversation c
        WHERE c.buyer.id = :userId OR c.seller.id = :userId
        """)
    long countTotalUnread(@Param("userId") Long userId);

    long countByListingId(Long listingId);
}
