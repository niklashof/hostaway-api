## Code Review - Milestone 2

### Was gebaut wurde
- Neue Resource-Module fuer Listings, Reservations, Calendar und Conversations inkl. Anbindung an `HostawayClient`.
- Typdefinitionen fuer Request/Response-Modelle der neuen Ressourcen.
- Oeffentliche Exports der neuen Ressourcen und Typen in `src/index.ts`.
- Tests fuer zentrale Endpoint-Builder (Query/Body/Method).

### Highlights (Positive)
- Konsistentes Resource-Design: alle Calls laufen ueber `HostawayClient.request`, wodurch Auth/Retry zentral bleiben.
- Sinnvolle Typenstruktur mit gebrandeten ISO-Datumswerten und dedizierten Request/Response-Typen.
- Gute Tests fuer Query- und Body-Serialisierung bei den wichtigsten Endpoints.
- Options-Handling bei Reservations (Overbooking/Payment-Validation) ist klar und gut nachvollziehbar.

### Kritikpunkte / Verbesserungsvorschlaege
- Important: `ReservationsListParams` nutzt `order`, waehrend andere List-Params `sortOrder` verwenden; ohne Normalisierung droht ein stilles Ignorieren des Sortier-Parameters. Bitte Param-Namen angleichen oder im Resource mappen. (`src/types/reservations.ts:3-5`, `src/resources/reservations.ts:20-22`)
- Important: Pfad-Parameter werden direkt interpoliert, obwohl die Typen auch `string` erlauben; IDs mit Sonderzeichen koennen URLs brechen oder falsche Routen treffen. Empfehlung: `encodeURIComponent` je Segment oder IDs auf `number` beschraenken. (`src/resources/listings.ts:24-67`, `src/resources/reservations.ts:24-64`, `src/resources/conversations.ts:21-41`)
- Nice-to-have: Create/Update-Requests sind komplett optional; das senkt Typ-Sicherheit und laesst ungueltige Payloads kompilieren. Pflichtfelder fuer Create definieren und Updates via `Partial<>` modellieren. (`src/types/listings.ts:50-58`, `src/types/reservations.ts:50-62`)
- Nice-to-have: Tests decken nur einen Teil der Endpoints ab; fehlen fuer `get`, `delete`, `getFeeSettings`, `getListingUnit` sowie `getMessage`. Coverage erweitern und includeResources-Overrides mit testen. (`tests/resources.test.ts`)

### Score
7.5/10 — noch nicht production-ready; kleine API-Contract-Risiken und Typ/Test-Luecken sollten vor Prod behoben werden.

### Naechste Schritte
- Sortier-Parameter gegen API-Doku validieren und konsistent machen.
- Pfad-Parameter absichern (Encoding oder Typ-Einschraenkung).
- Typen fuer Create/Update staerken.
- Tests fuer fehlende Endpoints und Query-Varianten nachziehen.
