'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Calendar, ChevronLeft, ChevronRight, Plus, Clock } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/config/api';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const EVENT_COLORS = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Orange', value: '#f97316' },
];

export default function CalendarPage() {
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [events, setEvents] = useState<any[]>([
    {
      id: '1',
      title: 'Sprint Planning',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString().split('T')[0],
      color: '#3b82f6',
      time: '10:00 AM',
      description: 'Sprint 2 planning meeting',
    },
    {
      id: '2',
      title: 'Code Review',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 3).toISOString().split('T')[0],
      color: '#22c55e',
      time: '2:00 PM',
      description: 'Weekly code review session',
    },
    {
      id: '3',
      title: 'Team Standup',
      date: new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().split('T')[0],
      color: '#8b5cf6',
      time: '9:00 AM',
      description: 'Daily standup',
    },
  ]);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '09:00',
    color: '#3b82f6',
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const getEventsForDate = (day: number) => {
    const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    return events.filter((e) => e.date === dateStr);
  };

  const handleDayClick = (day: number) => {
    const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
    setSelectedDate(dateStr);
    setForm({ ...form, date: dateStr });
    setShowCreate(true);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvent = {
      id: Date.now().toString(),
      ...form,
      time: form.time || '09:00 AM',
    };
    setEvents([...events, newEvent]);
    setShowCreate(false);
    setForm({ title: '', description: '', date: '', time: '09:00', color: '#3b82f6' });
    toast.success('Event created!');
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter((e) => e.id !== id));
    toast.success('Event deleted');
  };

  const todayStr = today.toISOString().split('T')[0];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Calendar className="w-7 h-7" /> Calendar
          </h1>
          <p className="text-muted-foreground">Manage your schedule and events</p>
        </div>
        <Button onClick={() => { setForm({ ...form, date: todayStr }); setShowCreate(true); }}>
          <Plus className="w-4 h-4 mr-2" /> New Event
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">{MONTHS[month]} {year}</h2>
              <div className="flex gap-2">
                <button onClick={prevMonth} className="p-1.5 rounded-lg hover:bg-accent">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1))}
                  className="px-3 py-1 text-sm rounded-lg hover:bg-accent"
                >
                  Today
                </button>
                <button onClick={nextMonth} className="p-1.5 rounded-lg hover:bg-accent">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7">
              {DAYS.map((day) => (
                <div key={day} className="p-3 text-center text-xs font-medium text-muted-foreground border-b">
                  {day}
                </div>
              ))}

              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={'empty-' + i} className="p-2 h-24 border-b border-r bg-muted/20" />
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const dateStr = year + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
                const dayEvents = getEventsForDate(day);
                const isToday = dateStr === todayStr;

                return (
                  <div
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={'p-2 h-24 border-b border-r cursor-pointer hover:bg-muted/30 transition ' + (isToday ? 'bg-primary/5' : '')}
                  >
                    <div className={'text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ' + (isToday ? 'bg-primary text-primary-foreground' : '')}>
                      {day}
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className="text-xs px-1.5 py-0.5 rounded text-white truncate"
                          style={{ backgroundColor: event.color }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground pl-1">+{dayEvents.length - 2} more</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-4">
            <h3 className="font-semibold mb-3">Upcoming Events</h3>
            <div className="space-y-3">
              {events
                .filter((e) => e.date >= todayStr)
                .sort((a, b) => a.date.localeCompare(b.date))
                .slice(0, 5)
                .map((event) => (
                  <div key={event.id} className="flex items-start gap-2 group">
                    <div className="w-3 h-3 rounded-full mt-1 flex-shrink-0" style={{ backgroundColor: event.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{event.title}</p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {event.date} {event.time && 'at ' + event.time}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive"
                    >
                      ×
                    </button>
                  </div>
                ))}
              {events.filter((e) => e.date >= todayStr).length === 0 && (
                <p className="text-sm text-muted-foreground">No upcoming events</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Event">
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <Input
            label="Event Title *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Sprint Planning, Code Review..."
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Date *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Time</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 rounded-md border bg-background text-sm min-h-[60px] focus:ring-2 focus:ring-primary outline-none"
              placeholder="Event details..."
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Color</label>
            <div className="flex gap-2">
              {EVENT_COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setForm({ ...form, color: c.value })}
                  className={'w-8 h-8 rounded-full border-2 transition ' + (form.color === c.value ? 'border-foreground scale-110' : 'border-transparent')}
                  style={{ backgroundColor: c.value }}
                  title={c.name}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" type="button" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit">Create Event</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}