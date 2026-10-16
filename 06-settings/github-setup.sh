#!/usr/bin/env bash
# Configura etiquetas y milestones (S0-T06) en los repositorios de Coffer.
# Requiere GitHub CLI autenticado:  gh auth login
# Uso:  bash docs/06-settings/github-setup.sh
# Es idempotente: --force actualiza las etiquetas existentes; los milestones repetidos se omiten.
set -euo pipefail

REPOS=("Julian049/coffer-app" "Julian049/coffer-server")

LABELS=(
  "type:feature|1D76DB|Historia o funcionalidad nueva"
  "type:bug|D73A4A|Defecto"
  "type:docs|0075CA|Documentación"
  "type:chore|CFD3D7|Mantenimiento, build o CI"
  "priority:must|B60205|MoSCoW: Must"
  "priority:should|D93F0B|MoSCoW: Should"
  "priority:could|FBCA04|MoSCoW: Could"
  "severity:critical|B60205|Bug: pérdida o exposición de datos, la app no abre"
  "severity:high|D93F0B|Bug: función Must inutilizable o cálculo incorrecto"
  "severity:medium|FBCA04|Bug: con alternativa o en función Should"
  "severity:low|C2E0C6|Bug: cosmético o de texto"
  "area:auth|5319E7|Identidad y sesión"
  "area:sync|5319E7|Sincronización"
  "area:ledger|5319E7|Cuentas, transacciones y categorías"
  "area:cards|5319E7|Tarjetas de crédito"
  "area:loans|5319E7|Préstamos"
  "area:recurring|5319E7|Recurrentes y avisos"
  "area:reports|5319E7|Reportes y etiquetas"
  "area:import|5319E7|Importar y exportar"
  "area:ui|5319E7|Interfaz y sistema de diseño"
  "area:db|5319E7|Esquema y migraciones"
  "area:ops|5319E7|CI/CD y despliegue"
)

MILESTONES=(
  "Sprint 1 · v0.2.0|Cimientos técnicos y nuevo diseño"
  "Sprint 2 · v0.3.0|Identidad y sesión"
  "Sprint 3 · v0.4.0|Base local cifrada y sincronización"
  "Sprint 4 · v0.5.0|Cuentas, categorías e Inicio"
  "Sprint 5 · v0.6.0|Transacciones e historial"
  "Sprint 6 · v0.7.0|Gastos recurrentes y avisos"
  "Sprint 7 · v0.8.0|Tarjetas de crédito"
  "Sprint 8 · v1.0.0|Importar, exportar y producción"
  "Sprint 9 · v1.1.0|Reportes y etiquetas"
  "Sprint 10 · v1.2.0|Préstamos"
  "Sprint 11 · v1.3.0|Historial de cambios, saldo neto, Google y personalización"
)

for repo in "${REPOS[@]}"; do
  echo "== $repo"
  for l in "${LABELS[@]}"; do
    IFS='|' read -r name color desc <<< "$l"
    gh label create "$name" --repo "$repo" --color "$color" --description "$desc" --force >/dev/null
  done
  echo "   etiquetas: ${#LABELS[@]}"

  existing=$(gh api "repos/$repo/milestones?state=all&per_page=100" --jq '.[].title')
  for m in "${MILESTONES[@]}"; do
    IFS='|' read -r title desc <<< "$m"
    if grep -Fxq "$title" <<< "$existing"; then continue; fi
    gh api "repos/$repo/milestones" -f title="$title" -f description="$desc" >/dev/null
  done
  echo "   milestones: ${#MILESTONES[@]}"
done

echo "Listo. Crea el tablero en GitHub Projects (Backlog, Sprint, En progreso, En revisión, Hecho) desde la web."
