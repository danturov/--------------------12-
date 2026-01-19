# Какие файлы нужно скопировать из оригинального проекта

## Скопируйте ЭТИ файлы из вашего текущего src/ в новый src/:

### Компоненты (без изменений)
- ✅ src/Fileuploader.jsx
- ✅ src/DatasetManager.jsx
- ✅ src/DataPreview.jsx
- ✅ src/Chartbuilder.jsx
- ✅ src/Chartrenderer.jsx
- ✅ src/Mapview.jsx
- ✅ src/FilterPanel.jsx

### Utils (без изменений)
- ✅ src/utils/detectDataTypes.js
- ✅ src/utils/applyFilters.js

### Public (если есть)
- ✅ public/index.html
- ✅ public/favicon.ico

## НЕ копируйте эти файлы (они удалены):
- ❌ src/DashboardEditor.jsx
- ❌ src/DashboardList.jsx
- ❌ src/ElementPalette.jsx
- ❌ src/PropertiesPanel.jsx
- ❌ src/PageManager.jsx
- ❌ src/MapView_compact.jsx
- ❌ src/Chartrenderercompact.jsx
- ❌ src/DataPreviewCompact.jsx

## Файлы уже созданы в новом проекте (не копировать):
- ✅ src/App.jsx (новая упрощенная версия)
- ✅ src/index.js
- ✅ src/index.css (обновленная версия)
- ✅ src/styles/common.css (новый!)
- ✅ src/utils/storageUtils.js (упрощенная версия)
- ✅ package.json (обновленная - без react-rnd, html2canvas, jspdf)
- ✅ tailwind.config.js
- ✅ .gitignore
- ✅ README.md
- ✅ REFACTORING_GUIDE.md

## Команда для копирования (из вашего старого проекта):

```bash
# Из корня вашего старого проекта выполните:
cp src/Fileuploader.jsx ../sakura-refactored/src/
cp src/DatasetManager.jsx ../sakura-refactored/src/
cp src/DataPreview.jsx ../sakura-refactored/src/
cp src/Chartbuilder.jsx ../sakura-refactored/src/
cp src/Chartrenderer.jsx ../sakura-refactored/src/
cp src/Mapview.jsx ../sakura-refactored/src/
cp src/FilterPanel.jsx ../sakura-refactored/src/
cp -r src/utils/detectDataTypes.js ../sakura-refactored/src/utils/
cp -r src/utils/applyFilters.js ../sakura-refactored/src/utils/
cp -r public ../sakura-refactored/
```

Или скопируйте файлы вручную через ваш редактор/IDE.
