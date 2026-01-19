/**
 * Утилита для определения типов данных в массиве объектов
 * Анализирует первые 10 строк и определяет тип каждого поля
 */

/**
 * Проверяет, является ли название поля координатой
 * @param {string} fieldName - название поля
 * @returns {boolean}
 */
const isCoordinateField = (fieldName) => {
  const lower = fieldName.toLowerCase();
  const coordinateKeywords = ['lat', 'latitude', 'lng', 'lon', 'longitude'];
  return coordinateKeywords.some(keyword => lower.includes(keyword));
};

/**
 * Проверяет, является ли значение булевым
 * @param {*} value - значение для проверки
 * @returns {boolean}
 */
const isBoolean = (value) => {
  if (value === null || value === undefined) return false;
  
  // Проверка прямого типа boolean
  if (typeof value === 'boolean') return true;
  
  // Проверка строковых представлений
  const lower = String(value).toLowerCase().trim();
  return lower === 'true' || lower === 'false' || 
         lower === 'yes' || lower === 'no';
};

/**
 * Проверяет, является ли значение числом
 * @param {*} value - значение для проверки
 * @returns {boolean}
 */
const isNumber = (value) => {
  if (value === null || value === undefined || value === '') return false;
  
  // Исключаем булевы значения
  if (typeof value === 'boolean') return false;
  const lower = String(value).toLowerCase().trim();
  if (lower === 'true' || lower === 'false' || lower === 'yes' || lower === 'no') return false;
  
  return !isNaN(parseFloat(value)) && isFinite(value);
};

/**
 * Проверяет, является ли значение валидной датой
 * @param {*} value - значение для проверки
 * @returns {boolean}
 */
const isDate = (value) => {
  if (value === null || value === undefined || value === '') return false;
  
  // Исключаем булевы значения
  if (typeof value === 'boolean') return false;
  const lower = String(value).toLowerCase().trim();
  if (lower === 'true' || lower === 'false') return false;
  
  // Пытаемся распарсить как дату
  const parsed = new Date(value);
  
  // Проверяем валидность даты
  if (isNaN(parsed.getTime())) return false;
  
  // Дополнительная проверка: год должен быть разумным (1900-2100)
  const year = parsed.getFullYear();
  if (year < 1900 || year > 2100) return false;
  
  return true;
};

/**
 * Форматирует название поля в читаемый label
 * @param {string} fieldName - название поля
 * @returns {string}
 */
const formatLabel = (fieldName) => {
  return fieldName
    .replace(/_/g, ' ') // Заменяем подчеркивания на пробелы
    .replace(/\b\w/g, char => char.toUpperCase()); // Первая буква каждого слова заглавная
};

/**
 * Определяет тип поля на основе его значений
 * @param {string} fieldName - название поля
 * @param {Array} values - массив значений поля
 * @returns {string} - тип: 'number' | 'date' | 'string' | 'coordinate' | 'boolean'
 */
const detectFieldType = (fieldName, values) => {
  // Фильтруем пустые значения
  const validValues = values.filter(v => v !== null && v !== undefined && v !== '');
  
  // Если нет валидных значений, считаем строкой
  if (validValues.length === 0) return 'string';
  
  // 1. Проверка на координаты (по имени поля)
  if (isCoordinateField(fieldName)) {
    return 'coordinate';
  }
  
  // 2. Проверка на булевы значения (ВАЖНО: до проверки на числа и даты!)
  const allBooleans = validValues.every(isBoolean);
  if (allBooleans) {
    return 'boolean';
  }
  
  // 3. Проверка на числа
  const allNumbers = validValues.every(isNumber);
  if (allNumbers) {
    return 'number';
  }
  
  // 4. Проверка на даты
  const allDates = validValues.every(isDate);
  if (allDates) {
    return 'date';
  }
  
  // 5. По умолчанию - строка
  return 'string';
};

/**
 * Анализирует массив объектов и определяет типы всех полей
 * @param {Array<Object>} data - массив объектов для анализа
 * @returns {Object} - объект с типами полей
 * 
 * Пример возвращаемого значения:
 * {
 *   age: { type: 'number', label: 'Age' },
 *   name: { type: 'string', label: 'Name' },
 *   created_at: { type: 'date', label: 'Created At' },
 *   latitude: { type: 'coordinate', label: 'Latitude' },
 *   is_active: { type: 'boolean', label: 'Is Active' }
 * }
 */
export const detectDataTypes = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.warn('⚠️ detectDataTypes: Пустой или невалидный массив данных');
    return {};
  }
  
  // Берем первые 10 строк для анализа (производительность)
  const sampleSize = Math.min(10, data.length);
  const sample = data.slice(0, sampleSize);
  
  // Получаем список всех полей из первого объекта
  const fields = Object.keys(sample[0] || {});
  
  if (fields.length === 0) {
    console.warn('⚠️ detectDataTypes: Нет полей в данных');
    return {};
  }
  
  // Анализируем каждое поле
  const types = {};
  
  fields.forEach(field => {
    // Собираем все значения этого поля из выборки
    const values = sample.map(row => row[field]);
    
    // Определяем тип
    const type = detectFieldType(field, values);
    
    // Создаем label
    const label = formatLabel(field);
    
    types[field] = { type, label };
  });
  
  console.log('📊 Типы полей определены:', types);
  
  return types;
};

/**
 * Получает список полей определенного типа
 * @param {Object} types - объект с типами (результат detectDataTypes)
 * @param {string} targetType - искомый тип ('number', 'date', 'string', 'coordinate', 'boolean')
 * @returns {Array<string>} - массив названий полей
 */
export const getFieldsByType = (types, targetType) => {
  return Object.keys(types).filter(field => types[field].type === targetType);
};

/**
 * Проверяет, есть ли в данных числовые поля
 * @param {Object} types - объект с типами (результат detectDataTypes)
 * @returns {boolean}
 */
export const hasNumericFields = (types) => {
  return getFieldsByType(types, 'number').length > 0;
};

/**
 * Проверяет, есть ли в данных поля с датами
 * @param {Object} types - объект с типами (результат detectDataTypes)
 * @returns {boolean}
 */
export const hasDateFields = (types) => {
  return getFieldsByType(types, 'date').length > 0;
};

/**
 * Проверяет, есть ли в данных координаты
 * @param {Object} types - объект с типами (результат detectDataTypes)
 * @returns {boolean}
 */
export function hasCoordinates(dataTypes) {
  if (!dataTypes) return false;
  
  let coordCount = 0;
  let hasLat = false;
  let hasLon = false;
  
  Object.entries(dataTypes).forEach(([field, type]) => {
    const fieldLower = field.toLowerCase();
    
    if (type === 'coordinate') coordCount++;
    if (type === 'latitude') hasLat = true;
    if (type === 'longitude') hasLon = true;
    
    if (fieldLower.includes('lat')) hasLat = true;
    if (fieldLower.includes('lon') || fieldLower.includes('lng')) hasLon = true;
  });
  
  return coordCount >= 2 || (hasLat && hasLon);
}

/**
 * Проверяет, есть ли в данных булевы поля
 * @param {Object} types - объект с типами (результат detectDataTypes)
 * @returns {boolean}
 */
export const hasBooleanFields = (types) => {
  return getFieldsByType(types, 'boolean').length > 0;
};

export default detectDataTypes;