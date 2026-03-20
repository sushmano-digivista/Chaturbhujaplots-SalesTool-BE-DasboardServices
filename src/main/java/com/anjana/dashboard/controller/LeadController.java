package com.anjana.dashboard.controller;

import com.anjana.dashboard.model.Lead;
import com.anjana.dashboard.model.Lead.LeadStatus;
import com.anjana.dashboard.service.LeadService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/leads")
@RequiredArgsConstructor
public class LeadController {

    private final LeadService leadService;

    // ── PUBLIC — customer frontend calls this ─────────────────────────────────
    /**
     * POST /api/v1/leads
     * No auth. Captures any enquiry from the customer site.
     */
    @PostMapping
    public ResponseEntity<Lead> submit(@Valid @RequestBody Lead lead) {
        return ResponseEntity.status(HttpStatus.CREATED).body(leadService.submit(lead));
    }

    // ── ADMIN only ────────────────────────────────────────────────────────────

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Lead>> getAll() {
        return ResponseEntity.ok(leadService.getAll());
    }

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(leadService.getStats());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Lead> getById(@PathVariable String id) {
        return ResponseEntity.ok(leadService.getById(id));
    }

    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Lead> updateStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> body) {

        LeadStatus status = body.containsKey("status")
                ? LeadStatus.valueOf(body.get("status").toUpperCase()) : null;
        LocalDateTime followUp = body.containsKey("followUpAt")
                ? LocalDateTime.parse(body.get("followUpAt")) : null;
        return ResponseEntity.ok(
                leadService.updateStatus(id, status, body.get("notes"), followUp));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        leadService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
