# Changelog

## 1.1.0

### Breaking changes

- **`SLTransportMode`** values are now UPPERCASE (`'METRO'`, `'BUS'`, etc.) to match the actual API responses. Previously they were incorrectly typed as lowercase.
- **`Alert` type removed** from `types/common`. Timetable alerts now use a `TrafiklabAlert` type with `title`/`text` fields (matching the real API) instead of `header`/`details`.

### Fixes

- Align schemas with real Trafiklab API responses.
- **Valibot schemas** updated to match all type changes above

## 1.0.4

- Add cross-reference to `@transit-se/mcp` in README

## 1.0.3

- Reduce npm package size (drop source maps, exclude tests and fixtures)
- Add Installation section to README
- Add Swagger UI mention to Quick Start

## 1.0.2

- Improve npm discoverability (keywords, homepage, description)

## 1.0.1

- Add `SLGroupOfLines` union type for the `group_of_lines` field on `SLLine` and `SLDepartureLine`

## 1.0.0

Initial release.
