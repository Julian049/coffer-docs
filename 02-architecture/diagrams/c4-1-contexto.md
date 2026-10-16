# C4 · Nivel 1 · Contexto del sistema

Vista de contexto (punto de vista *Contexto* de ISO/IEC/IEEE 42010). Responde a: ¿quién usa el sistema y con qué sistemas externos se relaciona?

```mermaid
C4Context
    title Contexto del sistema · Coffer

    Person(usuario, "Usuario (product owner)", "Registra gastos, ingresos y transferencias a diario; consulta saldos, pendientes y reportes.")

    Enterprise_Boundary(fa, "Coffer") {
        System(app, "App Android Coffer", "Aplicación offline-first. Toda la operación diaria ocurre en el teléfono.")
        System(cloud, "Servicio en la nube Coffer Server", "Autenticación y respaldo/sincronización de los datos del usuario.")
    }

    System_Ext(google, "Google Identity", "Inicio de sesión con Google (Credential Manager) y emisión de ID tokens.")
    System_Ext(android, "Sistema Android", "WorkManager, AlarmManager, notificaciones locales, Keystore y selector de archivos (SAF).")
    System_Ext(cashew, "Archivos de Cashew u hojas de cálculo", "CSV o .xlsx exportados por el usuario para importar su histórico.")

    Rel(usuario, app, "Usa", "Pantalla táctil")
    Rel(app, cloud, "Envía y recibe cambios; inicia sesión", "HTTPS, JSON, JWT")
    Rel(app, google, "Obtiene un ID token", "Credential Manager")
    Rel(cloud, google, "Valida el ID token", "HTTPS, JWKS")
    Rel(app, android, "Programa sincronización y avisos; guarda secretos", "APIs de Android")
    Rel(usuario, cashew, "Exporta su histórico")
    Rel(app, cashew, "Importa y exporta", "CSV o .xlsx vía SAF")

    UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```

## Elementos

| Elemento | Tipo | Responsabilidad | Requisitos |
| --- | --- | --- | --- |
| Usuario | Persona | Único actor humano de la v1.0. | §2.3 |
| App Android | Sistema (propio) | Opera completa sin conexión sobre su base local cifrada. | F01–F31, RNF-05 |
| Servicio en la nube | Sistema (propio) | Autentica, guarda una copia por usuario y sincroniza dispositivos. | F01, F02, F08, RNF-17, RNF-18 |
| Google Identity | Externo | Proveedor de identidad para REQ-AUT-03. | REQ-AUT-03 |
| Sistema Android | Externo | Planificación en segundo plano, notificaciones locales, almacén de claves y archivos. | REQ-REC-09, RNF-09, §7.2 |
| Archivos de Cashew | Externo | Fuente del histórico inicial. | HU-11, REQ-IMP-01 |

> El SRS llama "microservicio de transacciones" al servicio en la nube. Es **un único servicio** independiente del APK, no varios microservicios. Ver [ADR-0002](../adr/0002-servicio-unico-en-la-nube-spring-boot.md).
