# Testing

Tests in this repo exist to verify **seams** (the public interface of a module — everything a caller needs to invoke its functionality). We do **not** test internals.

## Seams, not content

Tests must not assert on copy, labels, URLs, asset paths, or other presentational strings. A rename of user-visible text is not a broken seam.

Example: if a component said `"Octabio"` and now says `"Octavio"`, tests must still pass. Fail only when the observable contract changes (roles, pressed/expanded state, navigation targets as behavior, live-region updates, export surface, order of sections, etc.).

Do not query or expect by exact text (`getByText('…')`, `name: 'Pausar el video'`, `href` substrings, hardcoded figure strings) unless that string **is** the seam under test (rare — e.g. a proofs module whose export surface _is_ the ratified string set). Prefer roles, states (`aria-pressed`, `aria-expanded`), and behavioral outcomes.

## Acceptance criteria vs coverage

It does not matter what the acceptance criteria say. If a criterion is met in code but no seam test covers it, document that gap on the issue tracker — do not add a content or internals test to “cover” it.
