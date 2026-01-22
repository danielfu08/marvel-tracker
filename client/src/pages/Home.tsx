import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Grid3x3, List, TrendingUp, Sparkles } from 'lucide-react';
import ContentCard from '@/components/ContentCard';
import ContentDetailDialog from '@/components/ContentDetailDialog';
import AIAssistant from '@/components/AIAssistant';

interface Content {
  id: string;
  title: string;
  saga: string;
  synopsis: string;
  image_url: string;
  content_type: string;
  universe: string;
  rating: number;
  comment: string;
  scheduled_date: string;
  watched: boolean;
}

export default function Home() {
  const [contents, setContents] = useState<Content[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSaga, setSelectedSaga] = useState('all');
  const [selectedUniverse, setSelectedUniverse] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Load data from JSON and localStorage
  useEffect(() => {
    fetch('/data.json')
      .then(res => res.json())
      .then(data => {
        // Load saved progress from localStorage
        const savedProgress = localStorage.getItem('marvelTrackerProgress');
        if (savedProgress) {
          const progressMap = JSON.parse(savedProgress);
          const mergedData = data.map((item: Content) => ({
            ...item,
            ...(progressMap[item.id] || {})
          }));
          setContents(mergedData);
        } else {
          setContents(data);
        }
      })
      .catch(err => console.error('Error loading data:', err));
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (contents.length > 0) {
      const progressMap: Record<string, Partial<Content>> = {};
      contents.forEach(item => {
        progressMap[item.id] = {
          watched: item.watched,
          rating: item.rating,
          comment: item.comment,
          scheduled_date: item.scheduled_date
        };
      });
      localStorage.setItem('marvelTrackerProgress', JSON.stringify(progressMap));
    }
  }, [contents]);

  // Get unique values for filters
  const sagas = useMemo(() => {
    const unique = new Set(contents.map(c => c.saga));
    return ['all', ...Array.from(unique)];
  }, [contents]);
  
  const universes = useMemo(() => {
    const unique = new Set(contents.map(c => c.universe));
    return ['all', ...Array.from(unique)];
  }, [contents]);
  
  const types = useMemo(() => {
    const unique = new Set(contents.map(c => c.content_type));
    return ['all', ...Array.from(unique)];
  }, [contents]);

  // Filter contents
  const filteredContents = useMemo(() => {
    return contents.filter(content => {
      const matchesSearch = content.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSaga = selectedSaga === 'all' || content.saga === selectedSaga;
      const matchesUniverse = selectedUniverse === 'all' || content.universe === selectedUniverse;
      const matchesType = selectedType === 'all' || content.content_type === selectedType;
      return matchesSearch && matchesSaga && matchesUniverse && matchesType;
    });
  }, [contents, searchTerm, selectedSaga, selectedUniverse, selectedType]);

  const handleUpdate = (id: string, updates: Partial<Content>) => {
    setContents(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    if (selectedContent?.id === id) {
      setSelectedContent(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const handleOpenDetail = (content: Content) => {
    setSelectedContent(content);
    setIsDetailOpen(true);
  };

  const stats = {
    total: contents.length,
    watched: contents.filter(c => c.watched).length,
    avgRating: contents.filter(c => c.rating > 0).length > 0
      ? (contents.reduce((sum, c) => sum + c.rating, 0) / contents.filter(c => c.rating > 0).length).toFixed(1)
      : 0,
    watchedPercent: contents.length > 0 ? Math.round((contents.filter(c => c.watched).length / contents.length) * 100) : 0
  };

  // Group contents by saga for sidebar
  const sagaStats = useMemo(() => {
    const stats: Record<string, number> = {};
    contents.forEach(c => {
      stats[c.saga] = (stats[c.saga] || 0) + 1;
    });
    return stats;
  }, [contents]);

  const sagaColors: Record<string, string> = {
    'MCU': 'bg-red-600',
    'X-Men': 'bg-yellow-600',
    'Fantastic Four': 'bg-blue-600',
    'Spider-Man': 'bg-red-700',
    'Deadpool': 'bg-red-900',
    'Blade': 'bg-gray-900',
    'Ghost Rider': 'bg-orange-700',
    'Punisher': 'bg-gray-700',
    'Defenders': 'bg-purple-600',
    'Inhumans': 'bg-indigo-600',
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 w-64 h-screen bg-gray-900 border-r border-red-900/30 p-6 overflow-y-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-red-600 mb-6">Progreso del Maratón</h2>
          
          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Total de títulos</div>
              <div className="text-3xl font-bold text-white">{stats.total}</div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Vistos</div>
              <div className="text-3xl font-bold text-green-500">{stats.watched}</div>
              <div className="text-xs text-gray-500 mt-1">{stats.watchedPercent}% completado</div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="text-sm text-gray-400 mb-1">Calificación promedio</div>
              <div className="text-3xl font-bold text-yellow-500">{stats.avgRating}/5</div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-300">Por Saga</h3>
          <div className="space-y-2">
            {Object.entries(sagaStats).map(([saga, count]) => (
              <div key={saga} className="flex items-center justify-between text-sm">
                <span className="text-gray-400">{saga}</span>
                <span className={`${sagaColors[saga] || 'bg-gray-700'} text-white px-2 py-1 rounded text-xs`}>
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64">
        {/* Header */}
        <header className="bg-gray-900 border-b border-red-900/30 p-6">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold text-center text-red-600 mb-8">
              🎬 Multiverso Marvel
            </h1>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center mb-8">
              <Button className="bg-red-600 hover:bg-red-700 text-white border border-red-500/50">
                ➕ Añadir contenido
              </Button>
              <Button className="bg-yellow-600 hover:bg-yellow-700 text-white border border-yellow-500/50">
                <TrendingUp className="w-4 h-4 mr-2" />
                Estadísticas
              </Button>
            </div>

            {/* Search and Filters */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                <Input
                  placeholder="Buscar película o serie..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white placeholder-gray-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Select value={selectedSaga} onValueChange={setSelectedSaga}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Saga" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {sagas.map(saga => (
                      <SelectItem key={saga} value={saga} className="text-white">
                        {saga === 'all' ? 'Todas las sagas' : saga}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedUniverse} onValueChange={setSelectedUniverse}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Universo" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {universes.map(universe => (
                      <SelectItem key={universe} value={universe} className="text-white">
                        {universe === 'all' ? 'Todos los universos' : universe}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                    <SelectValue placeholder="Tipo" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    {types.map(type => (
                      <SelectItem key={type} value={type} className="text-white">
                        {type === 'all' ? 'Todos los tipos' : type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* View Mode Toggle */}
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="flex-1"
                >
                  <Grid3x3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="flex-1"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Grid/List */}
        <div className="p-6">
          <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-6' : 'space-y-4'}>
            <AnimatePresence>
              {filteredContents.map((content, index) => (
                <motion.div
                  key={content.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ContentCard
                    content={content}
                    onUpdate={handleUpdate}
                    viewMode={viewMode}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredContents.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No se encontraron resultados</p>
            </div>
          )}
        </div>
      </main>

      {/* Detail Dialog */}
      {selectedContent && (
        <ContentDetailDialog
          content={selectedContent}
          isOpen={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          onUpdate={handleUpdate}
        />
      )}

      {/* AI Assistant */}
      <AIAssistant contents={contents} />
    </div>
  );
}
