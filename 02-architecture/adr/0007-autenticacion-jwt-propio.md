# ADR-0007: Autenticación con JWT propio, refresh rotativo y Google

- **Estado:** Aceptado
- **Fecha:** 2026-10-09
- **Decisores:** @Julian
- **Requisitos relacionados:** REQ-AUT-01 a 06, RNF-09, RNF-10, RNF-11, RNF-17

## Contexto y problema

El MVP no tiene autenticación: cualquiera con la URL puede leer y escribir. La v1.0 exige registro con usuario y contraseña, inicio con Google, una sesión que no caduca por uso normal y aislamiento por usuario.

## Opciones consideradas

1. JWT emitidos por el propio servicio (Spring Security, `oauth2-resource-server`) con refresh tokens rotativos.
2. Un proveedor externo (Firebase Auth, Auth0, Keycloak).
3. Sesiones con cookie en el servidor.

## Decisión

Se elige **JWT propio**:

- **Registro y login local:** `POST /api/v1/auth/register` y `POST /api/v1/auth/login`. Contraseñas con BCrypt de costo 12 (RNF-11). Login por nombre de usuario o correo.
- **Google:** la app obtiene un ID token con Credential Manager y llama a `POST /api/v1/auth/google`. El servidor valida firma (JWKS de Google), `aud` igual a `GOOGLE_CLIENT_ID` y expiración; después vincula o crea el usuario por `google_subject`.
- **Access token:** JWT RS256 de 15 minutos con `sub = userId`. El servidor firma con una clave privada configurada por variable de entorno y valida con `NimbusJwtDecoder`.
- **Refresh token:** valor aleatorio de 256 bits, guardado como hash SHA-256 en `refresh_tokens`, **rotativo** (cada uso emite uno nuevo y revoca el anterior) y con caducidad deslizante de 180 días. Si se reutiliza uno revocado, se revoca toda la familia. Así la sesión "no caduca" mientras la app se use (REQ-AUT-04) y aun así puede invalidarse.
- **Cerrar sesión:** `POST /api/v1/auth/logout` revoca el refresh token. El cliente conserva los datos locales y detiene la sincronización (REQ-AUT-06).
- **Autorización:** cada consulta filtra por `user_id` tomado del JWT (RNF-17).

### Consecuencias

- Positivas: sin dependencias de pago; control total del ciclo de sesión; preparado para multiusuario.
- Negativas: hay que custodiar la clave de firma y escribir pruebas de seguridad propias.

### Cómo se verifica

- Pruebas: un token expirado da 401; un refresh reutilizado revoca la familia; el usuario A no puede leer ni escribir datos de B (`REJECTED` o 404).
- Límite de intentos de login (bucket en memoria, 5 por minuto por IP y usuario).
