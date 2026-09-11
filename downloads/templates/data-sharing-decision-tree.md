# Data Sharing Decision Tree for Audiovisual Research

**Adapted from [RDNL Beyond Personal Data guidebooks](https://researchdata.nl/en/2026/03/guidebooks-support-researchers-on-hard-to-share-data/), [CESSDA DMEG](https://dmeg.cessda.eu/), and [ODISSEI](https://odissei-data.nl/) guidance.**

This decision tree helps researchers and data stewards determine the appropriate sharing strategy for audiovisual research data, balancing openness with privacy obligations.

---

## Audience

- Researchers deciding how to share video/audio data
- Data stewards advising on access levels
- Funders (NWO, ERC) reviewing data management plans
- Ethics boards assessing data sharing proposals
- Archive managers (DANS, DataverseNL) accepting deposits

---

## The Decision Tree

### Step 1: Can the data be fully anonymized?

**Does masking remove all identifiable information?**

| Consideration | Check |
|---------------|-------|
| Faces fully masked (all individuals, all frames) | [ ] |
| Voices anonymized (if audio included) | [ ] |
| No identifying text visible (name badges, whiteboards) | [ ] |
| No identifying context (unique locations, distinctive items) | [ ] |
| Re-identification risk assessed and documented | [ ] |
| Body shape/movement not re-identifiable in context | [ ] |

**If ALL checked** → Go to **Path A: Open Sharing**

**If ANY unchecked** → Go to Step 2

---

### Step 2: Can a de-identified derivative be shared?

**Can you create a version that removes identifiers while preserving research value?**

| Derivative type | Preserves | Removes |
|----------------|-----------|---------|
| Masked video (face swap) | Gestures, context, interaction | Facial identity |
| Pose skeleton data (CSV/JSON) | Body movement, kinematics | All visual identity |
| Blendshapes only | Facial expressions (numeric) | Visual appearance |
| Aggregated statistics | Patterns, distributions | Individual data |
| Audio transcripts | Speech content | Voice identity |

**If a useful derivative exists** → Go to **Path B: Tiered Sharing**

**If no derivative preserves research value** → Go to Step 3

---

### Step 3: Can controlled access be arranged?

**Is the data valuable enough that other researchers should be able to access it under conditions?**

| Access mechanism | Description |
|------------------|-------------|
| SURF SANE | Secure Analysis Environment — remote desktop, data never leaves |
| DANS restricted access | Mediated access with Data Use Agreement |
| Institutional data room | Physical or virtual secure access at your institution |
| Researcher-to-researcher | Direct sharing under bilateral agreement |

**If controlled access is feasible** → Go to **Path C: Controlled Access**

**If no access mechanism works** → Go to **Path D: Metadata Only**

---

## Sharing Paths

### Path A: Open Sharing

The masked/anonymized data can be shared openly.

**Actions**:
1. Deposit masked video in DANS Data Station SSH or DataverseNL
2. Assign CC-BY 4.0 license (or CC-BY-NC 4.0 if non-commercial required)
3. Include rich metadata (Dublin Core / DDI)
4. Link to masking report documenting de-identification procedures
5. Link to original study and consent forms (noting consent scope)

**NWO compliance**: Fully meets "as open as possible" principle.

---

### Path B: Tiered Sharing

Share derivatives openly; restrict originals.

**Actions**:
1. **Open tier**: Deposit masked video and/or pose data in public repository
2. **Restricted tier**: Store original recordings in institutional or DANS restricted collection
3. Document both tiers in metadata (link open ↔ restricted)
4. Write Data Use Agreement for restricted tier
5. Include masking report with both tiers

**DMP documentation**:
```
Open tier:   Masked videos (MP4) + kinematics (CSV) → DANS, CC-BY 4.0
Restricted:  Original recordings → [Institutional repository], DUA required
Retention:   Open tier: indefinite; Restricted: [X] years
```

**NWO compliance**: Meets "as open as possible, as closed as necessary."

---

### Path C: Controlled Access

Data is too sensitive for open sharing but has reuse value.

**Actions**:
1. Deposit in DANS with restricted access level
2. Or: Set up SURF SANE environment for remote analysis
3. Write comprehensive Data Use Agreement specifying:
   - Who can access (qualifications, institutional affiliation)
   - What they can do (analysis only, no re-distribution)
   - How (secure environment, no downloads)
   - Duration of access
4. Provide rich metadata publicly so others know the data exists
5. Document the access procedure in your DMP

**NWO compliance**: Meets requirement if access procedure is documented and metadata is public.

---

### Path D: Metadata Only

Data cannot be shared, but its existence should be documented.

**Actions**:
1. Deposit a metadata-only record in DANS or institutional repository
2. Include: study description, data type, collection method, reason for restriction
3. Provide contact information for inquiries
4. Archive data securely according to institutional policy (minimum 10 years per NWO)
5. Document in DMP why sharing is not possible and what alternatives were considered

**NWO compliance**: Acceptable only with strong justification (e.g., participant consent does not cover sharing, re-identification risk too high).

---

## Quick Reference Matrix

| Data type | Typical path | Repository | License |
|-----------|-------------|------------|---------|
| Masked video (all faces swapped) | A or B (open) | DANS / DataverseNL | CC-BY 4.0 |
| Masked video (partial, context identifiable) | B or C (tiered/controlled) | DANS restricted | DUA |
| Pose/kinematics data (CSV) | A (open) | DANS / Zenodo | CC-BY 4.0 |
| Blendshapes (JSON) | A (open) | DANS / Zenodo | CC-BY 4.0 |
| Original unmasked recordings | C or D (controlled/metadata) | Institutional / SANE | DUA |
| Audio with voice anonymization | B (tiered) | DANS | CC-BY-NC 4.0 |
| Transcripts (no audio) | A (open) | DANS / DataverseNL | CC-BY 4.0 |

---

## Consent and Sharing

When collecting data, plan for sharing from the start:

### In your consent form, include:

- [ ] Description of masking/de-identification procedures
- [ ] Explanation of what data will look like after masking
- [ ] Tiered consent options: "I consent to sharing of... masked video / pose data only / no sharing"
- [ ] Statement about archiving in a trusted repository
- [ ] Mention of controlled access mechanisms
- [ ] Contact information for questions or withdrawal

> **Tip**: Use the [SYNAPSIS Informed Consent Template](downloads/templates/informed-consent-EN.md) which includes audiovisual-specific consent language. See also [Utrecht University guidance on consent forms](https://www.uu.nl/en/research/research-data-management/guides/legal-considerations/how-to-write-an-informed-consent-form).

---

## Resources

- [RDNL — Guidebooks on Hard-to-Share Data](https://researchdata.nl/en/2026/03/guidebooks-support-researchers-on-hard-to-share-data/) — practical guides for SSH
- [CESSDA Data Management Expert Guide](https://dmeg.cessda.eu/) — lifecycle guidance
- [DANS Data Station SSH](https://dans.knaw.nl/en/social-sciences-and-humanities/) — Dutch SSH repository
- [ODISSEI](https://odissei-data.nl/) — Dutch social science data infrastructure
- [SURF SANE](https://www.surf.nl/en/services/secure-analysis-environment-sane) — secure analysis environment
- [NWO Research Data Management](https://www.nwo.nl/en/research-data-management) — funder requirements
- [NWO DMP Template](https://zenodo.org/records/10143150) — official template
