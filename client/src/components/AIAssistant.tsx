import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Send, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface Content {
  id: string;
  title: string;
  saga: string;
  watched: boolean;
  rating: number;
}

interface AIAssistantProps {
  contents: Content[];
}

const suggestedQuestions = [
  '¿Cuál es mi saga favorita?',
  '¿Cuándo terminaré el maratón?',
  '¿Qué me recomiendas ver siguiente?',
  '¿Cuál es mi calificación promedio?'
];

export default function AIAssistant({ contents }: AIAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Calculate statistics from contents
  const calculateStats = () => {
    const watched = contents.filter(c => c.watched);
    const ratings = watched.filter(c => c.rating > 0).map(c => c.rating);
    const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 0;
    
    const sagaCounts: Record<string, number> = {};
    const sagaWatched: Record<string, number> = {};
    
    contents.forEach(c => {
      sagaCounts[c.saga] = (sagaCounts[c.saga] || 0) + 1;
      if (c.watched) {
        sagaWatched[c.saga] = (sagaWatched[c.saga] || 0) + 1;
      }
    });

    const favoriteSaga = Object.entries(sagaWatched).sort((a, b) => b[1] - a[1])[0];
    const remainingTitles = contents.length - watched.length;

    return {
      totalTitles: contents.length,
      watchedTitles: watched.length,
      remainingTitles,
      avgRating,
      favoriteSaga: favoriteSaga ? favoriteSaga[0] : 'N/A',
      favoriteSagaCount: favoriteSaga ? favoriteSaga[1] : 0,
      sagaCounts,
      sagaWatched,
      percentageComplete: ((watched.length / contents.length) * 100).toFixed(1)
    };
  };

  const generateResponse = (question: string): string => {
    const stats = calculateStats();
    const lowerQuestion = question.toLowerCase();

    // Favorite saga
    if (lowerQuestion.includes('saga favorita') || lowerQuestion.includes('saga que más')) {
      if (stats.favoriteSagaCount === 0) {
        return `Aún no has visto películas de ninguna saga. ¡Comienza tu maratón Marvel ahora! 🎬`;
      }
      return `Tu saga favorita es **${stats.favoriteSaga}** con ${stats.favoriteSagaCount} títulos vistos. ¡Excelente elección! 🎯`;
    }

    // When will I finish
    if (lowerQuestion.includes('terminar') || lowerQuestion.includes('cuándo') || lowerQuestion.includes('cuanto tiempo')) {
      if (stats.remainingTitles === 0) {
        return `¡Felicidades! 🎉 Ya has completado el maratón Marvel con ${stats.watchedTitles} títulos vistos. ¡Eres un verdadero fan!`;
      }
      const avgPerWeek = 3; // Assumption
      const weeksRemaining = Math.ceil(stats.remainingTitles / avgPerWeek);
      return `Te quedan **${stats.remainingTitles} títulos** por ver. Si ves aproximadamente 3 por semana, terminarías en **${weeksRemaining} semanas**. ¡Tú puedes! 💪`;
    }

    // What to watch next
    if (lowerQuestion.includes('recomienda') || lowerQuestion.includes('siguiente') || lowerQuestion.includes('qué ver')) {
      const unwatched = contents.filter(c => !c.watched);
      if (unwatched.length === 0) {
        return `¡Ya has visto todo! 🏆 Considera ver nuevamente tus favoritas o explorar otros universos Marvel.`;
      }
      const randomTitle = unwatched[Math.floor(Math.random() * unwatched.length)];
      return `Te recomiendo ver **${randomTitle.title}** de la saga **${randomTitle.saga}**. ¡Debería ser increíble! 🍿`;
    }

    // Average rating
    if (lowerQuestion.includes('calificación') || lowerQuestion.includes('promedio') || lowerQuestion.includes('rating')) {
      if (stats.avgRating === 0) {
        return `Aún no has calificado ninguna película. ¡Empieza a calificar para obtener estadísticas personalizadas! ⭐`;
      }
      return `Tu calificación promedio es **${stats.avgRating}/5**. ${Number(stats.avgRating) >= 4 ? '¡Buen gusto! 👏' : 'Parece que eres selectivo con tus películas. 🎬'}`;
    }

    // Progress
    if (lowerQuestion.includes('progreso') || lowerQuestion.includes('avance') || lowerQuestion.includes('completado')) {
      return `Has completado **${stats.percentageComplete}%** del maratón Marvel. 📊\n\n**Estadísticas:**\n- Títulos vistos: ${stats.watchedTitles}/${stats.totalTitles}\n- Calificación promedio: ${stats.avgRating}/5\n- Saga favorita: ${stats.favoriteSaga}`;
    }

    // General statistics
    if (lowerQuestion.includes('estadísticas') || lowerQuestion.includes('stats') || lowerQuestion.includes('datos')) {
      const sagaList = Object.entries(stats.sagaWatched)
        .map(([saga, count]) => `- ${saga}: ${count}/${stats.sagaCounts[saga]}`)
        .join('\n');
      
      return `**Tu Progreso en el Maratón Marvel:**\n\n${sagaList}\n\n**Resumen:**\n- Total visto: ${stats.watchedTitles}/${stats.totalTitles}\n- Progreso: ${stats.percentageComplete}%\n- Calificación promedio: ${stats.avgRating}/5`;
    }

    // Default response
    return `Soy tu Asistente IA del Maratón Marvel. Puedo ayudarte con:\n\n• ¿Cuál es mi saga favorita?\n• ¿Cuándo terminaré el maratón?\n• ¿Qué me recomiendas ver siguiente?\n• ¿Cuál es mi calificación promedio?\n• Mis estadísticas\n\n¿Qué quieres saber? 🎬`;
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const response = generateResponse(text);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'assistant',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 500);
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-full shadow-lg flex items-center justify-center z-40 transition-all duration-300"
      >
        <Sparkles className="w-6 h-6" />
      </motion.button>

      {/* Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-6 w-96 h-[600px] bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-white" />
                <h2 className="text-white font-bold">Asistente IA del Maratón</h2>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-purple-700 p-1 rounded transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center">
                  <Sparkles className="w-12 h-12 text-purple-600 mb-3 opacity-50" />
                  <p className="text-zinc-400 text-sm mb-4">Pregúntame lo que quieras sobre tu maratón Marvel</p>
                  <div className="space-y-2 w-full px-2">
                    {suggestedQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleSuggestedQuestion(q)}
                        className="w-full text-left p-2 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs transition-colors"
                      >
                        • {q}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((msg) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-4 py-2 rounded-lg ${
                          msg.sender === 'user'
                            ? 'bg-purple-600 text-white rounded-br-none'
                            : 'bg-zinc-800 text-zinc-100 rounded-bl-none'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">
                          {msg.text.split('\n').map((line, i) => (
                            <React.Fragment key={i}>
                              {line.replace(/\*\*(.*?)\*\*/g, (_, text) => text)}
                              {i < msg.text.split('\n').length - 1 && <br />}
                            </React.Fragment>
                          ))}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="bg-zinc-800 text-zinc-100 px-4 py-2 rounded-lg rounded-bl-none">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-purple-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input Area */}
            <div className="border-t border-zinc-800 p-4 bg-zinc-950">
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !isLoading) {
                      handleSendMessage(input);
                    }
                  }}
                  placeholder="Pregunta algo sobre tu maratón..."
                  className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500 text-sm"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => handleSendMessage(input)}
                  disabled={isLoading || !input.trim()}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3"
                  size="sm"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
