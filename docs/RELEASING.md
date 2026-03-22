# Релиз TextFlow через командную строку (подробно)

Ниже — полный сценарий: от открытия терминала до появления релиза на GitHub. Команды одинаковы по смыслу в **Git Bash**, **PowerShell** и **cmd** (кроме отдельно помеченных мест).

---

## Что должно быть установлено

| Инструмент | Зачем | Проверка |
|------------|--------|----------|
| **Git** | теги, push | `git --version` |
| **Node.js 18+** | npm-скрипты | `node --version` |
| **npm** | скрипты релиза | `npm --version` |
| Учётная запись **GitHub** | push и Actions | вход в браузере |
| **SSH-ключ или HTTPS** к GitHub | `git push` без ошибок | см. раздел «Проверка доступа к GitHub» |

Проект должен быть **клонирован** с GitHub (или `git remote` указывает на ваш репозиторий).

---

## Открыть терминал в папке проекта

Подставьте свой путь к репозиторию.

**PowerShell или cmd:**

```text
cd C:\Users\Admin\Desktop\Projekt2
```

**Git Bash:**

```bash
cd /c/Users/Admin/Desktop/Projekt2
```

Проверка, что вы в корне (должен быть `package.json`):

```bash
dir package.json
```

или в Bash:

```bash
ls package.json
```

---

## Проверка доступа к GitHub

Посмотреть удалённый репозиторий:

```bash
git remote -v
```

Ожидается строка вида `origin  git@github.com:USER/textflow.git` или `https://github.com/USER/textflow.git`.

Узнать текущую ветку (часто `main` или `master`):

```bash
git branch --show-current
```

Запомните имя ветки — его подставите вместо `main` в командах ниже, если у вас другое.

Проверить, что нет незакоммиченных изменений (желательно чистое состояние перед релизом):

```bash
git status
```

Если есть лишние файлы — закоммитьте или отложите (`git stash`), чтобы не смешать с релизным коммитом.

Подтянуть актуальное с сервера:

```bash
git pull origin main
```

(замените `main` на вашу основную ветку.)

---

## Переменная версии (удобно копировать)

Во всех примерах ниже **`1.0.1`** — это **новая** версия без префикса `v`. Замените на свою (например `1.1.0`, `2.0.0`).

**PowerShell** — можно задать один раз:

```powershell
$v = "1.0.1"
```

В **Git Bash** — то же:

```bash
v=1.0.1
```

В **cmd** переменные другие; проще каждый раз писать `1.0.1` явно или использовать PowerShell.

---

## Шаг 1. Отредактировать CHANGELOG.md

Откройте файл в редакторе **или** из терминала (пример для VS Code):

```bash
code CHANGELOG.md
```

Сделайте так:

1. Перенесите изменения из `## [Unreleased]` в **новую** секцию с номером версии и датой.
2. Заголовок **строго** в формате `## [X.Y.Z] - ГГГГ-ММ-ДД` — номер **без** `v`, **совпадает** с тем, что вы будете тегать.

Пример блока:

```markdown
## [1.0.1] - 2026-03-22

### Fixed

- Исправлена ошибка при …

### Changed

- Обновлены зависимости …
```

Сохраните файл.

---

## Шаг 2. Поднять версию в package.json

Из корня проекта:

```bash
npm run release:bump -- 1.0.1
```

**Зачем двойное тире `--`:** всё, что после `--`, передаётся скрипту, а не npm. Без этого версия может не дойти до `bump-version.mjs`.

Ожидаемый вывод в консоли: строка вида `version: 1.0.0 → 1.0.1`.

Файл `package-lock.json` при смене версии в `package.json` иногда **не** меняется автоматически этим скриптом. Если у вас принято держать lock в синхроне, после bump выполните:

```bash
npm install
```

(обновит `package-lock.json` при необходимости.)

---

## Шаг 3. Проверить соответствие CHANGELOG и версии

```bash
npm run release:verify -- 1.0.1
```

Если секции `## [1.0.1]` в CHANGELOG нет, скрипт завершится с ошибкой — вернитесь к шагу 1.

Проверка «текущая версия из package.json»:

```bash
npm run release:verify
```

---

## Шаг 4. (Опционально) Собрать черновики постов локально

Полезно посмотреть, что попадёт в ZIP на GitHub:

```bash
npm run marketing:bundle -- 1.0.1
```

Результат:

- `marketing/bundle/1.0.1/twitter.md`
- `marketing/bundle/1.0.1/linkedin.md`
- `marketing/bundle/1.0.1/telegram.md`
- `release_notes.md` в корне

Эти пути в `.gitignore` — в репозиторий они не коммитятся.

---

## Шаг 5. Закоммитить изменения

Добавить в индекс файлы релиза:

```bash
git add CHANGELOG.md package.json package-lock.json
```

Если правили только CHANGELOG и `package.json`, а `package-lock` не менялся — можно без lock:

```bash
git add CHANGELOG.md package.json
```

Создать коммит:

```bash
git commit -m "chore: release 1.0.1"
```

Отправить ветку на GitHub (подставьте свою ветку вместо `main`):

