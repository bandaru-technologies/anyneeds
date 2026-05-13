package com.anyneeds.seo;

import com.anyneeds.listing.entity.Listing;
import com.anyneeds.listing.repository.ListingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class SitemapController {

    private static final String BASE_URL = "https://salepe.in";

    private final ListingRepository listingRepository;

    @GetMapping(value = "/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public String sitemap() {
        StringBuilder sb = new StringBuilder();
        sb.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
        sb.append("<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">");

        // Static pages
        for (String staticPath : new String[]{ "/", "/listings", "/post-ad", "/subscription" }) {
            sb.append("<url><loc>").append(BASE_URL).append(staticPath).append("</loc></url>");
        }

        // Active listings (max 500)
        List<Listing> listings = listingRepository.findByStatusOrderByCreatedAtDesc(
            Listing.ListingStatus.ACTIVE, PageRequest.of(0, 500)).getContent();
        for (Listing listing : listings) {
            sb.append("<url><loc>").append(BASE_URL).append("/listings/").append(listing.getId()).append("</loc></url>");
        }

        // City pages
        List<String> cities = listingRepository.findDistinctActiveCities();
        for (String city : cities) {
            sb.append("<url><loc>").append(BASE_URL).append("/in/").append(encodeCity(city)).append("</loc></url>");
        }

        sb.append("</urlset>");
        return sb.toString();
    }

    private String encodeCity(String city) {
        return city.toLowerCase().replace(" ", "-");
    }
}
