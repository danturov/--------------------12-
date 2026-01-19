/**
 * Утилита для применения фильтров к данным
 * Поддерживает фильтрацию по числовым диапазонам, выбору значений и диапазонам дат
 */

/**
 * Применяет фильтры к массиву данных
 * @param {Array<Object>} data - Исходные данные
 * @param {Object} filters - Объект фильтров { fieldName: { type, ...params } }
 * @returns {Array<Object>} - Отфильтрованные данные
 */
export const applyFilters = (data, filters) => {
    // Если нет данных, возвращаем пустой массив
    if (!data || !Array.isArray(data) || data.length === 0) {
      return [];
    }
  
    // Если нет фильтров или объект фильтров пустой, возвращаем исходные данные
    if (!filters || Object.keys(filters).length === 0) {
      return data;
    }
  
    // Фильтруем данные
    return data.filter(item => {
      // Проверяем каждый фильтр (логика AND - все условия должны выполняться)
      return Object.entries(filters).every(([field, filter]) => {
        // Получаем значение поля
        const value = item[field];
  
        // Пропускаем null/undefined значения (они не проходят фильтр)
        if (value == null) {
          return false;
        }
  
        // Применяем фильтр в зависимости от типа
        switch (filter.type) {
          case 'range':
            return applyRangeFilter(value, filter);
          
          case 'select':
            return applySelectFilter(value, filter);
          
          case 'date':
            return applyDateFilter(value, filter);
          
          default:
            // Неизвестный тип фильтра - пропускаем элемент
            return true;
        }
      });
    });
  };
  
  /**
   * Применяет фильтр диапазона (для чисел)
   * @param {number} value - Значение поля
   * @param {Object} filter - { type: 'range', min: number, max: number }
   * @returns {boolean}
   */
  const applyRangeFilter = (value, filter) => {
    const numValue = parseFloat(value);
    
    // Если значение не число, не проходит фильтр
    if (isNaN(numValue)) {
      return false;
    }
  
    const min = filter.min != null ? parseFloat(filter.min) : -Infinity;
    const max = filter.max != null ? parseFloat(filter.max) : Infinity;
  
    return numValue >= min && numValue <= max;
  };
  
  /**
   * Применяет фильтр выбора (для строк)
   * @param {string} value - Значение поля
   * @param {Object} filter - { type: 'select', values: Array<string> }
   * @returns {boolean}
   */
  const applySelectFilter = (value, filter) => {
    // Если не выбрано ни одно значение, пропускаем все
    if (!filter.values || filter.values.length === 0) {
      return true;
    }
  
    // Проверяем, входит ли значение в выбранные
    return filter.values.includes(value);
  };
  
  /**
   * Применяет фильтр диапазона дат
   * @param {string|Date} value - Значение поля (дата)
   * @param {Object} filter - { type: 'date', from: string, to: string }
   * @returns {boolean}
   */
  const applyDateFilter = (value, filter) => {
    try {
      const date = new Date(value);
      
      // Проверка на валидную дату
      if (isNaN(date.getTime())) {
        return false;
      }
  
      const fromDate = filter.from ? new Date(filter.from) : new Date(-8640000000000000); // Min date
      const toDate = filter.to ? new Date(filter.to) : new Date(8640000000000000); // Max date
  
      // Устанавливаем время на начало/конец дня для корректного сравнения
      fromDate.setHours(0, 0, 0, 0);
      toDate.setHours(23, 59, 59, 999);
  
      return date >= fromDate && date <= toDate;
    } catch (error) {
      // Если ошибка парсинга даты, не проходит фильтр
      return false;
    }
  };
  
  /**
   * Получает статистику фильтрации
   * @param {number} originalCount - Количество исходных записей
   * @param {number} filteredCount - Количество отфильтрованных записей
   * @returns {Object} - { originalCount, filteredCount, percentage, isFiltered }
   */
  export const getFilterStats = (originalCount, filteredCount) => {
    const percentage = originalCount > 0 
      ? Math.round((filteredCount / originalCount) * 100) 
      : 0;
  
    return {
      originalCount,
      filteredCount,
      percentage,
      isFiltered: originalCount !== filteredCount
    };
  };
  
  /**
   * Проверяет, активны ли фильтры
   * @param {Object} filters - Объект фильтров
   * @returns {boolean}
   */
  export const hasActiveFilters = (filters) => {
    if (!filters || typeof filters !== 'object') {
      return false;
    }
  
    return Object.keys(filters).length > 0;
  };
  
  export default applyFilters;