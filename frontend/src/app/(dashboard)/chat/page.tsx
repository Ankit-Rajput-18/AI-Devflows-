'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/shared';
import { MessageSquare, Send, Plus, Hash, X } from 'lucide-react';
import { useAuthStore } from '@/store/slices/authStore';
import { getInitials, timeAgo } from '@/lib/utils';
import { toast } from 'sonner';

export default function ChatPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomForm, setRoomForm] = useState({ name: '', description: '' });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: roomsData, isLoading: roomsLoading } = useQuery({
    queryKey: ['chat-rooms'],
    queryFn: () => chatApi.getRooms().then((r) => r.data),
  });

  const { data: messagesData, isLoading: msgsLoading } = useQuery({
    queryKey: ['chat-messages', selectedRoom],
    queryFn: () => selectedRoom
      ? chatApi.getMessages(selectedRoom).then((r) => r.data)
      : null,
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

  const createRoomMutation = useMutation({
    mutationFn: (data: any) => chatApi.createRoom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-rooms'] });
      setShowCreateRoom(false);
      setRoomForm({ name: '', description: '' });
      toast.success('Room created!');
    },
    onError: () => toast.error('Failed to create room'),
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData]);

  const rooms = roomsData?.data || [];
  const messages_list = messagesData?.data || [];
  const selectedRoomData = rooms.find((r: any) => r.id === selectedRoom);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !selectedRoom) return;
    sendMutation.mutate();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!message.trim() || !selectedRoom) return;
      sendMutation.mutate();
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-xl border bg-card overflow-hidden animate-fade-in">
      <div className="w-64 border-r flex flex-col bg-muted/20">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-semibold flex items-center gap-2">
            <MessageSquare className="w-5 h-5" /> Channels
          </h2>
          <button
            onClick={() => setShowCreateRoom(true)}
            className="p-1.5 rounded-lg hover:bg-accent"
            title="Create channel"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {roomsLoading ? (
            <LoadingSpinner size="sm" />
          ) : rooms.length === 0 ? (
            <div className="text-center p-4">
              <p className="text-xs text-muted-foreground">No channels yet</p>
              <button
                onClick={() => setShowCreateRoom(true)}
                className="text-xs text-primary mt-1 hover:underline"
              >
                Create one
              </button>
            </div>
          ) : (
            rooms.map((room: any) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoom(room.id)}
                className={'w-full p-2.5 text-left rounded-lg transition flex items-center gap-2 ' + (selectedRoom === room.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent')}
              >
                <Hash className="w-4 h-4 flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{room.name}</p>
                  {room.messages?.[0] && (
                    <p className={'text-xs truncate ' + (selectedRoom === room.id ? 'text-primary-foreground/70' : 'text-muted-foreground')}>
                      {room.messages[0].content}
                    </p>
                  )}
                </div>
              </button>
            ))
          )}
        </div>

        <div className="p-3 border-t">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
              {user ? getInitials(user.name) : 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground capitalize">{user?.role?.toLowerCase()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            <div className="p-4 border-b flex items-center gap-2">
              <Hash className="w-5 h-5 text-muted-foreground" />
              <div>
                <h3 className="font-semibold">{selectedRoomData?.name}</h3>
                {selectedRoomData?.description && (
                  <p className="text-xs text-muted-foreground">{selectedRoomData.description}</p>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {msgsLoading ? (
                <LoadingSpinner size="sm" />
              ) : messages_list.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">No messages yet</p>
                    <p className="text-xs text-muted-foreground">Start the conversation!</p>
                  </div>
                </div>
              ) : (
                messages_list.map((msg: any, index: number) => {
                  const isMe = msg.senderId === user?.id;
                  const showAvatar = index === 0 || messages_list[index - 1]?.senderId !== msg.senderId;

                  return (
                    <div key={msg.id} className={'flex gap-3 ' + (isMe ? 'flex-row-reverse' : '')}>
                      {showAvatar ? (
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold flex-shrink-0">
                          {getInitials(msg.sender?.name || 'U')}
                        </div>
                      ) : (
                        <div className="w-8 flex-shrink-0" />
                      )}
                      <div className={'max-w-[70%] ' + (isMe ? 'items-end' : 'items-start') + ' flex flex-col'}>
                        {showAvatar && (
                          <div className={'flex items-center gap-2 mb-1 ' + (isMe ? 'flex-row-reverse' : '')}>
                            <span className="text-xs font-medium">{msg.sender?.name}</span>
                            <span className="text-xs text-muted-foreground">{timeAgo(msg.createdAt)}</span>
                          </div>
                        )}
                        <div className={'p-3 rounded-2xl text-sm break-words ' + (isMe ? 'bg-primary text-primary-foreground rounded-tr-sm' : 'bg-muted rounded-tl-sm')}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={'Message #' + (selectedRoomData?.name || 'channel')}
                className="flex-1 px-4 py-2.5 rounded-xl border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
              />
              <Button type="submit" size="icon" disabled={!message.trim()} loading={sendMutation.isPending}>
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold">Welcome to Chat</h3>
              <p className="text-muted-foreground text-sm mt-1">
                Select a channel or create a new one
              </p>
              <Button className="mt-4" onClick={() => setShowCreateRoom(true)}>
                <Plus className="w-4 h-4 mr-2" /> Create Channel
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={showCreateRoom} onClose={() => setShowCreateRoom(false)} title="Create Channel">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createRoomMutation.mutate(roomForm);
          }}
          className="space-y-4"
        >
          <Input
            label="Channel Name *"
            value={roomForm.name}
            onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
            placeholder="general, design, backend..."
            required
          />
          <div className="space-y-1">
            <label className="text-sm font-medium">Description</label>
            <input
              type="text"
              value={roomForm.description}
              onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
              className="w-full px-3 py-2 rounded-md border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
              placeholder="What is this channel about?"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" type="button" onClick={() => setShowCreateRoom(false)}>Cancel</Button>
            <Button type="submit" loading={createRoomMutation.isPending}>Create Channel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}