package com.anyneeds.seo;

import com.anyneeds.listing.dto.ListingResponse;
import com.anyneeds.listing.service.ListingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequiredArgsConstructor
public class OgController {

    private static final String APP_URL = "http://localhost:3000";

    private final ListingService listingService;

    @GetMapping(value = "/api/og/listing/{id}", produces = MediaType.TEXT_HTML_VALUE)
    public String ogListing(@PathVariable Long id) {
        ListingResponse listing;
        try {
            listing = listingService.getById(id);
        } catch (RuntimeException e) {
            String redirectUrl = APP_URL + "/listings/" + id;
            return "<html><head><meta http-equiv=\"refresh\" content=\"0;url=" + redirectUrl + "\"></head>"
                + "<body><script>window.location.href='" + redirectUrl + "';</script></body></html>";
        }

        String title = listing.getTitle() != null ? listing.getTitle() : "Listing";
        String priceStr = listing.getPrice() != null ? "₹" + listing.getPrice().toPlainString() : "Price on Request";
        String ogTitle = title + " - " + priceStr + " | SalePe";

        String rawDesc = listing.getDescription() != null ? listing.getDescription() : "";
        String descSnippet = rawDesc.length() > 200 ? rawDesc.substring(0, 200) : rawDesc;
        String city = listing.getCity() != null ? listing.getCity() : "";
        String ogDescription = descSnippet + " | " + city + " | SalePe";

        String imageUrl = (listing.getImageUrls() != null && !listing.getImageUrls().isEmpty())
            ? listing.getImageUrls().get(0) : "";

        String pageUrl = APP_URL + "/listings/" + id;

        return "<!DOCTYPE html><html><head>"
            + "<meta charset=\"UTF-8\">"
            + "<meta property=\"og:title\" content=\"" + escapeHtml(ogTitle) + "\">"
            + "<meta property=\"og:description\" content=\"" + escapeHtml(ogDescription) + "\">"
            + "<meta property=\"og:image\" content=\"" + escapeHtml(imageUrl) + "\">"
            + "<meta property=\"og:url\" content=\"" + escapeHtml(pageUrl) + "\">"
            + "<meta property=\"og:type\" content=\"product\">"
            + "<meta property=\"og:site_name\" content=\"SalePe\">"
            + "<meta name=\"twitter:card\" content=\"summary_large_image\">"
            + "<meta http-equiv=\"refresh\" content=\"0;url=" + escapeHtml(pageUrl) + "\">"
            + "</head>"
            + "<body><script>window.location.href='" + pageUrl + "';</script></body>"
            + "</html>";
    }

    private String escapeHtml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;")
            .replace("'", "&#39;");
    }
}
