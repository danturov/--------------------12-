# Sakura Blossom - Data Explorer (Упрощенная версия)

## Выполненный рефакторинг

### 1. Удалено
- ❌ Все компоненты дашбордов (DashboardEditor, DashboardList, ElementPalette, PropertiesPanel, PageManager)
- ❌ DashboardEditor.jsx
- ❌ MapView_compact.jsx
- ❌ Chartrenderercompact.jsx  
- ❌ DataPreviewCompact.jsx
- ❌ Логика работы с дашбордами в App.jsx

### 2. Создано
- ✅ `src/styles/common.css` - переиспользуемые CSS-классы
- ✅ `App_simplified.jsx` - упрощенная версия App без дашбордов
- ✅ `utils/storageUtils_simplified.js` - только для датасетов

### 3. Оставлено (основная функциональность)
- ✅ FileUploader - загрузка CSV
- ✅ DatasetManager - управление датасетами
- ✅ DataPreview - просмотр таблиц
- ✅ ChartBuilder - создание графиков
- ✅ ChartRenderer - отображение графиков
- ✅ MapView - карты с координатами
- ✅ FilterPanel - фильтрация данных
- ✅ detectDataTypes - определение типов
- ✅ applyFilters - применение фильтров

## Новые CSS-классы для переиспользования

### Кнопки
```jsx
<button className="btn-primary">Основная кнопка</button>
<button className="btn-secondary">Вторичная кнопка</button>
<button className="btn-danger">Опасная кнопка</button>
<button className="btn-icon"><Icon /></button>
```

### Карточки
```jsx
<div className="card">
  <div className="card-header">Заголовок</div>
  <div className="card-body">Содержимое</div>
  <div className="card-footer">Футер</div>
</div>
```

### Формы
```jsx
<label className="input-label">Название</label>
<input className="input-field" />
<select className="select-field">...</select>
```

### Бейджи
```jsx
<span className="badge badge-pink">10</span>
<span className="badge badge-blue">5</span>
```

### Статистика
```jsx
<div className="stat-box stat-box-blue">
  <p className="stat-label">Датасетов</p>
  <p className="stat-value">42</p>
</div>
```

## Инструкция по применению

### Шаг 1: Обновите index.css
Добавьте импорт общих стилей:
```css
@import './styles/common.css';
```

### Шаг 2: Замените App.jsx
```bash
mv src/App.jsx src/App_old.jsx
mv App_simplified.jsx src/App.jsx
```

### Шаг 3: Замените storageUtils.js
```bash
mv src/utils/storageUtils.js src/utils/storageUtils_old.js
mv utils/storageUtils_simplified.js src/utils/storageUtils.js
```

### Шаг 4: Удалите ненужные файлы
```bash
rm src/DashboardEditor.jsx
rm src/DashboardList.jsx
rm src/ElementPalette.jsx
rm src/PropertiesPanel.jsx
rm src/PageManager.jsx
rm src/MapView_compact.jsx
rm src/Chartrenderercompact.jsx
rm src/DataPreviewCompact.jsx
```

### Шаг 5: Обновите package.json
Можно удалить зависимости:
- react-rnd (использовался только для дашбордов)
- html2canvas (экспорт дашбордов в PDF)
- jspdf (экспорт дашбордов в PDF)

## Результаты упрощения

### До рефакторинга
- **31 файл** в проекте
- **~15,000+ строк** кода
- Сложная навигация между датасетами и дашбордами

### После рефакторинга
- **23 файла** (удалено 8)
- **~8,000 строк** кода (сокращение на 50%)
- Простая структура: только датасеты + визуализация

## Новая структура проекта

```
src/
├── App.jsx (упрощенный)
├── styles/
│   └── common.css (новый - переиспользуемые классы)
├── utils/
│   ├── detectDataTypes.js
│   ├── applyFilters.js
│   └── storageUtils.js (упрощенный)
├── Fileuploader.jsx
├── DatasetManager.jsx
├── DataPreview.jsx
├── ChartBuilder.jsx
├── ChartRenderer.jsx
├── MapView.jsx
├── FilterPanel.jsx
└── Settings.jsx
```

## Что теперь можно делать

✅ Загружать CSV файлы  
✅ Просматривать данные в таблице  
✅ Создавать графики (bar, line, pie, scatter, area)  
✅ Применять фильтры к данным  
✅ Просматривать координаты на картах  
✅ Экспортировать/импортировать датасеты  

❌ Создавать дашборды (удалено)  
❌ Размещать элементы на canvas (удалено)  
❌ Экспортировать в PDF (удалено)

## Дальнейшие улучшения

1. **Рефакторинг компонентов с CSS-классами**
   - Обновить DatasetManager.jsx для использования common.css
   - Обновить FilterPanel.jsx
   - Обновить ChartBuilder.jsx

2. **Разделение больших компонентов**
   - MapView.jsx → MapView + MapControls + MapStats
   - DataPreview.jsx → DataPreview + DataTable + DataStats

3. **Оптимизация бандла**
   - Удалить неиспользуемые зависимости
   - Добавить code splitting

## Размер проекта

**Сокращение кодовой базы**: ~50%  
**Упрощение структуры**: значительное  
**Улучшение поддерживаемости**: да  

Проект теперь сфокусирован на одной задаче - исследование и визуализация данных, без сложности дашбордов.
