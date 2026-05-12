package com.anyneeds.config;

import com.anyneeds.common.JwtUtil;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    private static final Set<String> PUBLIC_PATHS = Set.of(
        "/api/auth/send-otp",
        "/api/auth/verify-otp",
        "/api/categories",
        "/api/listings"
    );

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String path = request.getRequestURI();
        String method = request.getMethod();

        if ("OPTIONS".equals(method) || isPublicPath(path, method)) {
            chain.doFilter(request, response);
            return;
        }

        String authHeader = request.getHeader("Authorization");
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"Unauthorized\"}");
            return;
        }

        String token = authHeader.substring(7);
        if (!jwtUtil.isValid(token)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.getWriter().write("{\"error\":\"Invalid token\"}");
            return;
        }

        request.setAttribute("userId", jwtUtil.extractUserId(token));
        request.setAttribute("phoneNumber", jwtUtil.extractPhoneNumber(token));
        chain.doFilter(request, response);
    }

    private boolean isPublicPath(String path, String method) {
        if (path.startsWith("/api/auth/")) return true;
        if (path.equals("/api/categories")) return true;
        if (path.startsWith("/uploads/") && "GET".equals(method)) return true;
        // Public: browse all listings, view a single listing by numeric id
        // /api/listings/my and /api/listings/my/{id} require auth
        if ("GET".equals(method)) {
            if (path.equals("/api/listings")) return true;
            if (path.matches("/api/listings/\\d+")) return true;
        }
        return false;
    }
}
