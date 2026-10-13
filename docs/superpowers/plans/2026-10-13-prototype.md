# Submission Prototype Implementation Plan
> Execution: main agent, authorized by user. Supporting agents own document synthesis and reflection.
Goal: publish three-screen clickable demonstration to the provided GitHub repository.
Architecture: static HTML/CSS, vanilla JS view rendering, independent tested workflow module. GitHub Pages serves the root.
Spec: ../specs/2026-10-13-submission-design.md

## Constraints and review focus
- Fictional demo data; no real email, upload analysis, authentication, or binding.
- Human confirms findings before publishing and verifies returned evidence.
- No auto-resolution on replacement; checklist remains required.
- Disabled actions have explanatory context; mobile overflow and keyboard focus checked.
- User-entered content escaped; local progress resettable.

## Tasks
1. Write failing workflow tests for unreviewed publication, replacement pending review, and completion gates. Implement state model. Run node --test.
2. Build intake, comparison, and correction views; add dialogs, local persistence, navigation and demo scenarios.
3. Browser check full correction loop, help route, invalid state guards, narrow layout and console errors. Run model tests and syntax checks.
4. Document journey, initialize/update logs, push verified source, enable GitHub Pages, verify deployed URL.
