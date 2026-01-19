# Sakura Blossom - Data Explorer (Simplified)

Упрощенная версия проекта для исследования и визуализации данных.

## Что убрано
- Дашборды (DashboardEditor, ElementPalette и т.д.)
- Экспорт в PDF
- react-rnd, html2canvas, jspdf

## Что осталось
- ✅ Загрузка CSV файлов
- ✅ Просмотр данных в таблице
- ✅ Создание графиков (5 типов)
- ✅ Фильтрация данных
- ✅ Карты с координатами
- ✅ Экспорт/импорт датасетов

## Установка

```bash
npm install
npm start
```

## Новые возможности

### Переиспользуемые CSS-классы (common.css)
Стандартизированные стили для быстрой разработки:
- Кнопки: `btn-primary`, `btn-secondary`, `btn-danger`
- Карточки: `card`, `card-header`, `card-body`
- Формы: `input-field`, `select-field`, `input-label`
- Бейджи: `badge badge-pink`, `badge badge-blue`

См. `REFACTORING_GUIDE.md` для подробностей.

## Структура проекта

```
src/
├── App.jsx (упрощенный - без дашбордов)
├── styles/
│   └── common.css (новый!)
├── utils/
│   ├── detectDataTypes.js
│   ├── applyFilters.js
│   └── storageUtils.js (упрощенный)
└── [остальные компоненты без изменений]
```

## Сокращение кода
- **50% меньше** строк кода
- **Убрано 8 файлов**
- **Проще поддерживать**
