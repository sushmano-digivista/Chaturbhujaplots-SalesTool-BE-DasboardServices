package com.anjana.dashboard.service;

import com.anjana.dashboard.model.ProjectContent;
import com.anjana.dashboard.model.ProjectContent.*;
import com.anjana.dashboard.repository.ProjectContentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContentService {

    private static final String CONTENT_ID = "CONTENT";
    private final ProjectContentRepository contentRepo;

    public ProjectContent get() {
        return contentRepo.findById(CONTENT_ID)
                .orElseGet(this::seedDefault);
    }

    public ProjectContent update(ProjectContent updated) {
        updated.setId(CONTENT_ID);
        return contentRepo.save(updated);
    }

    /** Partial update — only supplied fields are replaced */
    public ProjectContent patchHero(HeroContent hero) {
        ProjectContent c = get(); c.setHero(hero); return contentRepo.save(c);
    }
    public ProjectContent patchHighlights(List<Highlight> highlights) {
        ProjectContent c = get(); c.setHighlights(highlights); return contentRepo.save(c);
    }
    public ProjectContent patchAmenities(List<Amenity> amenities) {
        ProjectContent c = get(); c.setAmenities(amenities); return contentRepo.save(c);
    }
    public ProjectContent patchDistances(List<DistanceItem> distances) {
        ProjectContent c = get(); c.setDistances(distances); return contentRepo.save(c);
    }
    public ProjectContent patchQuote(QuoteContent quote) {
        ProjectContent c = get(); c.setQuote(quote); return contentRepo.save(c);
    }
    public ProjectContent patchContact(ContactInfo contact) {
        ProjectContent c = get(); c.setContact(contact); return contentRepo.save(c);
    }

    // ── Default seed data ──────────────────────────────────────────────────
    private ProjectContent seedDefault() {
        ProjectContent c = ProjectContent.builder()
            .id(CONTENT_ID)
            .hero(HeroContent.builder()
                .headline("Premium Plots")
                .subheadline("Amaravati")
                .description("Secure your land just 8 km from Andhra Pradesh's new capital city — fully CRDA & RERA approved.")
                .approvalBadges(List.of("CRDA Approved · LP No: 35/2025","AP RERA · P06060125894","Ready for Construction"))
                .build())
            .highlights(List.of(
                Highlight.builder().icon("🛣️").title("Near National Highway").description("Direct access to NH-16, connecting major cities.").sortOrder(1).build(),
                Highlight.builder().icon("🏛️").title("8 km from Amaravati").description("Minutes from AP's new capital city.").sortOrder(2).build(),
                Highlight.builder().icon("🚆").title("Road & Rail Connectivity").description("Proposed express highway and railway expansion.").sortOrder(3).build(),
                Highlight.builder().icon("🏭").title("Logistic Hub, Paritala").description("Upcoming industrial and logistics corridor.").sortOrder(4).build(),
                Highlight.builder().icon("🎓").title("Educational & Medical").description("SRM, NRI Medical College within 10 km.").sortOrder(5).build(),
                Highlight.builder().icon("🏏").title("Mulapadu Stadium").description("International-grade cricket stadium nearby.").sortOrder(6).build()
            ))
            .amenities(List.of(
                Amenity.builder().tab("INFRA").icon("🏛️").label("Grand Entrance Arch").sortOrder(1).build(),
                Amenity.builder().tab("INFRA").icon("🛤️").label("60ft & 40ft Roads").sortOrder(2).build(),
                Amenity.builder().tab("INFRA").icon("💡").label("Underground Electricity").sortOrder(3).build(),
                Amenity.builder().tab("INFRA").icon("💧").label("Water Pipeline").sortOrder(4).build(),
                Amenity.builder().tab("INFRA").icon("🅿️").label("Visitor Parking").sortOrder(5).build(),
                Amenity.builder().tab("INFRA").icon("🔒").label("Gated Security").sortOrder(6).build(),
                Amenity.builder().tab("INFRA").icon("🙏").label("Hanuman Temple Nearby")
                    .featured(true).featuredDesc("A magnificent large Hanuman statue temple is located just minutes from Anjana Paradise.").sortOrder(7).build(),
                Amenity.builder().tab("LIFESTYLE").icon("🏃").label("Jogging Track").sortOrder(1).build(),
                Amenity.builder().tab("LIFESTYLE").icon("☮️").label("100% Vaastu Compliant").sortOrder(2).build(),
                Amenity.builder().tab("LIFESTYLE").icon("🗿").label("Buddha Statue").sortOrder(3).build(),
                Amenity.builder().tab("LIFESTYLE").icon("🌸").label("Floral Gardens").sortOrder(4).build(),
                Amenity.builder().tab("UTILITIES").icon("🌐").label("Fibre Internet Ready").sortOrder(1).build(),
                Amenity.builder().tab("UTILITIES").icon("⚡").label("Solar Street Lights").sortOrder(2).build(),
                Amenity.builder().tab("UTILITIES").icon("📡").label("CCTV Surveillance").sortOrder(3).build()
            ))
            .distances(List.of(
                DistanceItem.builder().icon("🏛️").name("Amaravati Capital").subtitle("New State Capital").distance("8 km").sortOrder(1).build(),
                DistanceItem.builder().icon("🛣️").name("NH-16 Highway").subtitle("Direct access").distance("3 km").sortOrder(2).build(),
                DistanceItem.builder().icon("🎓").name("SRM University").subtitle("Engineering & Medical").distance("6 km").sortOrder(3).build(),
                DistanceItem.builder().icon("🏥").name("NRI Medical College").subtitle("Healthcare hub").distance("7 km").sortOrder(4).build(),
                DistanceItem.builder().icon("🏏").name("Mulapadu Stadium").subtitle("International facility").distance("4 km").sortOrder(5).build(),
                DistanceItem.builder().icon("✈️").name("Vijayawada Airport").subtitle("Air connectivity").distance("22 km").sortOrder(6).build()
            ))
            .quote(QuoteContent.builder()
                .investLine1("Invest ₹2 Today —")
                .investLine2("Receive ₹20 Tomorrow")
                .quote("If you invest 2 rupees now, in a few years it will be 10 times your investment.")
                .stats(List.of(
                    new QuoteStat("10×","Expected Return"),
                    new QuoteStat("5–7","Years Horizon"),
                    new QuoteStat("Safe","CRDA + RERA")
                ))
                .build())
            .stats(List.of(
                new StatItem("120+","Total Plots"),
                new StatItem("8 km","From Amaravati"),
                new StatItem("2025","CRDA Approved")
            ))
            .contact(ContactInfo.builder()
                .phone("+91 99999 99999")
                .whatsapp("919999999999")
                .email("info@anjanaparadise.in")
                .address("Paritala, Krishna District, Andhra Pradesh 521180")
                .mapEmbedUrl("https://maps.google.com/maps?q=Paritala,Andhra+Pradesh,India&t=k&z=14&ie=UTF8&iwloc=&output=embed")
                .mapOpenUrl("https://maps.google.com/?q=Paritala,Krishna+District,Andhra+Pradesh")
                .build())
            .build();
        ProjectContent saved = contentRepo.save(c);
        log.info("✓ Default project content seeded");
        return saved;
    }
}
