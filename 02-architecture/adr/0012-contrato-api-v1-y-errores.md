# ADR-0012: Contrato `/api/v1`, OpenAPI y errores RFC 9457

- **Estado:** Aceptado
- **Fecha:** 2026-10-09
- **Decisores:** @Julian
- **Requisitos relacionados:** §7.3, RNF-07, RNF-10

## Contexto y problema

El MVP expone `/transactions` sin versión, con un formato de error propio (`ERR-300/400/500`) y sin documentación formal. El cliente y el servidor ya divergieron en el significado de `type`. Hace falta un contrato explícito y estable.

## Decisión

- **Versionado en la ruta:** todo bajo `/api/v1`. Un cambio incompatible crea `/api/v2`; los cambios compatibles (campos nuevos opcionales) no.
- **Endpoints de la v1.0:**

| Método | Ruta | Autenticación | Uso |
| --- | --- | --- | --- |
| POST | `/api/v1/auth/register` | Pública | REQ-AUT-01 |
| POST | `/api/v1/auth/login` | Pública | REQ-AUT-02 |
| POST | `/api/v1/auth/google` | Pública | REQ-AUT-03 |
| POST | `/api/v1/auth/refresh` | Pública (refresh token) | REQ-AUT-04 |
| POST | `/api/v1/auth/logout` | JWT | REQ-AUT-06 |
| GET | `/api/v1/me` | JWT | Perfil y ajustes |
| POST | `/api/v1/sync/push` | JWT | REQ-SYN-01 a 04 |
| GET | `/api/v1/sync/pull` | JWT | REQ-SYN-01, REQ-AUT-05 |
| GET | `/actuator/health` | Pública | Monitoreo |

- **Contrato primero:** springdoc-openapi genera `/v3/api-docs`; el archivo `docs/04-api/openapi.yml` se versiona y CI verifica que el código y el archivo coincidan.
- **Errores:** `ProblemDetail` (RFC 9457) con `type`, `title`, `status`, `detail` y un campo `code` estable:

| Código | HTTP | Caso |
| --- | --- | --- |
| `FIN-VALIDATION` | 400 | Cuerpo inválido; incluye `errors[]` por campo |
| `FIN-AUTH-INVALID` | 401 | Credenciales o token inválidos |
| `FIN-AUTH-REVOKED` | 401 | Refresh token revocado o reutilizado |
| `FIN-CONFLICT` | 409 | Usuario o correo ya registrados |
| `FIN-RATE-LIMIT` | 429 | Demasiados intentos de login |
| `FIN-INTERNAL` | 500 | Error no controlado; sin trazas ni detalles internos (RNF-07) |

  Los rechazos de un cambio dentro de un push no son errores HTTP: van como `REJECTED` con su `code` en la respuesta 200 (ADR-0006).
- **JSON:** `camelCase`; fechas ISO-8601 en UTC; montos como string decimal (ADR-0004).

### Consecuencias

- Positivas: contrato documentado y comprobable; errores consistentes que el cliente puede traducir a mensajes en español.
- Negativas: el `GlobalExceptionHandler` y los `ErrorCode` del MVP se reemplazan.

### Cómo se verifica

- Pruebas `@WebMvcTest` por endpoint para la forma del `ProblemDetail`.
- CI compara `openapi.yml` con el generado.
