import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Grid3x3, List, TrendingUp } from 'lucide-react';
import ContentCard from '@/components/ContentCard';
import ContentDetailDialog from '@/components/ContentDetailDialog';

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

  // Load data from JSON
  useEffect(() => {
    fetch('/data.json')
      .then(res => res.json())
      .then(data => setContents(data))
      .catch(err => console.error('Error loading data:', err));
  }, []);

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

  const universeStats = useMemo(() => {
    const stats: Record<string, number> = {};
    contents.forEach(c => {
      stats[c.universe] = (stats[c.universe] || 0) + 1;
    });
    return stats;
  }, [contents]);

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Header */}
      <header className="border-b border-red-900/30 bg-gradient-to-b from-red-950/20 to-transparent">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <span className="text-xs font-semibold text-red-500 tracking-widest">🎬 Maratón 2025</span>
            </div>
            <h1 className="text-5xl font-bold mb-2">
              <span className="text-white">Multiverso </span>
              <span className="text-red-600">Marvel</span>
            </h1>
            <p className="text-zinc-400 text-sm">Tu guía completa para el maratón definitivo del universo Marvel</p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-3 mb-8">
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white border border-red-500/50"
              variant="outline"
            >
              <span className="mr-2">+</span> Añadir contenido
            </Button>
            <Button 
              className="bg-yellow-600 hover:bg-yellow-700 text-white border border-yellow-500/50"
              variant="outline"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Estadísticas
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
              <Input
                placeholder="Buscar película o serie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-zinc-900/50 border-zinc-800 text-white placeholder:text-zinc-600 focus:border-red-500/50"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Select value={selectedSaga} onValueChange={setSelectedSaga}>
                <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-white">
                  <SelectValue placeholder="Todas las Sagas" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  {sagas.map(saga => (
                    <SelectItem key={saga} value={saga} className="text-white">
                      {saga === 'all' ? 'Todas las Sagas' : saga}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedUniverse} onValueChange={setSelectedUniverse}>
                <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-white">
                  <SelectValue placeholder="Todos los Universos" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  {universes.map(universe => (
                    <SelectItem key={universe} value={universe} className="text-white">
                      {universe === 'all' ? 'Todos los Universos' : universe}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-white">
                  <SelectValue placeholder="Todas" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  {types.map(type => (
                    <SelectItem key={type} value={type} className="text-white">
                      {type === 'all' ? 'Todas' : type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

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
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 flex gap-6">
        {/* Sidebar */}
        <aside className="w-48 flex-shrink-0">
          <div className="sticky top-8 space-y-6">
            {/* Progress */}
            <div className="bg-red-950/30 border border-red-900/30 rounded-lg p-4">
              <div className="flex items-start gap-3 mb-4">
                <div className="text-2xl">📊</div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Progreso del Maratón</h3>
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stats.watchedPercent}%</div>
              <div className="text-xs text-zinc-400 mb-4">de {stats.total} títulos</div>
              
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>📁 Películas</span>
                  <span className="text-white font-semibold">75</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>📅 Géneros</span>
                  <span className="text-white font-semibold">20</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>⭐ Media</span>
                  <span className="text-yellow-400 font-semibold">{stats.avgRating}/5</span>
                </div>
              </div>
            </div>

            {/* Por Saga */}
            <div>
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Por Saga</h3>
              <div className="space-y-2">
                {Object.entries(sagaStats).map(([saga, count]) => (
                  <button
                    key={saga}
                    onClick={() => setSelectedSaga(saga)}
                    className={`w-full text-left text-xs px-3 py-2 rounded transition-colors ${
                      selectedSaga === saga
                        ? 'bg-red-600 text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    <span className="font-medium">{saga}</span>
                    <span className="float-right text-zinc-500">{count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Por Universo */}
            <div>
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Por Universo</h3>
              <div className="space-y-2">
                {Object.entries(universeStats).slice(0, 5).map(([universe, count]) => (
                  <button
                    key={universe}
                    onClick={() => setSelectedUniverse(universe)}
                    className={`w-full text-left text-xs px-3 py-2 rounded transition-colors ${
                      selectedUniverse === universe
                        ? 'bg-red-600 text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                    }`}
                  >
                    <span className="font-medium">{universe}</span>
                    <span className="float-right text-zinc-500">{count}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Content Grid */}
        <main className="flex-1">
          <div className="mb-4 text-sm text-zinc-400">
            <span className="font-semibold text-white">{filteredContents.length}</span> títulos
            {filteredContents.length !== contents.length && (
              <span> • <span className="text-white font-semibold">1</span> vistos</span>
            )}
          </div>

          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-2 lg:grid-cols-3 gap-4' 
            : 'flex flex-col gap-3'
          }>
            <AnimatePresence>
              {filteredContents.map((content, index) => (
                <motion.div
                  key={content.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => handleOpenDetail(content)}
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
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-zinc-500 text-center">
                <p className="text-lg mb-2">No se encontraron resultados</p>
                <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Detail Dialog */}
      {selectedContent && (
        <ContentDetailDialog
          content={selectedContent}
          isOpen={isDetailOpen}
          onOpenChange={setIsDetailOpen}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}
