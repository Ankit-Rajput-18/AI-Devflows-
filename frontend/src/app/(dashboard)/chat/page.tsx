'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/shared';
import { MessageSquare, Send, Plus, Hash } from 'lucide-react';
import { useAuthStore } from '@/store/slices/authStore';
import { getInitials, timeAgo } from '@/lib/utils';
import { toast } from 'sonner';

export default function ChatPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: roomsData, isLoading: roomsLoading } = useQuery({
    queryKey: ['chat-rooms'],
    queryFn: () => chatApi.getRooms().then((r) => r.data),
  });

  const { data: messagesData, isLoading: msgsLoading } = useQuery({
    queryKey: ['chat-messages', selectedRoom],
    queryFn: () => selectedRoom ? chatApi.getMessages(selectedRoom).then((r) => r.data) : null,
    enabled: !!selectedRoom,
    refetchInterval: 3000,
  });

  const sendMutation = useMutation({
    mutationFn: () => chatApi.sendMessage(selectedRoom!, { content: message }),
    onSuccess: () => {
      setMessage('');
      queryClient.invalidateQueries({ queryKey: ['chat-messages', selectedRoom] });
    },
    onError: () => toast.error('Failed to send message'),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData]);

  const rooms = roomsData?.data || [];
  const messages_list = messagesData?.data || [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedRoom) return;
    sendMutation.mutate();
  };

  return (
    <div className="flex h-[calc(100vh-7rem)] rounded-xl border bg-card overflow-hidden animate-fade-in">
      <div className="w-64 border-r flex flex-col">
        <div className="p-4 border-b">
          <h2 className="font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" /> Chat
          </h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {roomsLoading ? <LoadingSpinner size="sm" /> : (
            rooms.map((room: any) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room.id)}
                className={'w-full p-3 text-left hover:bg-accent transition flex items-center gap-2 ' + (selectedRoom === room.id ? 'bg-accent' : '')}
              >
                <Hash className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium truncate">{room.name}</span>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            <div className="p-4 border-b">
              <h3 className="font-semibold">
                # {rooms.find((r: any) => r.id === selectedRoom)?.name || 'Channel'}
              </h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {msgsLoading ? <LoadingSpinner size="sm" /> : (
                messages_list.map((msg: any) => (
                  <div key={msg.id} className={'flex gap-3 ' + (msg.senderId === user?.id ? 'flex-row-reverse' : '')}>
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
                      {getInitials(msg.sender?.name || 'U')}
                    </div>
                    <div className={msg.senderId === user?.id ? 'text-right' : ''}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{msg.sender?.name}</span>
                        <span className="text-xs text-muted-foreground">{timeAgo(msg.createdAt)}</span>
                      </div>
                      <div className={'mt-1 p-3 rounded-lg text-sm max-w-md ' + (msg.senderId === user?.id ? 'bg-primary text-primary-foreground ml-auto' : 'bg-muted')}>
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
              />
              <Button type="submit" size="icon" disabled={!message.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Select a channel to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
