package com.anjana.dashboard.controller;

import com.anjana.dashboard.model.ProjectContent;
import com.anjana.dashboard.model.ProjectContent.*;
import com.anjana.dashboard.service.ContentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/content")
@RequiredArgsConstructor
public class ContentController {

    private final ContentService contentService;

    // ── PUBLIC — customer frontend reads these ────────────────────────────────

    /** GET /api/v1/content — full project content in one call */
    @GetMapping
    public ResponseEntity<ProjectContent> getAll() {
        return ResponseEntity.ok(contentService.get());
    }

    // ── ADMIN — content editors update these ─────────────────────────────────

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProjectContent> replaceAll(@RequestBody ProjectContent content) {
        return ResponseEntity.ok(contentService.update(content));
    }

    @PatchMapping("/hero")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProjectContent> patchHero(@RequestBody HeroContent hero) {
        return ResponseEntity.ok(contentService.patchHero(hero));
    }

    @PatchMapping("/highlights")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProjectContent> patchHighlights(@RequestBody List<Highlight> highlights) {
        return ResponseEntity.ok(contentService.patchHighlights(highlights));
    }

    @PatchMapping("/amenities")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProjectContent> patchAmenities(@RequestBody List<Amenity> amenities) {
        return ResponseEntity.ok(contentService.patchAmenities(amenities));
    }

    @PatchMapping("/distances")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProjectContent> patchDistances(@RequestBody List<DistanceItem> distances) {
        return ResponseEntity.ok(contentService.patchDistances(distances));
    }

    @PatchMapping("/quote")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProjectContent> patchQuote(@RequestBody QuoteContent quote) {
        return ResponseEntity.ok(contentService.patchQuote(quote));
    }

    @PatchMapping("/contact")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProjectContent> patchContact(@RequestBody ContactInfo contact) {
        return ResponseEntity.ok(contentService.patchContact(contact));
    }
}
