# Data Management Plan for Audiovisual Research Data

**SYNAPSIS Project Template - NWO Format**

---

## 1. General Information

### 1.1 Project Details

| Field | Information |
|-------|-------------|
| **Project Title** | [Insert project title] |
| **Project Number** | [Grant/project number] |
| **Principal Investigator** | [Name] |
| **Institution** | [University/Research Institute] |
| **Faculty/Department** | [Department name] |
| **Start Date** | [DD/MM/YYYY] |
| **End Date** | [DD/MM/YYYY] |
| **Funding Organization** | [e.g., NWO, ERC, institutional] |

### 1.2 DMP Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | [Date] | [Name] | Initial version |
| | | | |

---

## 2. Data Description

### 2.1 Data Types

This project will collect/generate the following audiovisual data:

| Data Type | Format | Estimated Volume | Description |
|-----------|--------|------------------|-------------|
| Video recordings | MP4, MOV, AVI | [X] GB/TB | [e.g., Interview recordings, classroom observations] |
| Audio recordings | WAV, MP3 | [X] GB | [e.g., Separate audio tracks, voice recordings] |
| Pose/skeletal data | JSON, CSV | [X] MB | Extracted body movement coordinates |
| Masked video | MP4 | [X] GB | De-identified video outputs |
| Metadata | JSON-LD, XML | [X] MB | Descriptive and technical metadata |

### 2.2 Data Sources

- [ ] **Primary collection**: New recordings made for this project
- [ ] **Secondary data**: Existing datasets (specify source: _____________)
- [ ] **Derived data**: Processed/extracted from primary sources

### 2.3 Sensitive Data Classification

| Category | Present | Handling Measures |
|----------|---------|-------------------|
| Personal data (GDPR) | Yes/No | De-identification via SYNAPSIS |
| Special category data | Yes/No | [Specify measures] |
| Identifiable faces | Yes/No | Face masking/swapping |
| Identifiable voices | Yes/No | Voice anonymization |
| Location data | Yes/No | [Specify measures] |
| Minors' data | Yes/No | [Additional consent procedures] |

---

## 3. Data Collection and Processing

### 3.1 Collection Methods

| Method | Equipment | Settings | Responsible |
|--------|-----------|----------|-------------|
| Video recording | [Camera model] | [Resolution, FPS] | [Name/Role] |
| Audio recording | [Microphone] | [Sample rate] | [Name/Role] |
| [Other] | | | |

### 3.2 De-identification Workflow (SYNAPSIS Platform)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Raw Recording  │ ──▶ │    SYNAPSIS     │ ──▶ │  Masked Output  │
│   (Original)    │     │   Processing    │     │ (De-identified) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                      │                        │
         ▼                      ▼                        ▼
   Secure upload         Face masking            Quality review
   to SURF SANE         Voice anonymization      Pose extraction
                        Pose extraction          Metadata generation
```

### 3.3 Masking Configuration

| Parameter | Selected Option | Rationale |
|-----------|-----------------|-----------|
| Face method | [ ] Blur / [ ] Pixelate / [ ] Face masking / [ ] DeepPrivacy2 | [Explain choice] |
| Blur intensity | [ ] Low / [ ] Medium / [ ] High | |
| Voice method | [ ] Pitch shift / [ ] Formant / [ ] None / [ ] Remove | |
| Pose extraction | [ ] Yes / [ ] No | |
| Pose model | [ ] MediaPipe / [ ] OpenPose / [ ] YOLO | |

---

## 4. Data Storage and Security

### 4.1 Storage Locations

| Data Stage | Storage Location | Access Level | Retention |
|------------|------------------|--------------|-----------|
| Raw (unmasked) | SURF SANE | PI + designated researchers | Until processing complete + [X] days |
| Processing | SYNAPSIS/SURF | System only | Temporary |
| Masked outputs | [Institutional storage] | Project team | Duration of project + [X] years |
| Archived | DANS | Controlled/Open | Long-term |

### 4.2 Security Measures

- [ ] **Encryption at rest**: AES-256 encryption for stored data
- [ ] **Encryption in transit**: TLS 1.3 for all transfers
- [ ] **Access control**: Role-based access with institutional SSO
- [ ] **Audit logging**: All access and modifications logged
- [ ] **Two-factor authentication**: Required for SYNAPSIS platform access
- [ ] **Physical security**: Data centers in Netherlands (SURF)

### 4.3 Backup Strategy

| Data Type | Backup Frequency | Backup Location | Retention |
|-----------|------------------|-----------------|-----------|
| Raw recordings | [Daily/Weekly] | [Location] | [Duration] |
| Masked outputs | [Daily/Weekly] | [Location] | [Duration] |
| Metadata | [Daily/Weekly] | [Location] | [Duration] |

---

## 5. Data Documentation and Metadata

### 5.1 Documentation Standards

This project follows:
- [ ] SYNAPSIS Metadata Schema (JSON-LD)
- [ ] Dublin Core for descriptive metadata
- [ ] DANS metadata requirements
- [ ] [Other standards: _______________]

### 5.2 Metadata Elements

| Element | Description | Example |
|---------|-------------|---------|
| `title` | Recording title | "Interview Session 001" |
| `creator` | Researcher name | "J. Smith" |
| `date` | Recording date | "2026-03-15" |
| `format` | File format | "video/mp4" |
| `duration` | Length in seconds | 1800 |
| `maskingMethod` | De-identification applied | "face_swap, pitch_shift" |
| `maskingDate` | When masking was performed | "2026-03-20" |
| `poseDataExtracted` | Whether pose was extracted | true |
| `consentReference` | Link to consent form | "consent_001.pdf" |

### 5.3 File Naming Convention

```
[ProjectCode]_[DataType]_[SessionID]_[Version].[ext]

