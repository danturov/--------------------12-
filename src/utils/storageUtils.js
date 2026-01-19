/**
 * Утилиты для работы с localStorage
 * Сохранение и загрузка проектов Sakura Blossom
 */

const STORAGE_KEYS = {
    DATASETS: 'sakura_datasets',
    DASHBOARDS: 'sakura_dashboards',
    SETTINGS: 'sakura_settings',
    AUTOSAVE: 'sakura_autosave',
    VERSION: 'sakura_version'
  };
  
  const CURRENT_VERSION = '1.0.0';
  
  /**
   * Сохранить датасеты в localStorage
   */
  export const saveDatasets = (datasets) => {
    try {
      const data = {
        version: CURRENT_VERSION,
        timestamp: Date.now(),
        datasets: datasets
      };
      localStorage.setItem(STORAGE_KEYS.DATASETS, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Ошибка сохранения датасетов:', error);
      return false;
    }
  };
  
  /**
   * Загрузить датасеты из localStorage
   */
  export const loadDatasets = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DATASETS);
      if (!stored) return [];
      
      const data = JSON.parse(stored);
      return data.datasets || [];
    } catch (error) {
      console.error('Ошибка загрузки датасетов:', error);
      return [];
    }
  };
  
  /**
   * Сохранить дашборды в localStorage
   */
  export const saveDashboards = (dashboards) => {
    try {
      const data = {
        version: CURRENT_VERSION,
        timestamp: Date.now(),
        dashboards: dashboards
      };
      localStorage.setItem(STORAGE_KEYS.DASHBOARDS, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Ошибка сохранения дашбордов:', error);
      return false;
    }
  };
  
  /**
   * Загрузить дашборды из localStorage
   */
  export const loadDashboards = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.DASHBOARDS);
      if (!stored) return [];
      
      const data = JSON.parse(stored);
      return data.dashboards || [];
    } catch (error) {
      console.error('Ошибка загрузки дашбордов:', error);
      return [];
    }
  };
  
  /**
   * Сохранить настройки проекта
   */
  export const saveSettings = (settings) => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
      return false;
    }
  };
  
  /**
   * Загрузить настройки проекта
   */
  export const loadSettings = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!stored) return null;
      
      return JSON.parse(stored);
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
      return null;
    }
  };
  
  /**
   * Экспорт всего проекта в JSON
   */
  export const exportProject = (datasets, dashboards, settings) => {
    const project = {
      version: CURRENT_VERSION,
      exportedAt: new Date().toISOString(),
      datasets: datasets,
      dashboards: dashboards,
      settings: settings
    };
  
    const blob = new Blob([JSON.stringify(project, null, 2)], { 
      type: 'application/json' 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sakura_project_${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };
  
  /**
   * Импорт проекта из JSON
   */
  export const importProject = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const project = JSON.parse(e.target.result);
          
          // Проверка версии
          if (!project.version) {
            throw new Error('Неверный формат файла проекта');
          }
          
          // Валидация структуры
          if (!project.datasets || !project.dashboards) {
            throw new Error('Отсутствуют обязательные данные');
          }
          
          resolve({
            datasets: project.datasets,
            dashboards: project.dashboards,
            settings: project.settings || {}
          });
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('Ошибка чтения файла'));
      reader.readAsText(file);
    });
  };
  
  /**
   * Автосохранение (debounced)
   */
  let autosaveTimeout = null;
  
  export const autoSave = (datasets, dashboards) => {
    clearTimeout(autosaveTimeout);
    
    autosaveTimeout = setTimeout(() => {
      try {
        const data = {
          timestamp: Date.now(),
          datasets: datasets,
          dashboards: dashboards
        };
        localStorage.setItem(STORAGE_KEYS.AUTOSAVE, JSON.stringify(data));
        console.log('✓ Автосохранение выполнено');
      } catch (error) {
        console.error('Ошибка автосохранения:', error);
      }
    }, 30000); // 30 секунд
  };
  
  /**
   * Восстановить из автосохранения
   */
  export const loadAutosave = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUTOSAVE);
      if (!stored) return null;
      
      const data = JSON.parse(stored);
      
      // Проверяем, не старше ли автосохранение 24 часов
      const ageHours = (Date.now() - data.timestamp) / (1000 * 60 * 60);
      if (ageHours > 24) {
        localStorage.removeItem(STORAGE_KEYS.AUTOSAVE);
        return null;
      }
      
      return {
        datasets: data.datasets,
        dashboards: data.dashboards,
        timestamp: data.timestamp
      };
    } catch (error) {
      console.error('Ошибка загрузки автосохранения:', error);
      return null;
    }
  };
  
  /**
   * Очистить все данные
   */
  export const clearAllData = () => {
    if (window.confirm('Вы уверены? Все данные будут удалены.')) {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
      return true;
    }
    return false;
  };
  
  /**
   * Получить размер данных в localStorage
   */
  export const getStorageSize = () => {
    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage[key].length + key.length;
      }
    }
    return (total / 1024).toFixed(2); // В килобайтах
  };