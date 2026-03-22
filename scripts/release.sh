#!/usr/bin/env bash
# Автоматизация релиза после правки CHANGELOG.md.
# Использование:
#   chmod +x scripts/release.sh   # один раз на Linux/macOS
#   ./scripts/release.sh 1.0.1
#   ./scripts/release.sh 1.0.1 develop
#   ./scripts/release.sh 1.0.1 main --dry-run
#
set -euo pipefail

VERSION="${1:-}"
BRANCH="${2:-main}"
DRY_RUN=false

if [[ "${3:-}" == "--dry-run" ]] || [[ "${3:-}" == "-n" ]]; then
  DRY_RUN=true
fi

if [[ -z "$VERSION" ]] || ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+(-[0-9A-Za-z.-]+)?$ ]]; then
  echo "Использование: $0 <версия> [ветка] [--dry-run]"
  echo "Пример:       $0 1.0.1 main"
  exit 1
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

run() {
  if $DRY_RUN; then
    printf "[dry-run]"
    printf " %q" "$@"
    echo
  else
    printf "+"
    printf " %q" "$@"
    echo
    "$@"
  fi
}

echo "Версия: $VERSION | ветка: $BRANCH"
if ! $DRY_RUN; then
  echo "Убедитесь, что в CHANGELOG.md есть секция ## [$VERSION]"
  read -r -p "Продолжить? [y/N] " ok
  if [[ ! "${ok:-}" =~ ^[yY]$ ]]; then
    echo "Отменено."
    exit 0
  fi
fi

run npm run release:bump -- "$VERSION"
run npm run release:verify -- "$VERSION"
run git add CHANGELOG.md package.json package-lock.json
run git commit -m "chore: release $VERSION"
run git push origin "$BRANCH"
run git tag -a "v$VERSION" -m "Release $VERSION"
run git push origin "v$VERSION"

if $DRY_RUN; then
  echo "Dry-run завершён. Запустите без --dry-run после правки CHANGELOG."
else
  echo "Готово. Проверьте Actions и Releases на GitHub."
fi
