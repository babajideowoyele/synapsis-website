# Masking Report Template

**SYNAPSIS Project - De-identification Documentation**

---

## Report Information

| Field | Value |
|-------|-------|
| **Report ID** | [AUTO-GENERATED or custom ID] |
| **Date Generated** | [DD/MM/YYYY] |
| **Prepared By** | [Researcher name] |
| **Institution** | [University/Organization] |
| **Project/Study** | [Project title] |

---

## 1. Executive Summary

This report documents the de-identification procedures applied to audiovisual research data using the SYNAPSIS platform. The masking was performed to enable GDPR-compliant data sharing while preserving research utility.

| Metric | Value |
|--------|-------|
| **Total files processed** | [X] |
| **Total duration** | [X hours X minutes] |
| **Processing date** | [DD/MM/YYYY] |
| **Primary masking method** | [Face masking / Blur / Pixelate] |
| **Quality assessment** | [Excellent / Good / Acceptable] |

---

## 2. Source Data Description

### 2.1 Original Recordings

| Property | Details |
|----------|---------|
| **Recording context** | [Interview / Classroom / Laboratory / Field] |
| **Number of files** | [X] |
| **Total duration** | [HH:MM:SS] |
| **Video format** | [MP4 / MOV / AVI] |
| **Resolution** | [1920x1080 / 3840x2160 / Other] |
| **Frame rate** | [24 / 25 / 30 / 60 fps] |
| **Audio format** | [AAC / PCM / MP3] |
| **Sample rate** | [44.1kHz / 48kHz] |

### 2.2 Participants

| Property | Details |
|----------|---------|
| **Number of participants** | [X] |
| **Age range** | [X - X years] |
| **Includes minors** | [Yes / No] |
| **Consent obtained** | [Yes] |
| **Consent reference** | [Consent form ID/location] |

### 2.3 Sensitive Elements Identified

- [ ] Faces clearly visible
- [ ] Voices identifiable
- [ ] Names spoken/visible
- [ ] Location identifiers visible
- [ ] License plates visible
- [ ] Other identifying information: [specify]

---

## 3. Masking Configuration

### 3.1 Face De-identification

| Parameter | Setting | Notes |
|-----------|---------|-------|
| **Method** | [Blur / Pixelate / Face Masking / DeepPrivacy2] | |
| **Intensity** | [Low / Medium / High] | |
| **Detection model** | [RetinaFace / MTCNN / MediaPipe] | |
| **Confidence threshold** | [0.X] | Faces below threshold may be missed |
| **Temporal smoothing** | [Enabled / Disabled] | Reduces flickering |
| **Expression preservation** | [Yes / No] | For face masking methods |

**Rationale for method selection:**
[Explain why this method was chosen - e.g., "Face masking selected to preserve facial expressions important for emotion research while ensuring privacy protection."]

### 3.2 Voice Anonymization

| Parameter | Setting | Notes |
|-----------|---------|-------|
| **Method** | [Pitch Shift / Formant / Vocoder / None / Removed] | |
| **Pitch shift** | [+/- X semitones] | |
| **Prosody preservation** | [Yes / No] | |
| **Content intelligibility** | [Preserved / Partially preserved / Not preserved] | |

**Rationale:**
[Explain voice masking choice]

### 3.3 Body/Pose Handling

| Parameter | Setting | Notes |
|-----------|---------|-------|
| **Body masking** | [None / Silhouette / Blur] | |
| **Pose extraction** | [Yes / No] | |
| **Pose model** | [MediaPipe / OpenPose / YOLO-Pose] | |
| **Keypoint schema** | [COCO / MPII / MediaPipe] | |
| **Keypoints extracted** | [X] | |

### 3.4 Additional Masking

| Target | Method | Applied |
|--------|--------|---------|
| Background | [Blur / Replace / None] | [Yes / No] |
| Text/Documents | [Blur / Redact / None] | [Yes / No] |
| License plates | [Blur / None] | [Yes / No] |
| Logos/Brands | [Blur / None] | [Yes / No] |

---

## 4. Processing Details

### 4.1 Platform Information

| Property | Value |
|----------|-------|
| **Platform** | SYNAPSIS |
| **Version** | [X.X.X] |
| **Processing location** | SURF Infrastructure, Netherlands |
| **Processing date** | [DD/MM/YYYY] |
| **Processing duration** | [X hours X minutes] |
| **Workflow ID** | [Unique identifier] |

### 4.2 File-by-File Summary

| Original File | Duration | Faces Detected | Masking Applied | Output File | Status |
|---------------|----------|----------------|-----------------|-------------|--------|
| recording_001.mp4 | 00:15:32 | 2 | Face masking, Pitch shift | recording_001_masked.mp4 | Complete |
| recording_002.mp4 | 00:22:45 | 3 | Face masking, Pitch shift | recording_002_masked.mp4 | Complete |
| [Add more rows] | | | | | |

### 4.3 Extracted Data

| Data Type | Format | File | Size |
|-----------|--------|------|------|
| Pose data | JSON | recording_001_pose.json | [X] KB |
| Metadata | JSON-LD | recording_001_meta.json | [X] KB |
| [Add more rows] | | | |

---

## 5. Quality Assessment

### 5.1 Automated Metrics

| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| Face detection rate | [X]% | >95% | [Pass / Fail] |
| Masking coverage | [X]% | >99% | [Pass / Fail] |
| Temporal consistency | [X]% | >90% | [Pass / Fail] |
| Pose extraction accuracy | [X]% | >85% | [Pass / Fail] |
| Audio clarity (if applicable) | [X] dB | >-20 dB | [Pass / Fail] |

### 5.2 Manual Review

| Check | Result | Notes |
|-------|--------|-------|
| All faces masked in spot checks | [Yes / No / Partial] | |
| Masking consistent across frames | [Yes / No / Partial] | |
| No identity leakage observed | [Yes / No] | |
| Research features preserved | [Yes / No / Partial] | |
| Audio intelligible (if applicable) | [Yes / No] | |

**Reviewer:** [Name]
**Review date:** [DD/MM/YYYY]

### 5.3 Known Limitations

- [ ] Some profile views may have reduced masking quality
- [ ] Rapid movement may cause brief masking gaps
- [ ] Small/distant faces may be missed
- [ ] [Other limitations specific to this dataset]

**Mitigation measures:**
[Describe any additional steps taken to address limitations]

---

## 6. Privacy Assessment

### 6.1 Re-identification Risk

| Risk Factor | Assessment | Mitigation |
|-------------|------------|------------|
| Face re-identification | [Low / Medium / High] | [Masking method used] |
| Voice re-identification | [Low / Medium / High] | [Voice modification applied] |
| Contextual identification | [Low / Medium / High] | [Background blur, metadata stripped] |
| Gait/movement patterns | [Low / Medium / High] | [Not applicable / Pose only data] |

**Overall re-identification risk:** [Low / Medium / High]

### 6.2 GDPR Compliance

| Requirement | Status | Evidence |
|-------------|--------|----------|
| Lawful basis established | [Yes] | [Consent / Legitimate interest] |
| Informed consent obtained | [Yes] | [Consent form reference] |
| Data minimization applied | [Yes] | [Only necessary data retained] |
| Purpose limitation respected | [Yes] | [Research purpose documented] |
| Storage limitation defined | [Yes] | [Retention period: X years] |
| Security measures in place | [Yes] | [Encryption, access control] |

### 6.3 Ethics Board Compliance

| Requirement | Status | Reference |
|-------------|--------|-----------|
| Ethics approval obtained | [Yes / Pending / Not required] | [Approval number] |
| Masking plan approved | [Yes / No / N/A] | |
| Participant withdrawal procedure | [Documented] | [Procedure reference] |

---

## 7. Output Summary

### 7.1 Deliverables

| Deliverable | Description | Location |
|-------------|-------------|----------|
| Masked videos | De-identified video files | [Path/URL] |
| Pose data | Extracted skeletal coordinates | [Path/URL] |
| Metadata | JSON-LD metadata files | [Path/URL] |
| This report | Processing documentation | [Path/URL] |

### 7.2 File Checksums

| File | SHA-256 Hash |
|------|--------------|
| recording_001_masked.mp4 | [hash] |
| recording_001_pose.json | [hash] |
| [Add more rows] | |

### 7.3 Recommended Access Level

Based on the masking applied and residual risks:

- [ ] **Open access** - Suitable for unrestricted sharing
- [ ] **Controlled access** - Requires registration and terms acceptance
- [ ] **Restricted access** - Requires approval and data use agreement
- [ ] **Embargoed** - Available after [date]

**Justification:**
[Explain the recommended access level]

---

## 8. Archiving Information

### 8.1 Archive Destination

| Property | Value |
|----------|-------|
| **Archive** | [DANS / Institutional repository / Other] |
| **Submission date** | [DD/MM/YYYY] |
| **DOI** | [10.xxxx/xxxxx or "Pending"] |
| **License** | [CC-BY / CC-BY-NC / Other] |

### 8.2 Metadata Completeness

| Element | Provided | Notes |
|---------|----------|-------|
| Title | [Yes] | |
| Creator | [Yes] | |
| Subject keywords | [Yes] | |
| Description | [Yes] | |
| Rights/License | [Yes] | |
| Masking provenance | [Yes] | |

---

## 9. Certification

### Researcher Certification

I certify that:
- The masking procedures described in this report were applied as documented
- The quality assessment was conducted honestly and thoroughly
- To my knowledge, the masked data does not contain identifiable information
- The original (unmasked) data has been / will be handled according to the data management plan

**Name:** _________________________________

**Signature:** _________________________________

**Date:** _________________________________

### Data Steward Review (Optional)

Reviewed by: _________________________________

Institution: _________________________________

Date: _________________________________

Comments: _________________________________

---

## 10. Appendices

### Appendix A: Consent Form Template Used
[Reference or attach the consent form template]

### Appendix B: Full Processing Log
[Include or link to detailed processing logs if available]

### Appendix C: Quality Review Screenshots
[Include sample screenshots showing masking quality - ensure these are from masked outputs only]

### Appendix D: Configuration Export
[Include or link to the exported SYNAPSIS configuration file]

---

## Document Information

| Property | Value |
|----------|-------|
| **Template version** | 1.0 |
| **Last updated** | January 2026 |
| **Provided by** | SYNAPSIS Project (NWO TDCC-SSH) |
| **Contact** | babajide.owoyele@ru.nl |

---

*This template is provided by the SYNAPSIS project to support documentation of audiovisual data de-identification for ethics boards, publications, and data archives.*
