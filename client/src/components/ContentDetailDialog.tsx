import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Star, Check, X, Calendar, MessageSquare, CalendarX2 } from 'lucide-react';
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

interface ContentDetailDialogProps {
  content: Content;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, updates: Partial<Content>) => void;
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

export default function ContentDetailDialog({
  content,
  isOpen,
  onOpenChange,
  onUpdate
}: ContentDetailDialogProps) {
  const [rating, setRating] = useState(content.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(content.comment || '');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    content.scheduled_date ? new Date(content.scheduled_date) : undefined
  );
  const [isEditingComment, setIsEditingComment] = useState(false);

  const handleWatchedToggle = () => {
    onUpdate(content.id, { watched: !content.watched });
  };

  const handleRatingClick = (value: number) => {
    setRating(value);
    onUpdate(content.id, { rating: value });
  };

  const handleCommentSave = () => {
    onUpdate(content.id, { comment });
    setIsEditingComment(false);
  };

  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      const dateStr = date.toISOString().split('T')[0];
      onUpdate(content.id, { scheduled_date: dateStr });
    }
  };

  const handleCalendarClick = () => {
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

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-900 border-zinc-800 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${sagaColors[content.saga] || 'bg-gray-600'} text-white`}>
                  {content.saga}
                </Badge>
                <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-xs">
                  {content.content_type}
                </Badge>
                <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-xs">
                  {content.universe}
                </Badge>
              </div>
              <DialogTitle className="text-white text-2xl">{content.title}</DialogTitle>
            </div>
            <button
              onClick={() => onOpenChange(false)}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Image */}
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-zinc-800">
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

          {/* Synopsis */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-400 mb-2">Sinopsis</h3>
            <p className="text-sm text-zinc-300 leading-relaxed">{content.synopsis}</p>
          </div>

          {/* Rating */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-400 mb-2">Calificación</h3>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRatingClick(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= (hoverRating || rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-zinc-600'
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="text-sm text-zinc-400 ml-2">{rating}/5</span>
              )}
            </div>
          </div>

          {/* Comment */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-400 mb-2">Comentario</h3>
            {isEditingComment ? (
              <div className="space-y-2">
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Escribe tu comentario..."
                  className="bg-zinc-800 border-zinc-700 text-white text-sm"
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleCommentSave}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    Guardar
                  </Button>
                  <Button
                    onClick={() => setIsEditingComment(false)}
                    size="sm"
                    variant="outline"
                    className="border-zinc-700"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => setIsEditingComment(true)}
                className="p-3 bg-zinc-800 rounded-lg border border-zinc-700 cursor-pointer hover:border-zinc-600 transition-colors min-h-12"
              >
                <p className="text-sm text-zinc-300">
                  {comment || <span className="text-zinc-500 italic">Haz clic para añadir un comentario...</span>}
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-4 border-t border-zinc-800">
            <Button
              onClick={handleWatchedToggle}
              variant={content.watched ? 'default' : 'outline'}
              className={content.watched ? 'bg-emerald-600 hover:bg-emerald-700' : 'border-zinc-700'}
            >
              <Check className="w-4 h-4 mr-2" />
              {content.watched ? 'Visto' : 'Marcar como visto'}
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                  <Calendar className="w-4 h-4 mr-2" />
                  Seleccionar fecha
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-800" align="start">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateChange}
                  className="bg-zinc-900"
                />
              </PopoverContent>
            </Popover>

            {selectedDate && (
              <Button
                onClick={handleCalendarClick}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <CalendarX2 className="w-4 h-4 mr-2" />
                Añadir a Google Calendar
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
