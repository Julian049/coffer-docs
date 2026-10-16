# ADR-0008: Room cifrada con SQLCipher y tokens en Android Keystore

- **Estado:** Aceptado
- **Fecha:** 2026-10-09
- **Decisores:** @Julian
- **Requisitos relacionados:** RNF-08, RNF-09, RNF-10

## Contexto y problema

La base local contiene el histórico financiero completo y debe estar cifrada en reposo (RNF-08). Los tokens de sesión deben persistir, estar cifrados y sobrevivir a limpiar la caché (RNF-09). El MVP no cifra nada y permite tráfico en claro hacia cualquier host.

## Opciones consideradas

1. SQLCipher para Room + clave envuelta con Android Keystore; tokens en DataStore cifrado con una clave del Keystore.
2. Confiar solo en el cifrado de archivos de Android (FBE).
3. `EncryptedSharedPreferences` (Jetpack Security, en desuso).

## Decisión

Se elige la **opción 1**:

- **Base local:** `net.zetetic:sqlcipher-android` con `SupportOpenHelperFactory` en `Room.databaseBuilder`. La clave es aleatoria de 256 bits, se genera al instalar y se guarda envuelta con una clave AES-GCM del Android Keystore (no exportable).
- **Tokens:** DataStore (Proto) en `filesDir`, no en caché; el contenido se cifra con AES-GCM usando otra clave del Keystore.
- **Red:** `network_security_config` sin tráfico en claro en `release`; en `debug` solo se permite `10.0.2.2`.
- **Respaldo de Android:** `android:allowBackup="false"`. El respaldo legítimo es la nube; una copia de la base cifrada no sirve sin la clave.

### Consecuencias

- Positivas: cumple RNF-08 y RNF-09 sin servicios externos.
- Negativas: SQLCipher añade unos 3–4 MB al APK y algo de coste de CPU (aceptable para unas 10.000 filas). Si se borra el Keystore (por ejemplo, al restablecer el teléfono), la base local deja de poder leerse; se recupera desde la nube (HU-06).

### Cómo se verifica

- Prueba instrumentada: el archivo `finance.db` no contiene texto legible y no se puede abrir con SQLite sin la clave.
- Lint: no hay `cleartextTrafficPermitted="true"` en `release`.
