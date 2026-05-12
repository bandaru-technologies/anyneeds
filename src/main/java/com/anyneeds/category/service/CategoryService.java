package com.anyneeds.category.service;

import com.anyneeds.category.dto.CategoryDto;
import com.anyneeds.category.entity.Category;
import com.anyneeds.category.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<CategoryDto> getAllActiveCategories() {
        return categoryRepository.findByIsActiveTrueOrderByDisplayOrderAsc()
            .stream()
            .map(CategoryDto::from)
            .toList();
    }

    public Category getById(Long id) {
        return categoryRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Category not found: " + id));
    }
}
