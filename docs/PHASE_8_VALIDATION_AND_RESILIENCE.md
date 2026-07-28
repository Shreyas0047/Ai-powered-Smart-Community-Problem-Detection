# Phase 8: Usability, Accessibility, Load, And Resilience Validation

Phase 8 establishes release checks around the complete workflow rather than adding another feature surface.

## Accessibility And Usability

The application now includes skip navigation, named dialogs, explicit button types, labelled contact inputs, polite status announcements, keyboard dialog containment, Escape handling for dismissible dialogs, focus restoration, visible focus styling, and a global reduced-motion mode. The authentication dialog remains intentionally non-dismissible until a valid session exists.

`npm run verify:accessibility` performs deterministic static checks for duplicate IDs, image alternatives, dialog names, input label hooks, button types, skip navigation, live feedback, focus styling, and reduced-motion CSS. It complements, but does not replace, manual screen-reader and keyboard testing.

## Load And Payload Boundaries

`npm run verify:load` starts the Express app on an ephemeral local port, sends 150 concurrent liveness and protected API requests, checks response classes and p95 latency, and confirms that payloads above the configured 12 MB boundary are rejected. The latency threshold is a local regression guard, not a production capacity claim.

## Resilience And Operations

- Separate liveness and readiness endpoints distinguish a running process from database availability.
- Request correlation IDs are validated or generated and returned on every response.
- Rate-limit boundaries, bounded in-memory bucket storage, and security headers have focused tests.
- SIGTERM and SIGINT stop new requests, drain the HTTP server, disconnect MongoDB, and retain a forced-shutdown ceiling.
- Existing provider timeout/fallback behavior remains non-blocking for Weatherstack and Zenserp; authority failures become tracked ticket state.

## Release Gate

```bash
npm run verify:release
```

This runs the Phase 1 through Phase 8 checks plus resolution, civic intelligence, provider contracts, and AI-service regression checks. Real benchmark readiness remains a separate explicit gate because no software command can substitute for collecting and adjudicating representative data.

## Required Manual Validation

Before a public launch, complete keyboard-only login/report/review flows, NVDA or VoiceOver checks, 200% browser zoom, mobile device testing, slow-network submission, duplicate-click behavior, SMTP/webhook sandbox delivery, MongoDB failover, and a staging load test using production-like infrastructure. Record participants, scenarios, completion rates, errors, and accessibility findings rather than claiming usability from developer testing alone.
