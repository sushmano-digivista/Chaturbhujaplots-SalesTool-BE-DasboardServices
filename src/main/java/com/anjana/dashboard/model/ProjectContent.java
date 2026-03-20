package com.anjana.dashboard.model;

import lombok.*;
import org.springframework.data.annotation.*;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;
import java.util.List;

/**
 * Single document holding all editable content sections for the customer frontend.
 * Stored as one document with id="CONTENT" — easy to fetch and update.
 */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
@Document(collection = "project_content")
public class ProjectContent {

    @Id private String id;  // fixed: "CONTENT"

    // ── Hero ──────────────────────────────────────────────────────────────────
    private HeroContent hero;

    // ── Highlights / Why Paritala ─────────────────────────────────────────────
    private List<Highlight> highlights;

    // ── Amenities ─────────────────────────────────────────────────────────────
    private List<Amenity> amenities;

    // ── Location distances ────────────────────────────────────────────────────
    private List<DistanceItem> distances;

    // ── Investment quote ──────────────────────────────────────────────────────
    private QuoteContent quote;

    // ── Project stats (hero mini-stats) ──────────────────────────────────────
    private List<StatItem> stats;

    // ── Contact / WhatsApp ────────────────────────────────────────────────────
    private ContactInfo contact;

    @LastModifiedDate private LocalDateTime updatedAt;

    // ── Nested types ──────────────────────────────────────────────────────────

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class HeroContent {
        private String headline;          // "Premium Plots Near Amaravati"
        private String subheadline;       // "Near Amaravati" (italic em)
        private String description;
        private String backgroundImageId; // MediaAsset id from common-service
        private List<String> approvalBadges; // ["CRDA Approved", "RERA: P06060125894"]
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Highlight {
        private String icon;
        private String title;
        private String description;
        private int    sortOrder;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class Amenity {
        private String tab;          // "INFRA" | "LIFESTYLE" | "UTILITIES"
        private String icon;
        private String label;
        private String imageId;      // optional MediaAsset id
        private boolean featured;    // e.g. Hanuman temple card
        private String featuredDesc;
        private int    sortOrder;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class DistanceItem {
        private String icon;
        private String name;
        private String subtitle;
        private String distance;     // "8 km"
        private int    sortOrder;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class QuoteContent {
        private String investLine1;  // "Invest ₹2 Today —"
        private String investLine2;  // "Receive ₹20 Tomorrow"
        private String quote;        // full quote text
        private List<QuoteStat> stats;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class QuoteStat {
        private String value;        // "10×"
        private String label;        // "Expected Return"
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class StatItem {
        private String value;        // "120+"
        private String label;        // "Total Plots"
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ContactInfo {
        private String phone;
        private String whatsapp;     // with country code: "919999999999"
        private String email;
        private String address;
        private String mapEmbedUrl;
        private String mapOpenUrl;
    }
}