```bash
git push origin main
```

При первом push Git может запросить логин: следуйте подсказкам (Personal Access Token для HTTPS или SSH).

---

## Шаг 6. Создать аннотированный тег (рекомендуется)

**Обычный лёгкий тег:**

```bash
git tag v1.0.1
```

**Аннотированный тег** (лучше для релизов — хранит автора и дату):

```bash
git tag -a v1.0.1 -m "Release 1.0.1"
```

Опечатка в версии тега? Удалить тег **локально** (до push):

```bash
git tag -d v1.0.1
```

Создать заново правильный.

Отправить тег на GitHub (именно push тега запускает workflow):

```bash
git push origin v1.0.1
```

Отправить **все** локальные теги разом (осторожно, если лишних тегов нет):

```bash
git push origin --tags
```

---

## Шаг 7. Проверить результат на GitHub

1. Откройте репозиторий на GitHub → **Actions** — должен появиться запуск **Release & marketing bundle**.
2. После успеха — **Releases** (или `https://github.com/USER/REPO/releases`) — релиз `v1.0.1` и файл `textflow-marketing-1.0.1.zip`.

Если workflow красный — откройте job и читайте лог последнего шага.

---

## Полная цепочка: PowerShell (Windows)

Скопируйте блок, замените путь, ветку и версию.

```powershell
# Перейти в проект
Set-Location "C:\Users\Admin\Desktop\Projekt2"

# Версия релиза (без v)
$v = "1.0.1"
$branch = "main"

# 1. Сначала вручную отредактируйте CHANGELOG.md — секция ## [$v]

npm run release:bump -- $v
npm run release:verify -- $v

# опционально: посмотреть черновики
npm run marketing:bundle -- $v

git add CHANGELOG.md package.json package-lock.json
git commit -m "chore: release $v"
git push origin $branch

git tag -a "v$v" -m "Release $v"
git push origin "v$v"
```

---

## Полная цепочка: Git Bash (Windows) / Linux / macOS

```bash
cd ~/Desktop/Projekt2   # или ваш путь

v=1.0.1
branch=main

# 1. Вручную: CHANGELOG.md — секция ## [$v]

npm run release:bump -- "$v"
npm run release:verify -- "$v"
npm run marketing:bundle -- "$v"   # опционально

git add CHANGELOG.md package.json package-lock.json
git commit -m "chore: release $v"
git push origin "$branch"

git tag -a "v$v" -m "Release $v"
git push origin "v$v"
```

---

## Если тег уже улетел на GitHub с ошибкой

Удалить тег **на сервере** (осторожно, если кто-то уже от него отталкивался):

```bash
git push origin --delete v1.0.1
```

Локально:

```bash
git tag -d v1.0.1
```

Исправьте CHANGELOG/код, сделайте новый коммит при необходимости, создайте тег заново и `git push origin v1.0.1`.

---

## Переменная сайта для ссылок в постах (GitHub)

В репозитории: **Settings → Secrets and variables → Actions → Variables** — создайте **`MARKETING_SITE_URL`** = `https://ваш-реальный-домен`.

Иначе в черновиках останется запасной URL `https://textflow.app`.

---

## Краткая шпаргалка команд

| Действие | Команда |
|----------|---------|
| Версия в package.json | `npm run release:bump -- X.Y.Z` |
| Проверка CHANGELOG | `npm run release:verify -- X.Y.Z` |
| Черновики постов | `npm run marketing:bundle -- X.Y.Z` |
| Коммит | `git add …` → `git commit -m "…"` |
| Push ветки | `git push origin ВЕТКА` |
| Тег | `git tag -a vX.Y.Z -m "Release X.Y.Z"` |
| Push тега | `git push origin vX.Y.Z` |

---

## Скрипты «всё подряд» (после правки CHANGELOG)

Сначала **вручную** добавьте в `CHANGELOG.md` секцию `## [X.Y.Z] - дата`. Затем:

**Windows (PowerShell), из корня репозитория:**

```powershell
.\scripts\release.ps1 -Version 1.0.1
```

Другая ветка или пробный прогон без выполнения:

```powershell
.\scripts\release.ps1 -Version 1.0.1 -Branch develop
.\scripts\release.ps1 -Version 1.0.1 -DryRun
```

Если PowerShell блокирует скрипты:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

**Linux / macOS / Git Bash:**

```bash
chmod +x scripts/release.sh
./scripts/release.sh 1.0.1
./scripts/release.sh 1.0.1 develop
./scripts/release.sh 1.0.1 main --dry-run
```

Скрипты вызывают `release:bump`, `release:verify`, коммит, push ветки, создание аннотированного тега `vX.Y.Z` и `git push` тега.

---

## Связанные файлы в репозитории

- `.github/workflows/release-marketing.yml` — workflow по тегу `v*`
- `scripts/generate-marketing-bundle.mjs` — сборка ZIP и `release_notes.md`
- `scripts/bump-version.mjs`, `scripts/verify-release.mjs`
- `scripts/release.ps1`, `scripts/release.sh` — сценарий «одной кнопкой»
- `marketing/templates/*.md` — шаблоны постов
