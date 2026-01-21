import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Star, Check, X, Calendar, MessageSquare, ExternalLink } from 'lucide-react';
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
  content: Content | null;
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
  const [rating, setRating] = useState(content?.rating || 0);
  const [comment, setComment] = useState(content?.comment || '');
  const [isEditingComment, setIsEditingComment] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    content?.scheduled_date ? new Date(content.scheduled_date) : undefined
  );

  if (!content) return null;

  const handleWatchedToggle = () => {
    onUpdate(content.id, { watched: !content.watched });
  };

  const handleRatingChange = (value: number) => {
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
      <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-800 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white text-2xl">{content.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Poster and Basic Info */}
          <div className="flex gap-6">
            <img
              src={content.image_url}
              alt={content.title}
              className={`w-32 h-48 object-cover rounded-lg flex-shrink-0 ${content.watched ? 'opacity-60' : ''}`}
            />
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge className={`${sagaColors[content.saga] || 'bg-gray-600'} text-white`}>
                  {content.saga}
                </Badge>
                <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                  {content.content_type}
                </Badge>
                <Badge variant="outline" className="border-zinc-700 text-zinc-400">
                  {content.universe}
                </Badge>
              </div>

              <div>
                <p className="text-sm text-zinc-400 mb-2">Sinopsis</p>
                <p className="text-sm text-zinc-300">{content.synopsis}</p>
              </div>

              {content.comment && (
                <div>
                  <p className="text-sm text-zinc-400 mb-2">Tu comentario</p>
                  <p className="text-sm text-zinc-300 italic">{content.comment}</p>
                </div>
              )}
            </div>
          </div>

          {/* Rating */}
          <div>
            <p className="text-sm text-zinc-400 mb-3">Calificación</p>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRatingChange(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-6 h-6 ${
                      star <= rating
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

          {/* Actions */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant={content.watched ? 'default' : 'outline'}
                onClick={handleWatchedToggle}
                className="w-full"
              >
                <Check className="w-4 h-4 mr-2" />
                {content.watched ? 'Marcado como visto' : 'Marcar como visto'}
              </Button>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full">
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
            </div>

            {selectedDate && (
              <Button
                onClick={handleCalendarClick}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Añadir a Google Calendar
              </Button>
            )}

            <Button
              variant="outline"
              onClick={() => setIsEditingComment(!isEditingComment)}
              className="w-full"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              {isEditingComment ? 'Cancelar comentario' : 'Añadir comentario'}
            </Button>

            {isEditingComment && (
              <div className="space-y-2">
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Escribe tu comentario..."
                  className="bg-zinc-800 border-zinc-700 text-white"
                  rows={4}
                />
                <Button onClick={handleCommentSave} className="w-full">
                  Guardar comentario
                </Button>
              </div>
            )}
          </div>

          {/* Close Button */}
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            <X className="w-4 h-4 mr-2" />
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