Examples:
SYNAPSIS_video_001_raw.mp4       (original recording)
SYNAPSIS_video_001_masked.mp4   (de-identified version)
SYNAPSIS_pose_001.json          (extracted pose data)
SYNAPSIS_meta_001.json          (metadata file)
```

---

## 6. Data Sharing and Access

### 6.1 Access Levels

| Data Type | Access Level | Conditions |
|-----------|--------------|------------|
| Raw (unmasked) | Restricted | PI approval, ethics clearance |
| Masked video | Controlled | Registration, terms acceptance |
| Pose data only | Open | Attribution required |
| Aggregated results | Open | CC-BY license |

### 6.2 Sharing Timeline

| Milestone | Data Available | Access Type |
|-----------|----------------|-------------|
| Project completion | Masked datasets | Controlled |
| Publication | Supporting data | Open/Controlled |
| After embargo | Full dataset | Open (where possible) |

### 6.3 Data Use Agreement

Users accessing controlled data must agree to:
- [ ] Use data for research purposes only
- [ ] Not attempt to re-identify individuals
- [ ] Cite the dataset appropriately
- [ ] Report any data breaches
- [ ] Not redistribute without permission

---

## 7. Legal and Ethical Considerations

### 7.1 Ethics Approval

| Requirement | Status | Reference |
|-------------|--------|-----------|
| Institutional ethics approval | [ ] Obtained / [ ] Pending | [Reference number] |
| GDPR compliance assessment | [ ] Completed | [Date] |
| Data Protection Impact Assessment | [ ] Required / [ ] Not required | [If required: reference] |

### 7.2 Informed Consent

- [ ] SYNAPSIS consent template used (adapted for project)
- [ ] Consent covers: video recording, audio recording, de-identification, archiving, sharing
- [ ] Participant withdrawal procedure documented
- [ ] Consent forms stored securely at: [Location]

### 7.3 Legal Basis for Processing (GDPR Art. 6)

- [ ] Consent (Art. 6(1)(a))
- [ ] Legitimate interests (Art. 6(1)(f)) - specify: _______________
- [ ] Public interest/scientific research (Art. 6(1)(e) + Art. 89)

---

## 8. Data Archiving and Preservation

### 8.1 Archive Selection

| Archive | Data Types | Format | Timeline |
|---------|------------|--------|----------|
| DANS | Masked video, pose data, metadata | MP4, JSON | End of project |
| [Institutional repository] | [Types] | [Formats] | [Timeline] |
| [Other] | | | |

### 8.2 Preservation Actions

- [ ] Format migration plan for long-term accessibility
- [ ] Persistent identifiers (DOI) assigned via DANS
- [ ] Metadata meets FAIR principles
- [ ] License clearly specified (recommended: CC-BY or CC-BY-NC)

### 8.3 Retention Schedule

| Data Type | Minimum Retention | Maximum Retention | Disposal Method |
|-----------|-------------------|-------------------|-----------------|
| Raw (unmasked) | [X] months | [X] years | Secure deletion |
| Masked video | 10 years | Indefinite | Archive |
| Pose data | 10 years | Indefinite | Archive |
| Consent forms | Duration + 10 years | | Secure storage |

---

## 9. Roles and Responsibilities

| Role | Name | Responsibilities |
|------|------|------------------|
| Principal Investigator | [Name] | Overall DMP oversight, ethics compliance |
| Data Manager | [Name] | Day-to-day data management, SYNAPSIS operations |
| Data Steward | [Name] | Institutional guidance, archiving coordination |
| Technical Support | [Name] | Infrastructure, security |

---

## 10. Budget and Resources

| Item | Cost | Funding Source |
|------|------|----------------|
| SURF SANE storage | €[X]/year | [Grant/Institutional] |
| SYNAPSIS platform access | Free (NWO partners) | N/A |
| DANS archiving | €[X] | [Grant/Institutional] |
| Data management personnel | €[X] | [Grant] |
| **Total** | €[X] | |

---

## 11. Review and Updates

This DMP will be reviewed:
- [ ] At project milestones
- [ ] Upon significant changes to data collection
- [ ] Annually
- [ ] Upon request from funder/ethics board

**Next scheduled review**: [Date]

---

## Appendices

- [ ] A: Consent form template
- [ ] B: Metadata schema documentation
- [ ] C: Data use agreement template
- [ ] D: SYNAPSIS processing configuration

---

*This template is provided by the SYNAPSIS project (NWO TDCC-SSH) and follows NWO data management requirements. Adapt as needed for your specific project and funder requirements.*

**Version**: 1.0 | **Last Updated**: January 2026

**References**:
- NWO Data Management Protocol: https://www.nwo.nl/en/data-management
- DANS: https://dans.knaw.nl
- SYNAPSIS: https://synapsis.nl
