package com.anyneeds.report.dto;

import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ReportRequest {
    private Long listingId;
    private Long reportedUserId;
    private String reason;
    private String description;
}
