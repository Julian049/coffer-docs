# SEQ-03 · Renovar y cerrar la sesión

Requisitos: REQ-AUT-04, REQ-AUT-06, RNF-09 · Pantallas: Ajustes, Diálogo cerrar sesión

## 3.1 Renovación transparente con refresh rotativo

```mermaid
sequenceDiagram
    autonumber
    participant W as SyncWorker
    participant OK as OkHttp (AuthInterceptor y TokenAuthenticator)
    participant SS as SessionStore
    participant AC as AuthController
    participant TS as TokenService
    participant DB as PostgreSQL

    W->>OK: POST /api/v1/sync/push
    OK->>SS: accessToken
    OK->>AC: Authorization Bearer (vencido)
    AC-->>OK: 401
    OK->>OK: Mutex: una sola renovación a la vez
    OK->>SS: refreshToken y deviceId
    OK->>AC: POST /api/v1/auth/refresh
    AC->>TS: rotate(refreshToken, deviceId)
    TS->>DB: SELECT refresh_tokens WHERE token_hash = sha256(token)
    alt Vigente y no revocado
        TS->>DB: UPDATE el actual SET revoked_at = now(), replaced_by = nuevo
        TS->>DB: INSERT el nuevo (misma family_id, expires_at = now + 180 días)
        TS-->>AC: Nuevo par de tokens
        AC-->>OK: 200
        OK->>SS: save(nuevos tokens)
        OK->>AC: Reintenta POST /sync/push con el nuevo access token
    else Revocado (posible robo) o vencido
        TS->>DB: UPDATE refresh_tokens SET revoked_at = now() WHERE family_id = ?
        AC-->>OK: 401 FIN-AUTH-REVOKED
        OK->>SS: markExpired()
        OK-->>W: Falla con AuthExpired
        W-->>W: Result.failure(), los cambios siguen PENDING
        Note over SS: La UI observa sessionState = EXPIRED y muestra Iniciar sesión sin borrar datos locales
    end
```

## 3.2 Cerrar sesión

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant D as LogoutDialog
    participant VM as SettingsViewModel
    participant UC as Logout
    participant AR as AuthRepositoryImpl
    participant SCH as SyncScheduler
    participant AC as AuthController
    participant SS as SessionStore

    U->>D: Cerrar sesión
    D->>VM: onConfirmLogout()
    VM->>UC: invoke()
    UC->>SCH: cancelAll()
    UC->>AR: logout()
    AR->>AC: POST /api/v1/auth/logout (si hay red, sin bloquear)
    AC-->>AR: 204 (refresh token revocado)
    AR->>SS: clear()
    Note over UC,SS: Los datos locales se conservan (REQ-AUT-06). Los cambios posteriores quedan PENDING sin respaldo hasta un nuevo login
    VM-->>U: Navega a Iniciar sesión
```
