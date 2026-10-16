# SEQ-01 · Registro e inicio de sesión

Requisitos: REQ-AUT-01, 02, 03, RNF-09, RNF-11 · Pantallas: Iniciar sesión, Registro · Diseño: [§6.6 Interfaces](../detailed-design.md#66-vista-de-interfaces)

## 1.1 Registro con usuario y contraseña

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant RS as RegisterScreen
    participant VM as RegisterViewModel
    participant UC as RegisterUser
    participant AR as AuthRepositoryImpl
    participant API as AuthApi (Retrofit)
    participant AC as AuthController
    participant AS as AuthService
    participant US as UserService
    participant TS as TokenService
    participant DB as PostgreSQL
    participant SS as SessionStore

    U->>RS: Nombre, correo, usuario, contraseña
    RS->>VM: onSubmit(form)
    VM->>UC: invoke(RegisterInput)
    UC->>UC: Valida formato (usuario ^[a-z0-9._]{3,40}$, correo, contraseña de 8 o más)
    alt Inválido
        UC-->>VM: Failure(ValidationError por campo)
        VM-->>RS: Errores junto a cada campo
    else Válido
        UC->>AR: register(input, deviceId)
        AR->>API: POST /api/v1/auth/register
        API->>AC: RegisterRequest
        AC->>AS: register(request)
        AS->>US: create(username, email, displayName, password)
        US->>DB: SELECT lower(username), lower(email)
        alt Ya existe
            US-->>AC: DuplicateUserException
            AC-->>API: 409 ProblemDetail FIN-CONFLICT
            API-->>VM: Failure(Conflict(campo))
        else Nuevo
            US->>US: BCrypt costo 12
            US->>DB: INSERT users
            AS->>TS: issue(userId, deviceId)
            TS->>DB: INSERT refresh_tokens (family nueva, hash SHA-256)
            TS-->>AS: accessToken (RS256, 15 min) y refreshToken
            AS-->>AC: AuthResponse
            AC-->>API: 201 AuthResponse
            API-->>AR: tokens y user
            AR->>SS: save(session) cifrada con Keystore
            AR-->>VM: Success(user)
            VM-->>RS: Navega a Descarga inicial (SEQ-02)
        end
    end
```

## 1.2 Inicio de sesión con usuario o correo

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant VM as LoginViewModel
    participant AR as AuthRepositoryImpl
    participant AC as AuthController
    participant RL as LoginRateLimiter
    participant AS as AuthService
    participant DB as PostgreSQL
    participant SS as SessionStore

    U->>VM: usuario o correo y contraseña
    VM->>AR: login(identifier, password, deviceId)
    AR->>AC: POST /api/v1/auth/login
    AC->>RL: tryConsume(ip, identifier)
    alt Más de 5 intentos por minuto
        AC-->>AR: 429 FIN-RATE-LIMIT
        AR-->>VM: Failure(TooManyAttempts)
    else Permitido
        AC->>AS: login(request)
        AS->>DB: SELECT users WHERE lower(username) = ? OR lower(email) = ?
        AS->>AS: BCrypt.matches (tiempo constante, aunque el usuario no exista)
        alt Credenciales inválidas
            AS-->>AC: 401 FIN-AUTH-INVALID (mensaje genérico)
            AC-->>VM: Error "Usuario o contraseña incorrectos"
        else Correctas
            AS->>DB: INSERT refresh_tokens (familia nueva)
            AS-->>AC: AuthResponse
            AC-->>AR: 200 AuthResponse
            AR->>SS: save(session)
            AR-->>VM: Success
            VM-->>U: Descarga inicial si no hay datos locales, si no Inicio
        end
    end
```

## 1.3 Registro o inicio con Google

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant VM as LoginViewModel
    participant CM as Credential Manager
    participant AR as AuthRepositoryImpl
    participant AC as AuthController
    participant GV as GoogleTokenVerifier
    participant G as Google JWKS
    participant US as UserService
    participant DB as PostgreSQL

    U->>VM: Continuar con Google
    VM->>CM: getCredential(GetGoogleIdOption(serverClientId))
    CM-->>VM: GoogleIdTokenCredential(idToken)
    VM->>AR: loginWithGoogle(idToken, deviceId)
    AR->>AC: POST /api/v1/auth/google
    AC->>GV: verify(idToken)
    GV->>G: Claves públicas (en caché)
    GV->>GV: Firma, iss, aud = GOOGLE_CLIENT_ID, exp, email_verified
    alt Token inválido
        AC-->>AR: 401 FIN-AUTH-INVALID
    else Válido
        AC->>US: findOrCreateByGoogle(sub, email, name)
        US->>DB: SELECT por google_subject
        opt No existe por subject pero sí por correo
            US->>DB: UPDATE users SET google_subject (vincula la cuenta)
        end
        opt No existe
            US->>DB: INSERT users (username derivado del correo, sin contraseña)
        end
        AC-->>AR: 200 AuthResponse
        AR-->>VM: Success
    end
```
