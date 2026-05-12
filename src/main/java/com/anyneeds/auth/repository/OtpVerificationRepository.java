package com.anyneeds.auth.repository;

import com.anyneeds.auth.entity.OtpVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface OtpVerificationRepository extends JpaRepository<OtpVerification, Long> {

    Optional<OtpVerification> findTopByPhoneNumberAndVerifiedFalseAndExpiresAtAfterOrderByCreatedAtDesc(
        String phoneNumber, LocalDateTime now);

    @Modifying
    @Transactional
    @Query("DELETE FROM OtpVerification o WHERE o.phoneNumber = :phoneNumber")
    void deleteAllByPhoneNumber(String phoneNumber);
}
