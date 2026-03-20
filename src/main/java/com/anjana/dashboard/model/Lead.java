package com.anjana.dashboard.model;

import lombok.*;
import org.springframework.data.annotation.*;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.*;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
@Document(collection = "leads")
public class Lead {

    @Id private String id;

    @NotBlank(message = "Name is required")
    private String name;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Enter a valid 10-digit Indian mobile number")
    @Indexed
    private String phone;

    private String email;

    // What triggered the lead
    private LeadSource source;        // HERO_CTA, CATEGORY_ENQUIRY, CONTACT_FORM, STICKY_BAR, WHATSAPP
    private String     categoryInterest; // "East-Facing", "Corner Plots", "30×40"

    // Lead pipeline
    private LeadStatus status;        // NEW, CONTACTED, SITE_VISIT_SCHEDULED, CONVERTED, CLOSED

    private String notes;             // admin notes
    private LocalDateTime followUpAt;

    @CreatedDate  private LocalDateTime createdAt;
    @LastModifiedDate private LocalDateTime updatedAt;

    public enum LeadSource {
        HERO_CTA, CATEGORY_ENQUIRY, CONTACT_FORM, STICKY_BAR, WHATSAPP, FLOATING_BUTTON
    }

    public enum LeadStatus {
        NEW, CONTACTED, SITE_VISIT_SCHEDULED, CONVERTED, CLOSED
    }
}
