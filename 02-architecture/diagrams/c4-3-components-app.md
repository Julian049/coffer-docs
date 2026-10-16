# C4 · Nivel 3 · Componentes de la app Android

Vista de componentes del contenedor *App Android*. Arquitectura **MVVM + Clean Architecture** con un dominio en Kotlin puro: ahí viven todas las reglas financieras del SRS.

```mermaid
C4Component
    title Componentes · App Android (Kotlin, Compose)

    Person(usuario, "Usuario")
    Container_Ext(api, "Coffer Server", "Spring Boot", "API /api/v1")
    System_Ext(os, "Android", "WorkManager, AlarmManager, Keystore, SAF")

    Container_Boundary(app, "App Android") {
        Component(ui, "Pantallas (feature/*)", "Jetpack Compose, Material 3", "Inicio, Historial, Reportes, Cuentas, formularios, hojas y diálogos del prototipo.")
        Component(vm, "ViewModels", "AndroidX ViewModel, StateFlow", "Un UiState inmutable por pantalla; reciben intents del usuario.")

        Component(uc, "Casos de uso", "Kotlin puro", "RegisterTransaction, PayPending, PayCreditCard, DeferPurchase, ExtraPayment, RemoveAccount, ImportFile…")
        Component(fin, "Motor financiero", "Kotlin puro, BigDecimal", "Saldos neto y disponible, plan de cuotas, conversión EA↔MV, mes de 30 días, próxima ocurrencia.")
        Component(ports, "Puertos (interfaces)", "Kotlin", "Repositorios, SyncScheduler, AuthGateway, ReminderScheduler, FileGateway, Clock.")

        Component(repos, "Repositorios", "Kotlin + Room", "Implementan los puertos; cada escritura marca syncState = PENDING y registra el historial.")
        ComponentDb(db, "FinanceDatabase", "Room 2.8 + SQLCipher", "DAOs y entidades; sync_meta con el cursor.")
        Component(remote, "Cliente API", "Retrofit 3, OkHttp, kotlinx.serialization", "AuthApi y SyncApi; AuthInterceptor + Authenticator para el refresh.")
        Component(syncw, "SyncWorker", "HiltWorker, CoroutineWorker", "Push por lotes, después pull paginado; LWW local.")
        Component(rem, "ReminderScheduler", "WorkManager + notificaciones", "Avisos al abrir la ventana de anticipación y el día de vencimiento.")
        Component(io, "Importador y exportador", "CSV / .xlsx en streaming, SAF", "Mapeo de columnas, vista previa, duplicados y resumen.")
        Component(sess, "SessionStore", "Keystore + DataStore cifrado", "Tokens y estado de sesión.")
    }

    Rel(usuario, ui, "Toca")
    Rel(ui, vm, "Intents / observa UiState")
    Rel(vm, uc, "Invoca")
    Rel(uc, fin, "Calcula")
    Rel(uc, ports, "Depende de")
    Rel(repos, ports, "Implementa")
    Rel(repos, db, "Lee y escribe")
    Rel(syncw, db, "Pendientes y cambios recibidos")
    Rel(syncw, remote, "push / pull")
    Rel(remote, sess, "Lee y guarda tokens")
    Rel(remote, api, "HTTPS, JSON, Bearer JWT")
    Rel(rem, os, "Programa y muestra avisos")
    Rel(io, os, "Selecciona archivos", "SAF")
    Rel(syncw, os, "Se ejecuta con red", "WorkManager")

    UpdateLayoutConfig($c4ShapeInRow="4", $c4BoundaryInRow="1")
```

## Organización del código

Módulo Gradle único `:app` en la v1.0 (paquete `com.dev.julian09.financeapp`). La división en paquetes permite extraer módulos Gradle (`:core:domain`, `:core:data`, `:feature:*`) cuando crezca el tiempo de compilación.

```
com.dev.julian09.financeapp
├── ui/                 # tema (tokens del design.md), componentes y navegación
│   └── feature/        # home, history, reports, accounts, transaction, recurring,
│                       # cards, loans, tags, categories, importexport, settings, auth
├── domain/
│   ├── model/          # Account, Transaction, Money, InstallmentPlan, Recurrence…
│   ├── finance/        # BalanceCalculator, InstallmentCalculator, RateConverter…
│   ├── usecase/
│   └── port/           # interfaces de repositorios y servicios
├── data/
│   ├── local/          # Room: entities, dao, FinanceDatabase, migraciones
│   ├── remote/         # Retrofit: AuthApi, SyncApi, DTO, interceptores
│   ├── repository/     # implementaciones de los puertos
│   ├── sync/           # SyncWorker, SyncScheduler, mapeo de cambios
│   ├── reminder/       # ReminderWorker, canal de notificaciones
│   └── io/             # CsvReader, XlsxReader, CsvWriter
└── di/                 # módulos de Hilt
```

| Capa | Regla |
| --- | --- |
| `ui` | Solo renderiza `UiState` y emite intents. No importa `data`. |
| `domain` | Kotlin puro (sin `android.*`), 100 % probado con JUnit. |
| `data` | Única capa que conoce Room, Retrofit y las APIs de Android. |
