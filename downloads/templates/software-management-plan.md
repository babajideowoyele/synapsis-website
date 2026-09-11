# Software Management Plan for Research Video Processing

**Adapted from the [Netherlands eScience Center Practical Guide to Software Management Plans](https://doi.org/10.5281/zenodo.7248877) and [NWO guidelines](https://www.nwo.nl/en/research-data-management).**

Use this template when developing or deploying research software for audiovisual data processing, masking, or analysis. NWO-funded projects may be required to include a software management plan alongside their data management plan.

---

## Audience

- Researchers developing or customizing masking pipelines
- Research software engineers maintaining processing infrastructure
- Project leaders reporting to NWO or institutional boards
- Data stewards advising on software sustainability

---

## 1. Software Overview

| Field | Value |
|-------|-------|
| **Software name** | |
| **Version** | |
| **Purpose** | |
| **Project / grant** | |
| **Lead developer** | |
| **Institution** | |
| **Repository URL** | |

### Description

[Brief description of what the software does, its role in the research workflow, and how it relates to the broader research objectives.]

---

## 2. Development Practices

### Version Control

- [ ] Source code managed in a version control system (Git)
- [ ] Repository hosted on a public platform (GitHub, GitLab, Codeberg)
- [ ] Branching strategy documented (main, develop, feature branches)
- [ ] Commit messages follow a convention (e.g., Conventional Commits)

### Code Quality

- [ ] Code review process in place
- [ ] Automated linting / formatting (e.g., Ruff, ESLint)
- [ ] Unit tests for core functionality
- [ ] Integration tests for pipeline end-to-end
- [ ] Continuous integration (CI) configured

### Documentation

- [ ] README with installation and usage instructions
- [ ] API documentation (if applicable)
- [ ] Configuration reference (environment variables, settings)
- [ ] Architecture or design documentation
- [ ] Contribution guidelines

---

## 3. Dependencies and Environment

### Runtime Dependencies

| Dependency | Version | License | Purpose |
|------------|---------|---------|---------|
| | | | |

### Hardware Requirements

| Resource | Minimum | Recommended |
|----------|---------|-------------|
| GPU | | |
| VRAM | | |
| RAM | | |
| Storage | | |

### Containerization

- [ ] Dockerfile(s) provided
- [ ] Docker Compose for multi-service setup
- [ ] Container images published to registry (e.g., GHCR, Docker Hub)
- [ ] Singularity/Apptainer definition for HPC clusters
- [ ] Environment reproducible from configuration files alone

---

## 4. Licensing

| Question | Answer |
|----------|--------|
| License type | [e.g., MIT, Apache 2.0, GPL-3.0] |
| License file in repository? | Yes / No |
| Compatible with dependencies? | Yes / No / To be checked |
| Third-party components and their licenses | |

> **Tip**: For research software intended for broad reuse, Apache 2.0 or MIT are recommended. For software that must remain open, GPL-3.0 ensures derivative works stay open source.

---

## 5. Findability and Citation

### Identifiers

- [ ] DOI assigned (via Zenodo, 4TU.ResearchData, or Software Heritage)
- [ ] Citation file (`CITATION.cff`) included in repository
- [ ] Software registered in a community registry (e.g., Research Software Directory)

### Citation Format

```
[Authors]. ([Year]). [Software Name] (Version [X.Y.Z]). [Repository/DOI].
```

> **Tip**: Use the [cffinit tool](https://citation-file-format.github.io/cff-initializer-javascript/) to generate a `CITATION.cff` file.

---

## 6. Accessibility and Reuse

### Installation

- [ ] Installation instructions tested on a clean environment
- [ ] Package available via package manager (pip, npm, conda)
- [ ] Docker images available for quick deployment
- [ ] Minimum viable installation documented (CPU-only fallback)

### Configuration

- [ ] All configuration via environment variables or config files (no hardcoded values)
- [ ] Example configuration provided (`app.env.example`, `config.example.yml`)
- [ ] Sensitive defaults require explicit override (no default passwords)

### Interoperability

- [ ] Uses standard file formats for input/output (MP4, CSV, JSON)
- [ ] API follows REST conventions (if web service)
- [ ] Data exchange formats documented

---

## 7. Maintenance and Sustainability

### Current Maintenance

| Question | Answer |
|----------|--------|
| Who maintains the software? | |
| Maintenance period guaranteed until | |
| Bug reporting process | |
| Release cycle | |

### Long-term Sustainability

- [ ] Software archived in Software Heritage or Zenodo
- [ ] Succession plan if lead developer leaves
- [ ] Community or institutional commitment to maintenance
- [ ] Funding for maintenance beyond project period identified

### Risk Assessment

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Key developer leaves | | |
| Dependency becomes unmaintained | | |
| Hardware requirements increase | | |
| Security vulnerability discovered | | |

---

## 8. Privacy and Security

### Data Handling

- [ ] Software does not store user data beyond processing
- [ ] Temporary files cleaned up after processing
- [ ] Audit logging for data access (who, when, what)
- [ ] Data retention policy implemented

### Security

- [ ] No hardcoded credentials in source code
- [ ] Authentication required for multi-user deployment
- [ ] API endpoints authenticated
- [ ] Security audit performed (date: ___)
- [ ] Known vulnerabilities tracked and addressed

---

## Resources

- [eScience Center — Practical Guide to Software Management Plans](https://doi.org/10.5281/zenodo.7248877)
- [NWO Research Data Management](https://www.nwo.nl/en/research-data-management)
- [fair-software.eu](https://fair-software.eu/) — Five recommendations for FAIR software
- [CITATION.cff initializer](https://citation-file-format.github.io/cff-initializer-javascript/)
- [The Turing Way — Guide for Reproducible Research](https://the-turing-way.netlify.app/)
- [Software Sustainability Institute — Checklist](https://www.software.ac.uk/blog/software-sustainability-checklist-netherlands-escience-center)
