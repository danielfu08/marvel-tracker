import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Grid3x3, List } from 'lucide-react';
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
      : 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="container py-6">
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🎬</span>
              </div>
              <h1 className="text-3xl font-bold text-white">Maratón 2025</h1>
            </div>
            <p className="text-zinc-400">Multiverso Marvel</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
              <div className="text-sm text-zinc-500 mb-1">Total de títulos</div>
              <div className="text-2xl font-bold text-white">{stats.total}</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
              <div className="text-sm text-zinc-500 mb-1">Vistos</div>
              <div className="text-2xl font-bold text-emerald-400">{stats.watched}</div>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
              <div className="text-sm text-zinc-500 mb-1">Calificación promedio</div>
              <div className="text-2xl font-bold text-yellow-400">{stats.avgRating}/5</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                placeholder="Buscar película o serie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-zinc-900 border-zinc-800 text-white placeholder:text-zinc-600"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Select value={selectedSaga} onValueChange={setSelectedSaga}>
                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
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
                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
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
                <SelectTrigger className="bg-zinc-900 border-zinc-800 text-white">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  {types.map(type => (
                    <SelectItem key={type} value={type} className="text-white">
                      {type === 'all' ? 'Todos' : type}
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

      {/* Content Grid/List */}
      <main className="container py-8">
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
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
