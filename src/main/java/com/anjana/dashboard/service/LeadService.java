package com.anjana.dashboard.service;

import com.anjana.dashboard.model.Lead;
import com.anjana.dashboard.model.Lead.*;
import com.anjana.dashboard.model.ProjectContent;
import com.anjana.dashboard.repository.LeadRepository;
import com.anjana.dashboard.repository.ProjectContentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.List;
import java.util.Map;

// ── Lead Service ──────────────────────────────────────────────────────────────
@Slf4j
@Service
@RequiredArgsConstructor
public class LeadService {

    private final LeadRepository leadRepo;

    public Lead submit(Lead lead) {
        lead.setStatus(LeadStatus.NEW);
        Lead saved = leadRepo.save(lead);
        log.info("New lead: {} | {} | {} | {}", saved.getName(), saved.getPhone(),
                 saved.getSource(), saved.getCategoryInterest());
        return saved;
    }

    public List<Lead> getAll()  { return leadRepo.findAllByOrderByCreatedAtDesc(); }

    public Lead getById(String id) {
        return leadRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Lead not found: " + id));
    }

    public Lead updateStatus(String id, LeadStatus status, String notes, LocalDateTime followUpAt) {
        Lead lead = getById(id);
        if (status    != null) lead.setStatus(status);
        if (notes     != null) lead.setNotes(notes);
        if (followUpAt!= null) lead.setFollowUpAt(followUpAt);
        return leadRepo.save(lead);
    }

    public void delete(String id) { leadRepo.deleteById(id); }

    public Map<String, Long> getStats() {
        LocalDateTime todayStart = LocalDateTime.of(LocalDate.now(), LocalTime.MIDNIGHT);
        return Map.of(
            "total",      leadRepo.count(),
            "today",      leadRepo.countByCreatedAtAfter(todayStart),
            "new",        leadRepo.countByStatus(LeadStatus.NEW),
            "contacted",  leadRepo.countByStatus(LeadStatus.CONTACTED),
            "converted",  leadRepo.countByStatus(LeadStatus.CONVERTED)
        );
    }
}
