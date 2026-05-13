package com.anyneeds.user.controller;

import com.anyneeds.common.JwtUtil;
import com.anyneeds.user.dto.SellerPublicDto;
import com.anyneeds.user.dto.UserProfileDto;
import com.anyneeds.user.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @GetMapping("/me")
    public ResponseEntity<UserProfileDto> getProfile(HttpServletRequest request) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(userService.getProfile(userId));
    }

    @GetMapping("/{userId}/public")
    public ResponseEntity<SellerPublicDto> getSellerPublicProfile(
            @PathVariable Long userId, HttpServletRequest request) {
        Long viewerId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(userService.getSellerPublicProfile(userId, viewerId));
    }

    @PutMapping("/me")
    public ResponseEntity<UserProfileDto> updateProfile(
        HttpServletRequest request, @RequestBody UserProfileDto dto) {
        Long userId = (Long) request.getAttribute("userId");
        return ResponseEntity.ok(userService.updateProfile(userId, dto));
    }
}
