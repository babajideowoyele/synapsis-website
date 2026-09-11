# DPIA Screening Checklist for Audiovisual Research

**Adapted from the [Dutch DPA guidance](https://www.autoriteitpersoonsgegevens.nl/en/themes/basic-gdpr/gdpr-in-practice/data-protection-impact-assessment-dpia), [Utrecht University Data Privacy Handbook](https://utrechtuniversity.github.io/dataprivacyhandbook/dpia.html), and [ICT Institute DPIA template](https://ictinstitute.nl/gdpr-dpia-free-template/).**

Use this checklist to determine whether a full DPIA is needed for your audiovisual research project and to document the key privacy considerations. This is a screening tool — not a replacement for a full DPIA.

---

## Audience

- Researchers planning to collect or process video/audio data
- Privacy officers assessing audiovisual research projects
- Ethics boards reviewing masking-based de-identification proposals
- Data stewards advising on GDPR compliance

---

## 1. Project Overview

| Field | Value |
|-------|-------|
| **Project title** | |
| **Principal investigator** | |
| **Institution** | |
| **Privacy officer** | |
| **Date of screening** | |
| **Data processing start date** | |

---

## 2. DPIA Necessity Screening

A DPIA is **mandatory** if two or more of the following criteria apply (per EDPB guidelines). Check all that apply:

### High-Risk Criteria

- [ ] **Evaluation/scoring**: Profiling or predicting behavior from the recordings
- [ ] **Automated decision-making**: Algorithmic decisions with legal or significant effects
- [ ] **Systematic monitoring**: Ongoing observation of individuals (e.g., classroom cameras, workplace recording)
- [ ] **Sensitive data**: Processing biometric data for identification (face recognition, voice prints)
- [ ] **Large scale**: Processing data of many individuals (>100 participants, or institutional recording programs)
- [ ] **Data matching**: Combining video data with other datasets (surveys, grades, medical records)
- [ ] **Vulnerable data subjects**: Children, students, patients, employees, elderly
- [ ] **Innovative technology**: Novel AI/ML masking techniques, new processing methods
- [ ] **Blocking rights**: Processing prevents individuals from exercising rights or accessing services

### Result

- **2+ criteria checked**: Full DPIA required
- **1 criterion checked**: DPIA recommended
- **0 criteria checked**: DPIA not required (but document this screening)

> **Note for audiovisual masking**: Most video research projects will trigger at least "sensitive data" (biometric/facial) and often "vulnerable data subjects" (students, patients). A DPIA is typically required.

---

## 3. Data Processing Description

### What personal data is collected?

- [ ] Video recordings of identifiable individuals
- [ ] Audio recordings with identifiable voices
- [ ] Body movement / pose data
- [ ] Facial expressions / blendshapes
- [ ] Location data (visible in recordings)
- [ ] Other: ___

### Purpose of processing

| Question | Answer |
|----------|--------|
| What is the research question? | |
| Why is audiovisual data necessary? | |
| Can the research be done with non-personal data? | |
| What is the legal basis (GDPR Art. 6)? | |

### Data flow

| Stage | Description | Location | Access |
|-------|-------------|----------|--------|
| Collection | | | |
| Transfer | | | |
| Storage (originals) | | | |
| Processing (masking) | | | |
| Storage (masked output) | | | |
| Archiving | | | |
| Deletion | | | |

---

## 4. De-identification Assessment

### Masking approach

| Question | Answer |
|----------|--------|
| Which masking method(s) will be used? | Blur / Pixelation / Face swap / Neural / Other |
| Which tool(s)? | MaskAnyone / DeepPrivacy2 / Manual / Other |
| Will voice be anonymized? | Yes / No / N/A |
| Will pose/gesture data be preserved? | Yes / No |
| Who performs the masking? | Researcher / Platform / Third party |

### Re-identification risk

- [ ] Risk assessment performed for re-identification from masked output
- [ ] Risk assessment performed for re-identification from pose/kinematics data
- [ ] Risk assessment performed for voice re-identification (if audio preserved)
- [ ] Contextual re-identification considered (clothing, setting, body shape)
- [ ] Residual risk documented and accepted

> **Tip**: Even after face masking, individuals may be identifiable from context (distinctive clothing, body type, environment). Document what additional measures are taken.

---

## 5. Necessity and Proportionality

| Question | Yes/No | Justification |
|----------|--------|---------------|
| Is the data collection proportionate to the research aim? | | |
| Is the amount of data minimized? | | |
| Is the retention period limited and justified? | | |
| Are data subjects informed (consent/notice)? | | |
| Can data subjects exercise their rights (access, erasure)? | | |
| Is data quality ensured? | | |

---

## 6. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Re-identification from masked video | | | |
| Unauthorized access to original recordings | | | |
| Data breach during transfer | | | |
| Masking failure (face not detected) | | | |
| Voice re-identification | | | |
| Contextual re-identification | | | |
| Retention beyond agreed period | | | |

### Risk levels

- **Likelihood**: Rare / Unlikely / Possible / Likely
- **Impact**: Negligible / Limited / Significant / Maximum

---

## 7. Safeguards and Measures

### Technical measures

- [ ] Encryption at rest and in transit
- [ ] Access control (authentication, authorization)
- [ ] Audit logging of data access
- [ ] Automated data retention and deletion
- [ ] Secure processing environment (on-premise or SURF SANE)
- [ ] Quality check on masking output before release
- [ ] Backup and recovery procedures

### Organizational measures

- [ ] Data processing agreement with any third parties
- [ ] Staff training on data handling procedures
- [ ] Incident response plan
- [ ] Regular review of access permissions
- [ ] Clear roles and responsibilities documented

### Data subject rights

- [ ] Consent form reviewed and approved
- [ ] Procedure for data access requests
- [ ] Procedure for erasure requests
- [ ] Procedure for withdrawal of consent
- [ ] Contact point communicated to participants

---

## 8. Conclusion and Sign-off

| Field | Value |
|-------|-------|
| **DPIA required?** | Yes / No |
| **Residual risk level** | Low / Medium / High |
| **Acceptable?** | Yes / No (if No: escalate to DPO / supervisory authority) |
| **Reviewed by privacy officer** | Name, Date |
| **Reviewed by DPO** | Name, Date (if applicable) |
| **Next review date** | |

---

## Resources

- [Dutch DPA — DPIA guidance](https://www.autoriteitpersoonsgegevens.nl/en/themes/basic-gdpr/gdpr-in-practice/data-protection-impact-assessment-dpia)
- [Utrecht University Data Privacy Handbook](https://utrechtuniversity.github.io/dataprivacyhandbook/dpia.html)
- [ICT Institute — Free DPIA Template](https://ictinstitute.nl/gdpr-dpia-free-template/)
- [GDPR.eu — DPIA Template (PDF)](https://gdpr.eu/data-protection-impact-assessment-template/)
- [SYNAPSIS Informed Consent Templates](downloads/templates/informed-consent-EN.md)
- [SYNAPSIS Data Retention Policy](https://github.com/babajideowoyele/MaskAnyone_synapsis/blob/security/phase-0-aspi/docs/DATA-RETENTION-POLICY.md)
