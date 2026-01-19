import React, { useState, useEffect } from 'react';
import { FileUp, Database, Layout, Settings as SettingsIcon, Download, Upload, Home } from 'lucide-react';
import FileUploader from './Fileuploader.jsx';
import DataPreview from './DataPreview.jsx';
import ChartBuilder from './Chartbuilder.jsx';
import ChartRenderer from './Chartrenderer.jsx';
import MapView from './Mapview.jsx';
import SettingsComponent from './Settings.jsx';
import FilterPanel from './FilterPanel.jsx';
import DatasetManager from './DatasetManager.jsx';
import DashboardList from './DashboardList.jsx';
import DashboardEditor from './DashboardEditor.jsx';
import ElementPalette from './ElementPalette.jsx';
import PropertiesPanel from './PropertiesPanel.jsx';
import PageManager from './PageManager.jsx';
import { detectDataTypes, hasCoordinates } from './utils/detectDataTypes';
import { applyFilters } from './utils/applyFilters';
import { 
  saveDatasets, 
  loadDatasets, 
  saveDashboards, 
  loadDashboards,
  saveSettings,
  loadSettings,
  exportProject,
  importProject,
  autoSave,
  loadAutosave
} from './utils/storageUtils';

function App() {
  // ========================
  // ГЛОБАЛЬНОЕ СОСТОЯНИЕ
  // ========================
  
  // Датасеты (источники данных)
  const [datasets, setDatasets] = useState([]);
  const [activeDatasetId, setActiveDatasetId] = useState(null);
  
  // Дашборды (финальные презентации)
  const [dashboards, setDashboards] = useState([]);
  const [activeDashboardId, setActiveDashboardId] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null); // Выбранный элемент в редакторе
  
  // Навигация
  const [mainView, setMainView] = useState('welcome'); // 'welcome' | 'datasets' | 'dashboards'
  const [datasetView, setDatasetView] = useState('table'); // 'table' | 'charts' | 'map' | 'filters'
  
  // Глобальные настройки
  const [globalSettings, setGlobalSettings] = useState({
    theme: 'sakura-pink',
    defaultCanvasFormat: 'a4-portrait',
    autoSave: true
  });

  // ========================
  // ЗАГРУЗКА ИЗ LOCALSTORAGE
  // ========================
  
  useEffect(() => {
    const storedDatasets = loadDatasets();
    const storedDashboards = loadDashboards();
    const storedSettings = loadSettings();
    
    if (storedDatasets.length > 0) {
      setDatasets(storedDatasets);
    }
    
    if (storedDashboards.length > 0) {
      setDashboards(storedDashboards);
    }
    
    if (storedSettings) {
      setGlobalSettings(storedSettings);
    }
    
    // Проверка автосохранения
    const autosave = loadAutosave();
    if (autosave) {
      const restore = window.confirm(
        `Найдено автосохранение от ${new Date(autosave.timestamp).toLocaleString('ru-RU')}. Восстановить?`
      );
      if (restore) {
        setDatasets(autosave.datasets);
        setDashboards(autosave.dashboards);
      }
    }
  }, []);

  // ========================
  // АВТОСОХРАНЕНИЕ
  // ========================
  
  useEffect(() => {
    if (globalSettings.autoSave && (datasets.length > 0 || dashboards.length > 0)) {
      autoSave(datasets, dashboards);
    }
  }, [datasets, dashboards, globalSettings.autoSave]);

  // ========================
  // СОХРАНЕНИЕ В LOCALSTORAGE
  // ========================
  
  useEffect(() => {
    if (datasets.length > 0) {
      saveDatasets(datasets);
    }
  }, [datasets]);

  useEffect(() => {
    if (dashboards.length > 0) {
      saveDashboards(dashboards);
    }
  }, [dashboards]);

  useEffect(() => {
    saveSettings(globalSettings);
  }, [globalSettings]);

  // ========================
  // РАБОТА С ДАТАСЕТАМИ
  // ========================
  
  const handleFileLoad = (parsedData, loadedFileName) => {
    if (parsedData && parsedData.length > 0) {
      const detectedTypes = detectDataTypes(parsedData);
      
      const newDataset = {
        id: `dataset_${Date.now()}`,
        name: loadedFileName.replace(/\.[^/.]+$/, ''),
        fileName: loadedFileName,
        data: parsedData,
        dataTypes: detectedTypes,
        filteredData: null,
        filters: {},
        charts: [],
        hasMap: hasCoordinates(detectedTypes),
        createdAt: Date.now()
      };

      setDatasets(prev => [...prev, newDataset]);
      setActiveDatasetId(newDataset.id);
      setMainView('datasets');
      setDatasetView('table');
      
      console.log('✅ Датасет создан:', newDataset.name);
    }
  };

  const handleDeleteDataset = (datasetId) => {
    setDatasets(prev => prev.filter(d => d.id !== datasetId));
    if (activeDatasetId === datasetId) {
      setActiveDatasetId(null);
      setMainView('datasets');
    }
  };

  const updateDataset = (datasetId, updates) => {
    setDatasets(prev => prev.map(d => 
      d.id === datasetId ? { ...d, ...updates } : d
    ));
  };

  const handleRenameDataset = (datasetId, newName) => {
    if (!newName.trim()) return;
    updateDataset(datasetId, { name: newName.trim() });
  };

  // ========================
  // РАБОТА С ДАШБОРДАМИ
  // ========================
  
  const handleCreateDashboard = ({ name, template }) => {
    const newDashboard = {
      id: `dashboard_${Date.now()}`,
      name: name,
      description: '',
      template: template,
      pages: [
        {
          id: `page_${Date.now()}`,
          name: 'Страница 1',
          elements: []
        }
      ],
      currentPageIndex: 0,
      canvasFormat: globalSettings.defaultCanvasFormat,
      canvasWidth: 1920,
      canvasHeight: 1080,
      settings: {
        background: '#ffffff',
        padding: 20
      },
      createdAt: Date.now(),
      lastModified: Date.now()
    };

    setDashboards(prev => [...prev, newDashboard]);
    setActiveDashboardId(newDashboard.id);
    setMainView('dashboards');
    
    console.log('✅ Дашборд создан:', newDashboard.name);
  };

  const handleOpenDashboard = (dashboardId, mode = 'edit') => {
    setActiveDashboardId(dashboardId);
    setMainView('dashboards');
  };

  const handleDeleteDashboard = (dashboardId) => {
    setDashboards(prev => prev.filter(d => d.id !== dashboardId));
    if (activeDashboardId === dashboardId) {
      setActiveDashboardId(null);
    }
  };

  const handleDuplicateDashboard = (dashboardId) => {
    const original = dashboards.find(d => d.id === dashboardId);
    if (!original) return;

    const duplicate = {
      ...original,
      id: `dashboard_${Date.now()}`,
      name: `${original.name} (копия)`,
      createdAt: Date.now(),
      lastModified: Date.now()
    };

    setDashboards(prev => [...prev, duplicate]);
  };

  const updateDashboard = (dashboardId, updates) => {
    setDashboards(prev => prev.map(d => 
      d.id === dashboardId 
        ? { ...d, ...updates, lastModified: Date.now() } 
        : d
    ));
  };

  // ========================
  // ЭКСПОРТ/ИМПОРТ ПРОЕКТА
  // ========================
  
  const handleExportProject = () => {
    exportProject(datasets, dashboards, globalSettings);
  };

  const handleImportProject = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    importProject(file)
      .then((project) => {
        if (window.confirm('Импортировать проект? Текущие данные будут заменены.')) {
          setDatasets(project.datasets);
          setDashboards(project.dashboards);
          setGlobalSettings(prev => ({ ...prev, ...project.settings }));
          alert('Проект успешно импортирован!');
        }
      })
      .catch((error) => {
        alert(`Ошибка импорта: ${error.message}`);
      });

    e.target.value = '';
  };

  // ========================
  // ТЕКУЩИЙ ДАТАСЕТ/ДАШБОРД
  // ========================
  
  const activeDataset = datasets.find(d => d.id === activeDatasetId);
  const activeDashboard = dashboards.find(d => d.id === activeDashboardId);

  // ========================
  // РАБОТА С ГРАФИКАМИ (для текущего датасета)
  // ========================
  
  const handleChartConfig = (config) => {
    if (!activeDataset) return;

    const newChart = {
      id: `chart_${Date.now()}`,
      ...config
    };

    updateDataset(activeDataset.id, {
      charts: [...activeDataset.charts, newChart]
    });
  };

  const handleRemoveChart = (chartId) => {
    if (!activeDataset) return;

    updateDataset(activeDataset.id, {
      charts: activeDataset.charts.filter(c => c.id !== chartId)
    });
  };

  // ========================
  // РАБОТА С ФИЛЬТРАМИ (для текущего датасета)
  // ========================
  
  const handleFilterChange = (newFilters) => {
    if (!activeDataset) return;

    const filtered = applyFilters(activeDataset.data, newFilters);
    
    updateDataset(activeDataset.id, {
      filters: newFilters,
      filteredData: filtered
    });
  };

  // ========================
  // ТЕМЫ
  // ========================
  
  const getThemeClasses = () => {
    const themes = {
      'sakura-pink': {
        gradient: 'from-pink-50 via-white to-pink-100',
        header: 'from-pink-500 to-pink-600',
        accent: 'text-pink-600'
      },
      'ocean-blue': {
        gradient: 'from-blue-50 via-white to-blue-100',
        header: 'from-blue-500 to-blue-600',
        accent: 'text-blue-600'
      },
      'forest-green': {
        gradient: 'from-green-50 via-white to-green-100',
        header: 'from-green-500 to-green-600',
        accent: 'text-green-600'
      }
    };

    return themes[globalSettings.theme] || themes['sakura-pink'];
  };

  const theme = getThemeClasses();

  // ========================
  // RENDER
  // ========================

  // Если открыт редактор дашборда - полноэкранный режим
  if (mainView === 'dashboards' && activeDashboard) {
    // Миграция старых дашбордов к новой структуре (если есть elements вместо pages)
    if (activeDashboard.elements && !activeDashboard.pages) {
      const migratedDashboard = {
        ...activeDashboard,
        pages: [
          {
            id: `page_${Date.now()}`,
            name: 'Страница 1',
            elements: activeDashboard.elements || []
          }
        ],
        currentPageIndex: 0
      };
      delete migratedDashboard.elements;
      updateDashboard(activeDashboard.id, migratedDashboard);
      return null; // Ждем обновления
    }

    const pages = activeDashboard.pages || [];
    const currentPageIndex = activeDashboard.currentPageIndex || 0;
    const currentPage = pages[currentPageIndex] || pages[0];

    if (!currentPage) {
      return (
        <div className="h-screen flex items-center justify-center bg-gray-100">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Ошибка загрузки дашборда</p>
            <button
              onClick={() => setActiveDashboardId(null)}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg"
            >
              Вернуться к списку
            </button>
          </div>
        </div>
      );
    }

    // Создаем виртуальный dashboard для текущей страницы
    const pageAsDashboard = {
      ...activeDashboard,
      elements: currentPage.elements || []
    };

    const handleAddElement = (elementData) => {
      const newElement = {
        id: `element_${Date.now()}`,
        x: 50,
        y: 50,
        width: 400,
        height: 300,
        ...elementData
      };
      
      const newElements = [...(currentPage.elements || []), newElement];
      const newPages = [...pages];
      newPages[currentPageIndex] = { ...currentPage, elements: newElements };
      
      updateDashboard(activeDashboard.id, { pages: newPages });
      setSelectedElement(newElement);
    };

    const handleUpdateElement = (elementId, updates) => {
      const newElements = currentPage.elements.map(el =>
        el.id === elementId ? { ...el, ...updates } : el
      );
      const newPages = [...pages];
      newPages[currentPageIndex] = { ...currentPage, elements: newElements };
      
      updateDashboard(activeDashboard.id, { pages: newPages });
      
      // Обновляем selectedElement из обновленных данных
      if (selectedElement && selectedElement.id === elementId) {
        const updatedElement = newElements.find(el => el.id === elementId);
        if (updatedElement) {
          setSelectedElement(updatedElement);
        }
      }
    };

    const handleDeleteElement = (elementId) => {
      const newElements = currentPage.elements.filter(el => el.id !== elementId);
      const newPages = [...pages];
      newPages[currentPageIndex] = { ...currentPage, elements: newElements };
      
      updateDashboard(activeDashboard.id, { pages: newPages });
      setSelectedElement(null);
    };

    const handlePageChange = (index) => {
      updateDashboard(activeDashboard.id, { currentPageIndex: index });
      setSelectedElement(null);
    };

    const handleAddPage = () => {
      const newPage = {
        id: `page_${Date.now()}`,
        name: `Страница ${pages.length + 1}`,
        elements: []
      };
      const newPages = [...pages, newPage];
      updateDashboard(activeDashboard.id, { 
        pages: newPages,
        currentPageIndex: newPages.length - 1
      });
      setSelectedElement(null);
    };

    const handleDeletePage = (index) => {
      if (pages.length <= 1) return;
      
      const newPages = pages.filter((_, i) => i !== index);
      const newIndex = Math.min(currentPageIndex, newPages.length - 1);
      
      updateDashboard(activeDashboard.id, { 
        pages: newPages,
        currentPageIndex: newIndex
      });
      setSelectedElement(null);
    };

    const handleDuplicatePage = (index) => {
      const pageToDuplicate = pages[index];
      const duplicatedPage = {
        ...JSON.parse(JSON.stringify(pageToDuplicate)),
        id: `page_${Date.now()}`,
        name: `${pageToDuplicate.name} (копия)`,
        elements: pageToDuplicate.elements.map(el => ({
          ...el,
          id: `element_${Date.now()}_${Math.random()}`
        }))
      };
      
      const newPages = [...pages];
      newPages.splice(index + 1, 0, duplicatedPage);
      
      updateDashboard(activeDashboard.id, { 
        pages: newPages,
        currentPageIndex: index + 1
      });
      setSelectedElement(null);
    };

    const handleReorderPages = (newPages) => {
      updateDashboard(activeDashboard.id, { pages: newPages });
    };

    return (
      <div className="h-screen flex relative">
        <ElementPalette
          datasets={datasets}
          onAddElement={handleAddElement}
        />

        <DashboardEditor
          dashboard={pageAsDashboard}
          datasets={datasets}
          onUpdate={(dashboardId, updates) => {
            // Обновляем элементы текущей страницы
            if (updates.elements) {
              const newPages = [...pages];
              newPages[currentPageIndex] = { ...currentPage, elements: updates.elements };
              updateDashboard(activeDashboard.id, { pages: newPages });
            }
          }}
          onBack={() => {
            setActiveDashboardId(null);
            setSelectedElement(null);
          }}
          selectedElement={selectedElement}
          onSelectElement={setSelectedElement}
        />

        <PropertiesPanel
          element={selectedElement}
          datasets={datasets}
          onUpdate={handleUpdateElement}
          onDelete={handleDeleteElement}
        />

        <PageManager
          pages={pages}
          currentPageIndex={currentPageIndex}
          onPageChange={handlePageChange}
          onAddPage={handleAddPage}
          onDeletePage={handleDeletePage}
          onDuplicatePage={handleDuplicatePage}
          onReorderPages={handleReorderPages}
        />
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${theme.gradient}`}>
      {/* ============ HEADER ============ */}
      <header className={`bg-gradient-to-r ${theme.header} shadow-lg`}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-2xl">🌸</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  Sakura Blossom
                </h1>
                <p className="text-sm text-pink-100">
                  Dashboard Builder
                </p>
              </div>
            </div>

            {/* Действия в шапке */}
            <div className="flex items-center space-x-3">
              <button
                onClick={handleExportProject}
                disabled={datasets.length === 0 && dashboards.length === 0}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">Экспорт проекта</span>
              </button>

              <label className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors flex items-center space-x-2 cursor-pointer">
                <Upload className="w-4 h-4" />
                <span className="text-sm">Импорт проекта</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportProject}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </header>

      {/* ============ ГЛАВНАЯ НАВИГАЦИЯ ============ */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1">
            <button
              onClick={() => setMainView('welcome')}
              className={`px-6 py-3 font-medium transition-colors flex items-center space-x-2 ${
                mainView === 'welcome'
                  ? `${theme.accent} border-b-2 border-pink-600`
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Главная</span>
            </button>

            <button
              onClick={() => setMainView('datasets')}
              className={`px-6 py-3 font-medium transition-colors flex items-center space-x-2 ${
                mainView === 'datasets'
                  ? `${theme.accent} border-b-2 border-pink-600`
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Датасеты</span>
              {datasets.length > 0 && (
                <span className="bg-pink-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {datasets.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setMainView('dashboards')}
              className={`px-6 py-3 font-medium transition-colors flex items-center space-x-2 ${
                mainView === 'dashboards'
                  ? `${theme.accent} border-b-2 border-pink-600`
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <Layout className="w-4 h-4" />
              <span>Дашборды</span>
              {dashboards.length > 0 && (
                <span className="bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {dashboards.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setMainView('settings')}
              className={`px-6 py-3 font-medium transition-colors flex items-center space-x-2 ${
                mainView === 'settings'
                  ? `${theme.accent} border-b-2 border-pink-600`
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <SettingsIcon className="w-4 h-4" />
              <span>Настройки</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ============ ОСНОВНОЙ КОНТЕНТ ============ */}
      <main>
        {/* WELCOME SCREEN */}
        {mainView === 'welcome' && (
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-gradient-to-br from-pink-100 to-pink-50 w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8">
                <span className="text-6xl">🌸</span>
              </div>
              
              <h2 className="text-4xl font-bold text-gray-800 mb-4">
                Добро пожаловать в Sakura Blossom
              </h2>
              <p className="text-xl text-gray-600 mb-12">
                Создавайте красивые интерактивные дашборды из ваших данных
              </p>

              <div className="grid md:grid-cols-2 gap-6 mb-12">
                <FileUploader onFileLoad={handleFileLoad} />
                
                <div className="bg-white rounded-xl shadow-lg p-8 border-2 border-dashed border-gray-300">
                  <label className="cursor-pointer block">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-800 mb-2">
                      Открыть проект
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Загрузите сохранённый .json файл проекта
                    </p>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportProject}
                      className="hidden"
                    />
                    <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium">
                      Выбрать файл
                    </div>
                  </label>
                </div>
              </div>

              {(datasets.length > 0 || dashboards.length > 0) && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Быстрый доступ
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {datasets.length > 0 && (
                      <button
                        onClick={() => setMainView('datasets')}
                        className="p-4 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors text-left"
                      >
                        <Database className="w-6 h-6 text-pink-600 mb-2" />
                        <p className="font-semibold text-gray-800">
                          {datasets.length} датасет(ов)
                        </p>
                      </button>
                    )}
                    {dashboards.length > 0 && (
                      <button
                        onClick={() => setMainView('dashboards')}
                        className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-left"
                      >
                        <Layout className="w-6 h-6 text-blue-600 mb-2" />
                        <p className="font-semibold text-gray-800">
                          {dashboards.length} дашборд(ов)
                        </p>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* DATASETS VIEW */}
        {mainView === 'datasets' && !activeDataset && (
          <DatasetManager
            datasets={datasets}
            onSelectDataset={setActiveDatasetId}
            onDeleteDataset={handleDeleteDataset}
            onRenameDataset={handleRenameDataset}
            onFileLoad={handleFileLoad}
          />
        )}

        {/* ACTIVE DATASET VIEW */}
        {mainView === 'datasets' && activeDataset && (
          <div>
            {/* Навигация внутри датасета */}
            <div className="bg-white border-b border-gray-200">
              <div className="container mx-auto px-4">
                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-4">
                    <button
                      onClick={() => setActiveDatasetId(null)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      ← Назад
                    </button>
                    <div>
                      <h2 className="font-bold text-gray-800">
                        {activeDataset.name}
                      </h2>
                      <p className="text-sm text-gray-500">
                        {activeDataset.data.length} строк
                      </p>
                    </div>
                  </div>

                  <nav className="flex space-x-1">
                    {['table', 'charts', 'map'].map((view) => (
                      <button
                        key={view}
                        onClick={() => setDatasetView(view)}
                        disabled={view === 'map' && !activeDataset.hasMap}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          datasetView === view
                            ? 'bg-pink-100 text-pink-700'
                            : 'text-gray-600 hover:bg-gray-100'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {view === 'table' && 'Таблица'}
                        {view === 'charts' && `Графики (${activeDataset.charts.length})`}
                        {view === 'map' && 'Карта'}
                      </button>
                    ))}
                  </nav>
                </div>
              </div>
            </div>

            {/* Контент датасета */}
            <div className="container mx-auto px-4 py-8">
              {datasetView === 'table' && (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="lg:col-span-1">
                    <FilterPanel
                      dataTypes={activeDataset.dataTypes}
                      data={activeDataset.data}
                      onFilterChange={handleFilterChange}
                    />
                  </div>
                  <div className="lg:col-span-3">
                    <DataPreview
                      data={activeDataset.filteredData || activeDataset.data}
                      settings={{ tableSettings: { rowsPerPage: 25, striped: true } }}
                    />
                  </div>
                </div>
              )}

              {datasetView === 'charts' && (
                <div className="space-y-6">
                  <ChartBuilder
                    dataTypes={activeDataset.dataTypes}
                    onChartConfig={handleChartConfig}
                  />

                  {activeDataset.charts.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {activeDataset.charts.map((chart) => (
                        <ChartRenderer
                          key={chart.id}
                          data={activeDataset.filteredData || activeDataset.data}
                          config={chart}
                          settings={{ chartColors: ['#ec4899', '#3b82f6', '#10b981'] }}
                          onRemove={() => handleRemoveChart(chart.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                      <p className="text-gray-500">
                        Графики ещё не созданы. Используйте конструктор выше.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {datasetView === 'map' && activeDataset.hasMap && (
                <MapView
                  data={activeDataset.data}
                  dataTypes={activeDataset.dataTypes}
                  filteredData={activeDataset.filteredData}
                />
              )}
            </div>
          </div>
        )}

        {/* DASHBOARDS VIEW */}
        {mainView === 'dashboards' && !activeDashboard && (
          <DashboardList
            dashboards={dashboards}
            onCreateDashboard={handleCreateDashboard}
            onOpenDashboard={handleOpenDashboard}
            onDeleteDashboard={handleDeleteDashboard}
            onDuplicateDashboard={handleDuplicateDashboard}
          />
        )}

        {/* SETTINGS */}
        {mainView === 'settings' && (
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Глобальные настройки
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Цветовая тема
                  </label>
                  <select
                    value={globalSettings.theme}
                    onChange={(e) => setGlobalSettings(prev => ({ ...prev, theme: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="sakura-pink">Sakura Pink</option>
                    <option value="ocean-blue">Ocean Blue</option>
                    <option value="forest-green">Forest Green</option>
                  </select>
                </div>

                <div>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={globalSettings.autoSave}
                      onChange={(e) => setGlobalSettings(prev => ({ ...prev, autoSave: e.target.checked }))}
                      className="w-4 h-4 text-pink-600 rounded"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Включить автосохранение (каждые 30 сек)
                    </span>
                  </label>
                </div>

                <div className="pt-6 border-t">
                  <h3 className="font-semibold text-gray-800 mb-4">
                    Статистика проекта
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-pink-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Датасетов</p>
                      <p className="text-2xl font-bold text-pink-600">{datasets.length}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Дашбордов</p>
                      <p className="text-2xl font-bold text-blue-600">{dashboards.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;