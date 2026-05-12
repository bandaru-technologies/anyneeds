package com.anyneeds.config;

import com.anyneeds.category.entity.Category;
import com.anyneeds.category.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    @Override
    public void run(String... args) {
        if (categoryRepository.count() > 0) return;

        List<Category> categories = List.of(
            cat("Cars", "cars", "fa-car", 1),
            cat("Bikes", "bikes", "fa-motorcycle", 2),
            cat("Other Vehicles", "other-vehicles", "fa-truck", 3),
            cat("Mobiles & Electronics", "mobiles-electronics", "fa-mobile-alt", 4),
            cat("Jobs", "jobs", "fa-briefcase", 5),
            cat("Real Estate", "real-estate", "fa-building", 6),
            cat("Hotel / PG", "hotel-pg", "fa-bed", 7),
            cat("Furniture & Home", "furniture-home", "fa-couch", 8),
            cat("Carpool / Travel", "carpool-travel", "fa-route", 9),
            cat("Animals & Pets", "animals-pets", "fa-paw", 10),
            cat("Fashion & Beauty", "fashion-beauty", "fa-tshirt", 11),
            cat("Books & Education", "books-education", "fa-book-open", 12),
            cat("Events & Promotions", "events-promotions", "fa-tag", 13),
            cat("Home Services", "home-services", "fa-tools", 14),
            cat("Software & IT", "software-it", "fa-laptop-code", 15),
            cat("Business", "business", "fa-chart-line", 16),
            cat("Others", "others", "fa-box", 17)
        );

        categoryRepository.saveAll(categories);
        log.info("Seeded {} categories", categories.size());
    }

    private Category cat(String name, String slug, String icon, int order) {
        return Category.builder()
            .name(name)
            .slug(slug)
            .icon(icon)
            .displayOrder(order)
            .build();
    }
}
