# Как загрузить MacThree-Web в GitHub

## Способ 1: Через веб-интерфейс GitHub (самый простой)

### Шаг 1: Создайте репозиторий

1. Зайдите на **github.com** и войдите в аккаунт
2. Нажмите кнопку **"+"** в правом верхнем углу → **"New repository"**
3. Заполните:
   - **Repository name**: `macthree-game` (или любое другое имя)
   - **Description**: "Match-3 игра MacThree"
   - Выберите **Public** (или Private, если хотите)
   - НЕ ставьте галочки на "Add a README file" и других опциях
4. Нажмите **"Create repository"**

### Шаг 2: Загрузите файлы

1. На странице нового репозитория найдите кнопку **"uploading an existing file"**
   - Или просто перетащите файлы в область репозитория

2. **Перетащите все файлы из папки `MacThree-Web`:**
   - `index.html`
   - `game.js`
   - `styles.css`
   - `manifest.json`
   - `Burger.png`
   - `HotDog.png`
   - `PattatoFree.png`
   - `Pizza.png`
   - `icon-192.png` (если есть)
   - `icon-512.png` (если есть)
   - И другие файлы

3. Внизу страницы:
   - Введите сообщение коммита: `Initial commit - MacThree game`
   - Нажмите **"Commit changes"**

### Шаг 3: Включите GitHub Pages

1. В репозитории перейдите в **Settings** (вкладка вверху)
2. В левом меню найдите **Pages**
3. В разделе **Source**:
   - Выберите **Branch: main**
   - Выберите **Folder: / (root)**
   - Нажмите **Save**
4. Подождите 1-2 минуты
5. GitHub покажет URL вашего сайта: `https://ваш-username.github.io/macthree-game/`

**Готово!** Теперь можно открыть этот URL на iPhone и установить как приложение.

---

## Способ 2: Через Git командную строку

### Шаг 1: Установите Git (если еще не установлен)

- **Windows**: Скачайте с git-scm.com
- **Mac**: Обычно уже установлен, или через Xcode Command Line Tools
- **Linux**: `sudo apt install git` (Ubuntu/Debian)

### Шаг 2: Создайте репозиторий на GitHub

1. Зайдите на github.com
2. Создайте новый репозиторий (как в Способе 1, Шаг 1)
3. НЕ добавляйте README, .gitignore или лицензию

### Шаг 3: Загрузите файлы

Откройте терминал/командную строку и выполните:

```bash
# Перейдите в папку MacThree-Web
cd MacThree-Web

# Инициализируйте Git репозиторий
git init

# Добавьте все файлы
git add .

# Сделайте первый коммит
git commit -m "Initial commit - MacThree game"

# Переименуйте ветку в main (если нужно)
git branch -M main

# Добавьте удаленный репозиторий (замените YOUR_USERNAME и REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Загрузите файлы на GitHub
git push -u origin main
```

**Пример:**
```bash
git remote add origin https://github.com/username/macthree-game.git
git push -u origin main
```

### Шаг 4: Включите GitHub Pages

Как в Способе 1, Шаг 3.

---

## Способ 3: Через GitHub Desktop (графический интерфейс)

### Шаг 1: Установите GitHub Desktop

1. Скачайте с desktop.github.com
2. Установите и войдите в аккаунт GitHub

### Шаг 2: Создайте репозиторий

1. В GitHub Desktop: **File → New Repository**
2. Заполните:
   - **Name**: `macthree-game`
   - **Local Path**: выберите родительскую папку (не саму MacThree-Web)
   - Нажмите **Create Repository**

### Шаг 3: Скопируйте файлы

1. Скопируйте все файлы из `MacThree-Web` в созданную папку `macthree-game`
2. В GitHub Desktop вы увидите все файлы
3. Введите сообщение коммита: `Initial commit`
4. Нажмите **Commit to main**

### Шаг 4: Опубликуйте

1. Нажмите **Publish repository**
2. Выберите **Keep this code private** (или снимите галочку для публичного)
3. Нажмите **Publish Repository**

### Шаг 5: Включите GitHub Pages

Как в Способе 1, Шаг 3.

---

## Проверка

После загрузки:

1. Откройте ваш репозиторий на GitHub
2. Убедитесь, что все файлы видны
3. Откройте `https://ваш-username.github.io/репозиторий/` в браузере
4. Игра должна загрузиться

---

## Решение проблем

### Файлы не загружаются
- Убедитесь, что файлы не слишком большие (GitHub ограничивает до 100MB на файл)
- Проверьте, что вы в правильной папке

### GitHub Pages не работает
- Подождите 2-3 минуты после включения
- Проверьте, что выбрана ветка `main` и папка `/ (root)`
- Убедитесь, что файл `index.html` находится в корне репозитория

### Сайт показывает 404
- Проверьте URL (должен быть правильный username и название репозитория)
- Убедитесь, что GitHub Pages включен в Settings

---

## Рекомендация

**Для начинающих:** Используйте Способ 1 (веб-интерфейс) - самый простой и не требует установки дополнительных программ.

