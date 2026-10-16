# ADR-0002: Un único servicio en la nube con Spring Boot 4 (monolito modular)

- **Estado:** Aceptado
- **Fecha:** 2026-10-09
- **Decisores:** @Julian
- **Requisitos relacionados:** RNF-05, RNF-06, RNF-17, RNF-18, §2.1, §2.4

## Contexto y problema

El SRS define un "microservicio de transacciones": un backend independiente del APK que la app consume para autenticación, respaldo y restauración (RNF-18). La intención del product owner es **un solo servicio en la nube**, no un conjunto de microservicios. Hay que decidir la forma interna de ese servicio y su stack, sabiendo que:

- `coffer-server` ya existe con Spring Boot 4.0.6, Java 21, Spring Data JPA, Flyway, MapStruct, Lombok y Actuator.
- Se desplegará en un hosting gratuito con arranque en frío y recursos limitados (§2.4).
- Login, sincronización y datos financieros deben ser consistentes entre sí.

## Factores de decisión

- Un solo despliegue y un solo arranque en frío.
- Consistencia transaccional entre identidad, sincronización y datos.
- Reutilizar el proyecto existente.
- Poder separar módulos en el futuro (multiusuario, web) sin rediseñar (RNF-17).

## Opciones consideradas

1. Un servicio Spring Boot organizado como monolito modular (`identity`, `sync`, `ledger`, `shared`).
2. Microservicios separados (auth y transacciones), cada uno con su base.
3. Backend as a Service (Firebase o Supabase) sin servidor propio.

## Decisión

Se elige **un único servicio Spring Boot 4 (Java 21) organizado como monolito modular**. En la documentación se le llama "servicio en la nube" o *Coffer Server*. El término "microservicio" del SRS se interpreta como "servicio independiente del cliente".

Stack del servicio:

| Aspecto | Elección |
| --- | --- |
| Lenguaje y runtime | Java 21 (LTS), Spring Boot 4.0.x |
| Web | `spring-boot-starter-webmvc` (servlet, bloqueante: suficiente para un usuario) |
| Seguridad | `spring-boot-starter-security` + `oauth2-resource-server` (ver ADR-0007) |
| Persistencia | Spring Data JPA (Hibernate) + PostgreSQL 16 |
| Migraciones | Flyway (ver ADR-0003) |
| Mapeo | MapStruct 1.6 (DTO ↔ entidad) |
| Validación | `spring-boot-starter-validation` (Jakarta Bean Validation) |
| Documentación de la API | springdoc-openapi (ver ADR-0012) |
| Observabilidad | Actuator (`health`, `info`, `metrics`), logs JSON |
| Pruebas | JUnit 5, Spring Boot Test, Testcontainers (PostgreSQL), ArchUnit |
| Empaquetado | JAR ejecutable + Dockerfile multi-etapa (imagen JRE 21) |

### Consecuencias

- Positivas: un contenedor, una base y un despliegue; transacciones ACID entre módulos; se aprovecha el código existente.
- Negativas: si un módulo falla, falla todo el servicio. Se acepta porque hay un solo usuario y la app funciona sin el servidor.
- Riesgo: que los módulos se acoplen con el tiempo. Se mitiga con las reglas de ArchUnit de la vista de componentes.

### Cómo se verifica

- `ArchitectureTest` (ArchUnit): `ledger` no depende de `sync` ni de `identity`; los controladores no usan repositorios.
- La imagen arranca en menos de 15 s en local con 512 MB de memoria (`-XX:MaxRAMPercentage=75`).
