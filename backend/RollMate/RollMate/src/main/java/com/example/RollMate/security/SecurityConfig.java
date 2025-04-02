package com.example.RollMate.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)  // Explicitly enable pre/post annotations
public class SecurityConfig {

    // Turn on Spring Security debug mode
    static {
        System.setProperty("spring.security.debug", "true");
        System.setProperty("logging.level.org.springframework.security", "DEBUG");
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public DaoAuthenticationProvider authenticationProvider(
            UserDetailsService userDetailsService,
            PasswordEncoder passwordEncoder) {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder);
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
                                           JwtAuthenticationFilter jwtAuthFilter) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeHttpRequests(auth -> auth
                        // Note: server.servlet.context-path=/api is set in application.properties
                        // so all paths here already have /api prefix
                        .requestMatchers("/auth/**").permitAll() // No longer need /api/auth since context-path is /api
                        .requestMatchers("/auth/login").permitAll()
                        .requestMatchers("/auth/register").permitAll()
                        .requestMatchers("/auth/test").permitAll()

                        // Biometric endpoints - matched exactly to discovered endpoints
                        .requestMatchers("/biometrics/status").permitAll() // Allow status check without auth
                        .requestMatchers(HttpMethod.POST, "/biometrics/register/start").hasRole("STUDENT")
                        .requestMatchers(HttpMethod.POST, "/biometrics/register/complete").hasRole("STUDENT")
                        .requestMatchers(HttpMethod.POST, "/biometrics/verify/start").hasRole("STUDENT")
                        .requestMatchers(HttpMethod.POST, "/biometrics/verify/complete").hasRole("STUDENT")

                        // Alternative biometric endpoints
                        .requestMatchers("/biometric/**").hasRole("STUDENT")
                        .requestMatchers("/bio/**").hasRole("STUDENT")

                        // Biometric attendance endpoints
                        .requestMatchers("/biometric-attendance/**").hasRole("STUDENT")
                        .requestMatchers("/attendance/biometric/**").hasRole("STUDENT")

                        // Debug endpoints
                        .requestMatchers("/debug/public").permitAll()
                        .requestMatchers("/debug-auth/**").permitAll() // All debug auth endpoints

                        // Explicitly permit GET requests for classes to work without auth for testing
                        .requestMatchers(HttpMethod.GET, "/classes", "/classes/**").permitAll()

                        // OPTIONS requests for CORS preflight
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Health check endpoint
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/health", "/api/health").permitAll()

                        // Other common endpoints to permit
                        .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()

                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("*"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "X-Auth-Token", "Origin", "Accept"));
        configuration.setExposedHeaders(Arrays.asList("X-Auth-Token", "Authorization"));
        configuration.setAllowCredentials(false);  // Changed to false as '*' wildcard doesn't work with allowCredentials=true
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}