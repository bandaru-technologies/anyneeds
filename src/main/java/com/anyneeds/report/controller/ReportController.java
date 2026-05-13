package com.anyneeds.report.controller;

import com.anyneeds.report.dto.ReportRequest;
import com.anyneeds.report.service.ReportService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<Map<String, String>> submit(
        HttpServletRequest request, @RequestBody ReportRequest req) {
        Long userId = (Long) request.getAttribute("userId");
        reportService.submit(userId, req);
        return ResponseEntity.ok(Map.of("message", "Report submitted. Our team will review it shortly."));
    }
}
