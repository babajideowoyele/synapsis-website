# FAIR Self-Assessment for Audiovisual Research Data

**Adapted from the [ARDC FAIR Data Self-Assessment Tool](https://ardc.edu.au/resource/fair-data-self-assessment-tool/) for audiovisual masking workflows.**

Use this checklist to assess how Findable, Accessible, Interoperable, and Reusable your masked audiovisual dataset is. Score each item and use the tips to improve FAIRness before archiving.

---

## Audience

- Researchers preparing masked data for deposit
- Data stewards reviewing audiovisual datasets
- Ethics boards assessing data sharing plans

---

## F — Findable

### F1. Does your dataset have a persistent identifier?

- [ ] **Best**: DOI assigned via DANS, DataverseNL, or Zenodo
- [ ] **Good**: Handle or PURL from institutional repository
- [ ] **Minimal**: Web URL only
- [ ] **None**: No identifier assigned

> **Tip**: Request a DOI when depositing in DANS Data Station SSH. Reserve a DOI before publication to include in your paper.

### F2. Is the identifier included in all metadata records?

- [ ] Yes — DOI appears in dataset metadata, related publications, and DMP
- [ ] No

### F3. How richly is the dataset described?

- [ ] **Best**: Standard metadata schema (Dublin Core / DDI) with title, description, creators, subjects, temporal/spatial coverage, masking method used
- [ ] **Good**: Structured text with title, description, and key fields
- [ ] **Minimal**: Title and brief description only
- [ ] **None**: Not described

> **Tip for audiovisual data**: Always document the masking method (blur, pixelation, face swap), software version, and which body regions were masked. Use the SYNAPSIS Metadata Schema template.

### F4. Where is the metadata record searchable?

- [ ] **Best**: DANS + NARCIS + institutional repository (multiple registries)
- [ ] **Good**: Domain repository (DANS Data Station SSH, DataverseNL)
- [ ] **Adequate**: Institutional repository only
- [ ] **None**: No searchable registry

---

## A — Accessible

### A1. How accessible is the data?

- [ ] **Open**: Entire masked dataset publicly accessible
- [ ] **Controlled**: Accessible to authorized researchers under conditions
- [ ] **Partial**: De-identified subset publicly accessible; original restricted
- [ ] **Embargoed**: Available after a set date
- [ ] **Metadata only**: Only the description is public
- [ ] **None**: No access

> **Tip**: For masked videos, the anonymized output can often be shared openly while the original recordings remain restricted. Use tiered access: open for masked, controlled for originals.

### A2. Is the data available online once access is approved?

- [ ] **Best**: Downloadable via standard API or web service
- [ ] **Good**: File download from repository
- [ ] **Adequate**: Available on request (email/form)
- [ ] **None**: No online access

### A3. Will the metadata persist even if the data is removed?

- [ ] Yes — repository guarantees metadata persistence (e.g., DANS)
- [ ] No or unsure

> **Tip**: DANS retains metadata records even when datasets are removed, which is important for citation continuity.

---

## I — Interoperable

### I1. What file formats is the data available in?

- [ ] **Best**: Open, standard formats — MP4 (H.264), CSV, JSON
- [ ] **Good**: Open but less standard — MKV, TSV
- [ ] **Adequate**: Proprietary but widely supported — AVI, MOV
- [ ] **Poor**: Proprietary, application-specific formats

> **Tip for audiovisual data**: Use MP4 (H.264/AAC) for masked videos, CSV for kinematics/pose data, JSON for blendshapes and metadata. Avoid codec-specific containers.

### I2. Do you use standard vocabularies to describe data elements?

- [ ] **Best**: Dublin Core / DDI metadata with controlled vocabulary terms
- [ ] **Good**: Recognized terms but not from a formal vocabulary
- [ ] **Minimal**: Free-text descriptions only
- [ ] **None**: Data elements not described

### I3. Are relationships to other datasets documented?

- [ ] **Best**: Machine-readable links (JSON-LD, RDF) to source data, publications, or code
- [ ] **Good**: URI links in metadata to related resources
- [ ] **None**: No links

> **Tip**: Link to the masking software version, the original study, and the consent forms used. Use the `relatedIdentifier` field in DataCite metadata.

---

## R — Reusable

### R1. What license is assigned?

- [ ] **Best**: Standard license (CC-BY 4.0 or CC-BY-NC 4.0) with machine-readable URL
- [ ] **Good**: Standard license referenced in text
- [ ] **Adequate**: Custom data use agreement
- [ ] **None**: No license specified

> **Tip**: CC-BY 4.0 is preferred for publicly shared masked data. For restricted data, use a Data Use Agreement specifying conditions.

### R2. How much provenance information is recorded?

- [ ] **Best**: Full processing pipeline documented — software version, parameters, input/output checksums, operator
- [ ] **Good**: Masking method and software version recorded in metadata
- [ ] **Adequate**: Brief note in abstract/description
- [ ] **None**: No provenance

> **Tip**: Use the SYNAPSIS Masking Report template to document the full processing provenance. This satisfies both FAIR requirements and ethics board documentation needs.

### R3. Does the dataset follow community standards?

- [ ] **Best**: Follows CESSDA/DANS guidelines for SSH data deposit
- [ ] **Good**: Follows institutional RDM policy
- [ ] **Minimal**: Ad hoc structure
- [ ] **None**: No standards followed

---

## Scoring Summary

Count your "Best" and "Good" answers:

| Category | Best | Good | Adequate | Minimal/None |
|----------|------|------|----------|-------------|
| **F** (4 items) | | | | |
| **A** (3 items) | | | | |
| **I** (3 items) | | | | |
| **R** (3 items) | | | | |

**Interpretation**:
- 10+ Best/Good: Your dataset is well-prepared for FAIR archiving
- 7-9: Good foundation; address gaps before deposit
- <7: Significant improvements needed; consult your data steward

---

## Resources

- [ARDC FAIR Self-Assessment Tool](https://ardc.edu.au/resource/fair-data-self-assessment-tool/) — original tool
- [CESSDA Data Management Expert Guide](https://dmeg.cessda.eu/) — SSH-specific guidance
- [DANS Data Station SSH](https://dans.knaw.nl/en/social-sciences-and-humanities/) — Dutch SSH data repository
- [SYNAPSIS Metadata Schema](downloads/templates/metadata-schema.json) — audiovisual masking metadata
- [SYNAPSIS Masking Report Template](downloads/templates/masking-report.md) — processing provenance
