# SEQ-13 · Importar y exportar

Requisitos: REQ-IMP-01 a 06, REQ-EXP-01, HU-11, RNF-04 · Pantalla: Importar y exportar

## 13.1 Importar CSV o Excel

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant S as ImportExportScreen
    participant VM as ImportViewModel
    participant SAF as Storage Access Framework
    participant PR as PreviewImport
    participant RD as TabularReader (CSV o XLSX)
    participant DUP as DuplicateDetector
    participant CI as CommitImport
    participant WM as WorkManager
    participant IW as ImportWorker
    participant DB as FinanceDatabase

    U->>S: Seleccionar archivo
    S->>SAF: OpenDocument(text/csv, xlsx)
    SAF-->>VM: content Uri
    VM->>PR: invoke(uri)
    PR->>RD: headers() y primeras 50 filas (en streaming)
    PR->>PR: Mapeo sugerido por nombre de columna (plantilla y Cashew)
    PR-->>VM: ImportPreview(columnas, mapeo, filas de muestra)
    U->>VM: Ajusta el mapeo (fecha, monto, tipo, cuenta, categoría, nota, etiqueta)
    VM->>PR: validate(uri, mapping)
    PR->>RD: Lee todas las filas
    PR->>PR: Parsea y marca errores por fila (fecha inválida, monto ≤ 0…)
    PR->>DUP: find(rows)
    DUP->>DB: Busca coincidencias con misma fecha y hora, monto, cuenta y tipo
    PR-->>VM: N válidas, M con error, D posibles duplicadas, cuentas y categorías desconocidas
    U->>VM: Para cada desconocida: crear o asociar a una existente (o crear todas). Duplicados: omitir (por defecto)
    VM->>CI: invoke(uri, mapping, resolutions, duplicatePolicy)
    CI->>WM: enqueue ImportWorker (en segundo plano, RNF-04)
    WM->>IW: doWork()
    loop Lotes de 500 filas
        IW->>DB: withTransaction: crea cuentas y categorías pendientes, INSERT transactions (PENDING)
        IW->>WM: setProgress
    end
    IW-->>VM: ImportSummary(importadas, omitidas, con error) (REQ-IMP-06)
    IW->>IW: requestSync()
```

## 13.2 Exportar a CSV

```mermaid
sequenceDiagram
    autonumber
    actor U as Usuario
    participant VM as ExportViewModel
    participant SAF as Storage Access Framework
    participant UC as ExportCsv
    participant DB as FinanceDatabase
    participant W as CsvWriter

    U->>VM: Rango (todo, este mes, mes anterior o personalizado) y Exportar CSV
    VM->>SAF: CreateDocument("coffer-2026-10.csv")
    SAF-->>VM: Uri de destino
    VM->>UC: invoke(uri, range)
    UC->>DB: Cursor de transacciones no borradas en el rango, ordenadas por occurredAt
    loop Por fila (en streaming)
        UC->>W: write(fecha ISO, tipo, monto, cuenta, cuenta destino, categoría, subcategoría, etiqueta, nota)
    end
    UC-->>VM: Exportadas N filas
```

La plantilla descargable usa las mismas columnas que la exportación, así un archivo exportado se puede volver a importar sin cambios de mapeo.
