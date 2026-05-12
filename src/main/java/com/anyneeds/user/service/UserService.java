package com.anyneeds.user.service;

import com.anyneeds.user.dto.UserProfileDto;
import com.anyneeds.user.entity.User;
import com.anyneeds.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    @Transactional
    public User findOrCreateUser(String phoneNumber) {
        return userRepository.findByPhoneNumber(phoneNumber)
            .orElseGet(() -> userRepository.save(
                User.builder().phoneNumber(phoneNumber).build()));
    }

    public UserProfileDto getProfile(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return UserProfileDto.from(user);
    }

    @Transactional
    public UserProfileDto updateProfile(Long userId, UserProfileDto dto) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        if (dto.getName() != null) user.setName(dto.getName());
        if (dto.getEmail() != null) user.setEmail(dto.getEmail());
        return UserProfileDto.from(userRepository.save(user));
    }
}
