package com.anyneeds.report.repository;

import com.anyneeds.report.entity.Report;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ReportRepository extends JpaRepository<Report, Long> {
    boolean existsByReporterIdAndListingId(Long reporterId, Long listingId);
}
