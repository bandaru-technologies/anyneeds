package com.anyneeds.report.service;

import com.anyneeds.listing.repository.ListingRepository;
import com.anyneeds.report.dto.ReportRequest;
import com.anyneeds.report.entity.Report;
import com.anyneeds.report.repository.ReportRepository;
import com.anyneeds.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportRepository reportRepository;
    private final ListingRepository listingRepository;
    private final UserRepository userRepository;

    @Transactional
    public void submit(Long reporterId, ReportRequest req) {
        if (req.getListingId() != null
            && reportRepository.existsByReporterIdAndListingId(reporterId, req.getListingId())) {
            throw new RuntimeException("Already reported this listing");
        }
        var reporter = userRepository.findById(reporterId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        var report = Report.builder()
            .reporter(reporter)
            .reason(req.getReason())
            .description(req.getDescription())
            .build();
        if (req.getListingId() != null) {
            report.setListing(listingRepository.findById(req.getListingId()).orElse(null));
        }
        if (req.getReportedUserId() != null) {
            report.setReportedUser(userRepository.findById(req.getReportedUserId()).orElse(null));
        }
        reportRepository.save(report);
    }
}
