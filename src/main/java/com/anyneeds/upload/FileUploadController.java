package com.anyneeds.upload;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    @Value("${anyneeds.upload-dir:./uploads}")
    private String uploadDir;

    @Value("${anyneeds.base-url:http://localhost:8080}")
    private String baseUrl;

    @PostMapping
    public ResponseEntity<Map<String, String>> upload(
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) throws IOException {

        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of("error", "Only image files are allowed"));
        }
        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest().body(Map.of("error", "File size must be under 5MB"));
        }

        Path uploadPath = Paths.get(uploadDir).toAbsolutePath();
        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String original = file.getOriginalFilename();
        String ext = (original != null && original.contains("."))
            ? original.substring(original.lastIndexOf(".")).toLowerCase()
            : ".jpg";
        String filename = UUID.randomUUID() + ext;

        Files.copy(file.getInputStream(), uploadPath.resolve(filename));

        return ResponseEntity.ok(Map.of("url", baseUrl + "/uploads/" + filename));
    }
}
