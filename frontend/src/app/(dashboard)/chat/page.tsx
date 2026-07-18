'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { MessageSquare, Send, Plus, Hash, Search, Smile } from 'lucide-react';
import { useAuthStore } from '@/store/slices/authStore';
import { getInitials, timeAgo } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

export default function ChatPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [roomForm, setRoomForm] = useState({ name: '', description: '' });
  const [searchChannels, setSearchChannels] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: roomsData } = useQuery({
    queryKey: ['chat-rooms'],
    queryFn: () => chatApi.getRooms().then((r) => r.data),
  });

  const { data: messagesData } = useQuery({
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
  });

  const createRoomMutation = useMutation({
    mutationFn: (data: any) => chatApi.createRoom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-rooms'] });
      setShowCreateRoom(false);
      setRoomForm({ name: '', description: '' });
      toast.success('Channel created!');
    },
  });

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData]);

  const rooms = roomsData?.data || [];
  const messages = messagesData?.data || [];
  const selectedRoomData = rooms.find((r: any) => r.id === selectedRoom);
  const filteredRooms = rooms.filter((r: any) => r.name.toLowerCase().includes(searchChannels.toLowerCase()));

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-3xl bg-white dark:bg-[#09090b] border overflow-hidden shadow-2xl">
      {/* Sidebar */}
      <div className="w-72 border-r flex flex-col bg-muted/30">
        <div className="p-5 border-b">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-500" /> Channels
            </h2>
            <button
              onClick={() => setShowCreateRoom(true)}
              className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition-colors shadow-md"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search channels..."
              value={searchChannels}
              onChange={(e) => setSearchChannels(e.target.value)}
              className="w-full pl-10 pr-3 py-2 rounded-xl border bg-white dark:bg-black text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredRooms.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">No channels yet</p>
              <button onClick={() => setShowCreateRoom(true)} className="text-sm text-blue-600 mt-1 hover:underline">
                Create one
              </button>
            </div>
          ) : (
            filteredRooms.map((room: any) => (
              <motion.button
                key={room.id}
                whileHover={{ x: 4 }}
                onClick={() => setSelectedRoom(room.id)}
                className={'w-full p-3 text-left rounded-2xl transition-all flex items-center gap-3 group ' + (selectedRoom === room.id ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25' : 'hover:bg-muted')}
              >
                <div className={'w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ' + (selectedRoom === room.id ? 'bg-white/20' : 'bg-blue-500/10')}>
                  <Hash className={'w-4 h-4 ' + (selectedRoom === room.id ? 'text-white' : 'text-blue-500')} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sm truncate">{room.name}</p>
                  {room.messages?.[0] && (
                    <p className={'text-xs truncate ' + (selectedRoom === room.id ? 'text-white/70' : 'text-muted-foreground')}>
                      {room.messages[0].content}
                    </p>
                  )}
                </div>
              </motion.button>
            ))
          )}
        </div>

        <div className="p-4 border-t bg-white dark:bg-black">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {user ? getInitials(user.name) : 'U'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white dark:border-black" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">Online</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedRoom ? (
          <>
            <div className="p-5 border-b bg-white dark:bg-black flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Hash className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg">{selectedRoomData?.name}</h3>
                {selectedRoomData?.description && (
                  <p className="text-xs text-muted-foreground">{selectedRoomData.description}</p>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-muted/20">
              <AnimatePresence>
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-20 h-20 rounded-3xl bg-blue-500/10 flex items-center justify-center mb-4">
                      <MessageSquare className="w-10 h-10 text-blue-500" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Start the conversation</h3>
                    <p className="text-sm text-muted-foreground">Be the first to send a message!</p>
                  </div>
                ) : (
                  messages.map((msg: any, index: number) => {
                    const isMe = msg.senderId === user?.id;
                    const showAvatar = index === 0 || messages[index - 1]?.senderId !== msg.senderId;

                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={'flex gap-3 ' + (isMe ? 'flex-row-reverse' : '')}
                      >
                        {showAvatar ? (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0 shadow-lg">
                            {getInitials(msg.sender?.name || 'U')}
                          </div>
                        ) : (
                          <div className="w-10 flex-shrink-0" />
                        )}
                        <div className={'max-w-[70%] ' + (isMe ? 'items-end' : 'items-start') + ' flex flex-col'}>
                          {showAvatar && (
                            <div className={'flex items-center gap-2 mb-1 ' + (isMe ? 'flex-row-reverse' : '')}>
                              <span className="text-sm font-bold">{msg.sender?.name}</span>
                              <span className="text-xs text-muted-foreground">{timeAgo(msg.createdAt)}</span>
                            </div>
                          )}
                          <div className={'px-4 py-2.5 rounded-2xl text-sm break-words shadow-sm ' + (isMe ? 'bg-blue-500 text-white rounded-tr-sm' : 'bg-white dark:bg-black rounded-tl-sm')}>
                            {msg.content}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={(e) => { e.preventDefault(); if (message.trim()) sendMutation.mutate(); }} className="p-4 border-t bg-white dark:bg-black">
              <div className="flex gap-3 items-center">
                <button type="button" className="p-2 rounded-xl hover:bg-muted transition-colors">
                  <Smile className="w-5 h-5 text-muted-foreground" />
                </button>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={'Message #' + (selectedRoomData?.name || 'channel')}
                  className="flex-1 px-4 py-3 rounded-2xl border-2 border-muted bg-transparent text-sm focus:border-blue-500 outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 disabled:opacity-50 transition-all shadow-lg"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-muted/20">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/25">
                <MessageSquare className="w-12 h-12 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Welcome to Chat</h3>
              <p className="text-muted-foreground mb-6">Select a channel to start messaging</p>
              <Button onClick={() => setShowCreateRoom(true)}>
                <Plus className="w-4 h-4 mr-2" /> Create Channel
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={showCreateRoom} onClose={() => setShowCreateRoom(false)} title="Create Channel">
        <form onSubmit={(e) => { e.preventDefault(); createRoomMutation.mutate(roomForm); }} className="space-y-5">
          <Input
            label="Channel Name"
            value={roomForm.name}
            onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
            placeholder="general, design, backend..."
            required
          />
          <Input
            label="Description (optional)"
            value={roomForm.description}
            onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
            placeholder="What is this channel about?"
          />
          <div className="flex gap-3 justify-end">
            <Button variant="outline" type="button" onClick={() => setShowCreateRoom(false)}>Cancel</Button>
            <Button type="submit" loading={createRoomMutation.isPending}>Create</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}