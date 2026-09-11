# Pilot Project Planning Template

**SYNAPSIS Project - Institutional Pilot Setup**

---

## Basic Information

| Field | Value |
|-------|-------|
| **Pilot Name** | [Name] |
| **Institution** | [University/Organization] |
| **Contact Person** | [Name, Email] |
| **Start Date** | [DD/MM/YYYY] |
| **End Date** | [DD/MM/YYYY] |
| **Status** | Planning / Active / Completed |

---

## 1. Use Case Description

### Context

[Describe the research or educational context where video masking is needed. What kind of recordings? What is the research question?]

### Data Type

- [ ] Video recordings (classroom, interview, clinical, fieldwork)
- [ ] Audio recordings
- [ ] Both audio and video
- [ ] Other: ___

### Privacy Requirements

- [ ] Face masking required
- [ ] Voice anonymization required
- [ ] Body/gesture preservation needed (pose data extraction)
- [ ] Background masking needed
- [ ] Object tracking and masking
- [ ] Other: ___

### Volume Estimate

| Metric | Estimate |
|--------|----------|
| Number of recordings | |
| Average duration per recording | |
| Total data volume (GB) | |
| Number of individuals in recordings | |
| Desired turnaround time | |

---

## 2. Stakeholders

| Role | Name | Contact | Involvement |
|------|------|---------|-------------|
| Research Lead | | | Defines requirements, validates results |
| Privacy Officer | | | DPIA/ASPI assessment, policy review |
| Ethics Committee | | | Ethics approval |
| Technical Contact | | | Deployment, integration |
| Data Steward | | | Data management plan, archiving |
| IT Department | | | Infrastructure, network, security |

---

## 3. Compliance Requirements

### Privacy Assessment

- [ ] Pre-DPIA completed
- [ ] Full DPIA required (if processing sensitive data at scale)
- [ ] ASPI (Application Security & Privacy Impact) assessment needed
- [ ] Information security officer consulted

### Ethics

- [ ] Ethics committee approval required
- [ ] Ethics application submitted (ref: ___)
- [ ] Informed consent templates prepared (see SYNAPSIS templates)

### Data Processing

- [ ] Data processing agreement with SYNAPSIS/host institution
- [ ] Data retention period agreed: ___ days
- [ ] Data deletion procedure documented
- [ ] Audit logging requirements confirmed

---

## 4. Technical Setup

### Deployment Option

- [ ] **Hosted**: Use SYNAPSIS central deployment (recommended for pilots)
- [ ] **On-premise**: Deploy on institutional infrastructure
- [ ] **Hybrid**: Central processing with local data storage

### Access

- [ ] User accounts created in Keycloak
- [ ] VPN/network access configured (if on-premise)
- [ ] Access URL documented: ___

### Testing

- [ ] Test with 2-3 sample videos before full pilot
- [ ] Validate masking quality meets research requirements
- [ ] Test data export (masked video, kinematics, blendshapes)
- [ ] Confirm processing time is acceptable

---

## 5. Implementation Plan

### Phase 1: Setup (2-4 weeks)

- [ ] Initial meeting with stakeholders
- [ ] Requirements gathered and documented
- [ ] Compliance pathway initiated (DPIA/ethics)
- [ ] Technical environment provisioned
- [ ] User accounts created

### Phase 2: Testing (2-4 weeks)

- [ ] Test with sample data (non-sensitive)
- [ ] Validate masking quality and settings
- [ ] User feedback collected
- [ ] Configuration adjusted based on feedback
- [ ] Compliance approval received

### Phase 3: Production (4-8 weeks)

- [ ] Full data processing begins
- [ ] Quality assurance on output
- [ ] Ongoing user support
- [ ] Progress monitoring

### Phase 4: Evaluation (2 weeks)

- [ ] Pilot evaluation survey
- [ ] Lessons learned documented
- [ ] Recommendations for scaling
- [ ] Handover to ongoing operations (if applicable)

---

## 6. Success Criteria

| Criterion | Target | Measurement |
|-----------|--------|-------------|
| Masking quality | >95% face detection | Visual inspection + MaskBench |
| Processing throughput | [X] videos/day | Platform metrics |
| User satisfaction | >4/5 rating | Post-pilot survey |
| Compliance | All requirements met | Privacy officer sign-off |
| Data preservation | Pose/gesture data intact | Researcher validation |

---

## 7. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| DPIA delays | Medium | High | Start early, use pre-DPIA template |
| GPU availability | Medium | Medium | CPU offloading mode available |
| Masking quality insufficient | Low | High | Test early with sample data |
| User adoption low | Low | Medium | Training session + documentation |
| IT infrastructure issues | Medium | High | Central hosted option as fallback |

---

## 8. Timeline

| Milestone | Target Date | Actual Date | Status |
|-----------|-------------|-------------|--------|
| Kickoff meeting | | | |
| Requirements complete | | | |
| Compliance approved | | | |
| Test phase complete | | | |
| Production start | | | |
| Evaluation complete | | | |

---

## 9. Lessons Learned

[To be completed after pilot]

---

## Notes & Updates

| Date | Update |
|------|--------|
| | |
