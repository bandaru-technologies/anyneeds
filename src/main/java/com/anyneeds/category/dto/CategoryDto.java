package com.anyneeds.category.dto;

import com.anyneeds.category.entity.Category;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CategoryDto {
    private Long id;
    private String name;
    private String slug;
    private String icon;
    private Integer displayOrder;

    public static CategoryDto from(Category c) {
        return CategoryDto.builder()
            .id(c.getId())
            .name(c.getName())
            .slug(c.getSlug())
            .icon(c.getIcon())
            .displayOrder(c.getDisplayOrder())
            .build();
    }
}
