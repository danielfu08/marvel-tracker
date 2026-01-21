import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Calendar, MessageSquare, Check, CalendarX2, CalendarCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';

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

interface ContentCardProps {
  content: Content;
  onUpdate: (id: string, updates: Partial<Content>) => void;
  viewMode?: 'grid' | 'list';
}

const sagaColors: Record<string, string> = {
  'MCU': 'bg-red-600',
  'X-Men': 'bg-yellow-500',
  'Spider-Man Sony': 'bg-blue-600',
  'Spider-Verse': 'bg-purple-600',
  'Blade': 'bg-zinc-700',
  'Fantastic Four': 'bg-sky-500',
  'Otros': 'bg-gray-600'
};

export default function ContentCard({ content, onUpdate, viewMode = 'grid' }: ContentCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [comment, setComment] = useState(content.comment || '');
  const [rating, setRating] = useState(content.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    content.scheduled_date ? new Date(content.scheduled_date) : undefined
  );

  const handleWatchedToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(content.id, { watched: !content.watched });
  };

  const handleRatingClick = (value: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setRating(value);
    onUpdate(content.id, { rating: value });
  };

  const handleCommentSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdate(content.id, { comment });
    setIsEditing(false);
  };

  const handleDateChange = (date: Date | undefined, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (date) {
      setSelectedDate(date);
      const dateStr = date.toISOString().split('T')[0];
      onUpdate(content.id, { scheduled_date: dateStr });
    }
  };

  const handleCalendarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedDate) {
      const startDate = new Date(selectedDate);
      startDate.setHours(20, 0, 0, 0);
      const endDate = new Date(startDate);
      endDate.setHours(22, 0, 0, 0);

      const formatDateForGoogle = (date: Date) => {
        return date.toISOString().replace(/-|:|\.\d\d\d/g, '');
      };

      const details = `Maratón Marvel - ${content.saga}\n${content.content_type}\n\n${comment || ''}`;
      const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: `🎬 ${content.title}`,
        dates: `${formatDateForGoogle(startDate)}/${formatDateForGoogle(endDate)}`,
        details: details,
        location: 'Maratón Marvel'
      });

      window.open(`https://calendar.google.com/calendar/render?${params.toString()}`, '_blank');
    }
  };

  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className={`overflow-hidden bg-zinc-900/50 border-2 border-dashed border-red-900/40 hover:border-red-700/60 transition-all duration-300 ${content.watched ? 'ring-2 ring-emerald-500/30' : ''}`}>
          <div className="flex items-center gap-4 p-4">
            <img
              src={content.image_url}
              alt={content.title}
              className={`w-20 h-28 object-cover rounded-lg flex-shrink-0 ${content.watched ? 'opacity-60' : ''}`}
            />
            <div className="flex-1 min-w-0">
              <h3 className={`font-bold text-white mb-1 ${content.watched ? 'line-through opacity-60' : ''}`}>
                {content.title}
              </h3>
              <p className="text-xs text-zinc-400 mb-2 line-clamp-1">{content.synopsis}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline" className="text-[10px] border-zinc-700 text-zinc-400">
                  {content.content_type}
                </Badge>
                <Badge className={`text-[10px] text-white ${sagaColors[content.saga] || 'bg-gray-600'}`}>
                  {content.saga}
                </Badge>
              </div>
            </div>
            <div className="flex flex-col gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant={content.watched ? 'default' : 'outline'}
                onClick={handleWatchedToggle}
                className="h-7 text-xs"
              >
                <Check className="w-3 h-3" />
              </Button>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={(e) => handleRatingClick(star, e)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <Star
                      className={`w-3 h-3 ${
                        star <= (hoverRating || rating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-zinc-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  }

  // Grid view - Image on left, content on right
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <Card className={`overflow-hidden bg-zinc-900/50 border-2 border-dashed border-red-900/40 hover:border-red-700/60 transition-all duration-300 cursor-pointer flex flex-row h-full ${content.watched ? 'ring-2 ring-emerald-500/30' : ''}`}>
        {/* Poster - Left Side */}
        <div className="relative w-56 h-72 flex-shrink-0 overflow-hidden bg-zinc-800">
          <img
            src={content.image_url}
            alt={content.title}
            className={`w-full h-full object-cover ${content.watched ? 'opacity-60' : ''}`}
          />
          {content.watched && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <div className="bg-emerald-500 rounded-full p-3">
                <Check className="w-8 h-8 text-white" />
              </div>
            </div>
          )}
        </div>

        {/* Content - Right Side */}
        <div className="p-5 flex flex-col justify-between flex-1 min-w-0">
          {/* Header with Saga Badge */}
          <div>
            <Badge className={`${sagaColors[content.saga] || 'bg-gray-600'} text-white text-[10px] px-2 mb-2 inline-block`}>
              {content.saga}
            </Badge>
            
            <h3 className={`font-bold text-white text-base leading-tight mb-3 line-clamp-2 ${content.watched ? 'line-through opacity-60' : ''}`}>
              {content.title}
            </h3>

            <p className="text-sm text-zinc-400 mb-3 line-clamp-3">
              {content.synopsis}
            </p>

            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge variant="outline" className="text-[9px] border-zinc-700 text-zinc-400 px-2 py-1">
                {content.content_type}
              </Badge>
              <Badge variant="outline" className="text-[9px] border-zinc-700 text-zinc-400 px-2 py-1">
                {content.universe}
              </Badge>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={(e) => handleRatingClick(star, e)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-4 h-4 ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-zinc-600'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="text-sm text-zinc-500 ml-2">{rating}/5</span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap text-xs" onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              variant={content.watched ? 'default' : 'outline'}
              onClick={handleWatchedToggle}
              className="h-7 text-xs px-3" style={{color: '#ffffff'}}
            >
              <Check className="w-3 h-3 mr-1" />
              {content.watched ? 'Visto' : 'Marcar'}
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs px-3 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300">
                  <Calendar className="w-3 h-3 mr-1" />
                  Fecha
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-800" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => handleDateChange(date)}
                  className="bg-zinc-900"
                />
              </PopoverContent>
            </Popover>

            <Dialog open={isEditing} onOpenChange={setIsEditing}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-xs px-3 bg-zinc-800 border-zinc-700 hover:bg-zinc-700 text-zinc-300">
                  <MessageSquare className="w-3 h-3 mr-1" />
                  Comentario
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-zinc-900 border-zinc-800">
                <DialogHeader>
                  <DialogTitle className="text-white">Comentario</DialogTitle>
                </DialogHeader>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Escribe tu comentario..."
                  className="bg-zinc-800 border-zinc-700 text-white text-xs"
                  rows={3}
                />
                <Button onClick={handleCommentSave} className="w-full text-xs h-7">
                  Guardar
                </Button>
              </DialogContent>
            </Dialog>

            {selectedDate && (
              <Button
                size="sm"
                onClick={handleCalendarClick}
                className="h-7 text-xs px-3 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <CalendarX2 className="w-3 h-3 mr-1" />
                Calendar
              </Button>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
