package com.anyneeds.listing.dto;

import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.List;

@Getter @Setter
public class ListingRequest {

    @NotBlank
    @Size(max = 200)
    private String title;

    @Size(max = 5000)
    private String description;

    @DecimalMin("0")
    private BigDecimal price;

    @NotNull
    private Long categoryId;

    private List<String> imageUrls;

    @Size(max = 200)
    private String location;

    @Size(max = 100)
    private String city;

    @Size(max = 100)
    private String state;

    private String condition; // NEW, LIKE_NEW, GOOD, FAIR

    private Boolean negotiable;
}
