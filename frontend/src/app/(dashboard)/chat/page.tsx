'use client';

import { useEffect, useRef, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatApi, projectsApi, usersApi } from '@/services/api';
import { getChatSocket } from '@/services/socket';
import { useAuthStore } from '@/store/slices/authStore';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import {
  MessageSquare, Send, Plus, Hash, Search,
  Smile, Wifi, WifiOff, Users, Settings,
  UserPlus, Trash2, Crown, X,
} from 'lucide-react';
import { getInitials, timeAgo } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

export default function ChatPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [showRoomSettings, setShowRoomSettings] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [roomForm, setRoomForm] = useState({ name: '', description: '', projectId: '' });
  const [selectedUserId, setSelectedUserId] = useState('');
  const [searchChannels, setSearchChannels] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [sidePanel, setSidePanel] = useState<'none' | 'members'>('none');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);
  const typingTimeoutRef = useRef<any>(null);

  const { data: roomsData } = useQuery({
    queryKey: ['chat-rooms'],
    queryFn: () => chatApi.getRooms().then((r) => r.data),
  });

  const { data: messagesData } = useQuery({
    queryKey: ['chat-messages', selectedRoom],
    queryFn: () => selectedRoom ? chatApi.getMessages(selectedRoom).then((r) => r.data) : null,
    enabled: !!selectedRoom,
  });

  const { data: projectsData } = useQuery({
    queryKey: ['projects-list'],
    queryFn: () => projectsApi.getAll({}).then((r) => r.data),
  });

  const { data: allUsersData } = useQuery({
    queryKey: ['all-users'],
    queryFn: () => usersApi.getAll({ limit: 100 }).then((r) => r.data),
  });

  const createRoomMutation = useMutation({
    mutationFn: (data: any) => chatApi.createRoom(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-rooms'] });
      setShowCreateRoom(false);
      setRoomForm({ name: '', description: '', projectId: '' });
      toast.success('Channel created!');
    },
    onError: () => toast.error('Failed to create channel'),
  });

  useEffect(() => {
    if (!user) return;

    const socket = getChatSocket();
    socketRef.current = socket;
    socket.connect();

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    socket.on('new_message', (newMessage: any) => {
      queryClient.setQueryData(['chat-messages', newMessage.roomId], (old: any) => {
        if (!old?.data) return old;
        const exists = old.data.some((m: any) => m.id === newMessage.id);
        if (exists) return old;
        return { ...old, data: [...old.data, newMessage] };
      });
      queryClient.invalidateQueries({ queryKey: ['chat-rooms'] });
    });

    socket.on('user_typing', (data: any) => {
      setTypingUsers((prev) => prev.includes(data.userName) ? prev : [...prev, data.userName]);
    });

    socket.on('user_stop_typing', (data: any) => {
      setTypingUsers((prev) => prev.filter((u) => u !== data.userName));
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('new_message');
      socket.off('user_typing');
      socket.off('user_stop_typing');
      socket.disconnect();
    };
  }, [user, queryClient]);

  useEffect(() => {
    if (!selectedRoom || !socketRef.current || !user) return;
    socketRef.current.emit('join_room', { roomId: selectedRoom, userId: user.id });
    return () => {
      socketRef.current?.emit('leave_room', { roomId: selectedRoom, userId: user.id });
    };
  }, [selectedRoom, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData]);

  const rooms = roomsData?.data || [];
  const messages = messagesData?.data || [];
  const allUsers = allUsersData?.data || [];
  const projects = projectsData?.data || [];

  const selectedRoomData = rooms.find((r: any) => r.id === selectedRoom);
  const filteredRooms = rooms.filter((r: any) =>
    r.name.toLowerCase().includes(searchChannels.toLowerCase())
  );

  const sendMessage = () => {
    if (!message.trim() || !selectedRoom || !user) return;

    if (socketRef.current && isConnected) {
      socketRef.current.emit('send_message', {
        roomId: selectedRoom,
        content: message,
        userId: user.id,
        type: 'TEXT',
      });
      setMessage('');
    } else {
      chatApi.sendMessage(selectedRoom, { content: message }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['chat-messages', selectedRoom] });
        setMessage('');
      }).catch(() => toast.error('Failed to send message'));
    }
  };

  const handleTyping = () => {
    if (!selectedRoom || !user || !socketRef.current) return;
    socketRef.current.emit('typing', { roomId: selectedRoom, userId: user.id, userName: user.name });
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('stop_typing', { roomId: selectedRoom, userId: user.id, userName: user.name });
    }, 1500);
  };

  const handleInviteUser = async () => {
    if (!selectedRoom || !selectedUserId) {
      toast.error('Please select a user');
      return;
    }

    const roomData = rooms.find((r: any) => r.id === selectedRoom);
    if (roomData?.projectId) {
      try {
        await projectsApi.addMember(roomData.projectId, {
          userId: selectedUserId,
          role: 'DEVELOPER',
        });
        toast.success('User added to project and chat!');
        setShowAddMember(false);
        setSelectedUserId('');
        queryClient.invalidateQueries({ queryKey: ['chat-rooms'] });
      } catch (err: any) {
        const msg = err.response?.data?.message;
        if (typeof msg === 'string' && msg.includes('already')) {
          toast.info('User is already a member!');
        } else {
          toast.error(typeof msg === 'string' ? msg : 'Failed to add user');
        }
      }
    } else {
      toast.info('This is a general channel. Users can join directly.');
      setShowAddMember(false);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] rounded-3xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xl">

      {/* Left Sidebar - Channels */}
      <div className="w-64 border-r border-slate-200 dark:border-slate-800 flex flex-col bg-slate-50 dark:bg-slate-900/50 flex-shrink-0">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold flex items-center gap-2 text-sm">
              <MessageSquare className="w-4 h-4 text-blue-500" /> Channels
            </h2>
            <div className="flex items-center gap-1.5">
              {isConnected
                ? <Wifi className="w-3.5 h-3.5 text-green-500" />
                : <WifiOff className="w-3.5 h-3.5 text-red-500" />
              }
              <button
                onClick={() => setShowCreateRoom(true)}
                className="w-7 h-7 rounded-lg bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 transition"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              value={searchChannels}
              onChange={(e) => setSearchChannels(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border bg-white dark:bg-slate-950 text-xs outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {filteredRooms.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-xs text-muted-foreground">No channels</p>
              <button onClick={() => setShowCreateRoom(true)} className="text-xs text-blue-600 mt-1 hover:underline">Create one</button>
            </div>
          ) : filteredRooms.map((room: any) => (
            <motion.button
              key={room.id}
              whileHover={{ x: 2 }}
              onClick={() => { setSelectedRoom(room.id); setSidePanel('none'); }}
              className={'w-full p-2.5 text-left rounded-xl transition-all flex items-center gap-2.5 ' + (selectedRoom === room.id ? 'bg-blue-500 text-white' : 'hover:bg-slate-200 dark:hover:bg-slate-800')}
            >
              <Hash className={'w-4 h-4 flex-shrink-0 ' + (selectedRoom === room.id ? 'text-white' : 'text-blue-500')} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-xs truncate">{room.name}</p>
                {room.messages?.[0] && (
                  <p className={'text-xs truncate ' + (selectedRoom === room.id ? 'text-white/70' : 'text-muted-foreground')}>
                    {room.messages[0].content}
                  </p>
                )}
              </div>
            </motion.button>
          ))}
        </div>

        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs">
                {user ? getInitials(user.name) : 'U'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-950" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{isConnected ? '● Online' : '○ Offline'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedRoom ? (
          <>
            {/* Chat Header */}
            <div className="px-5 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-white dark:bg-slate-950">
              <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Hash className="w-4 h-4 text-blue-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold truncate">{selectedRoomData?.name}</h3>
                {selectedRoomData?.description && (
                  <p className="text-xs text-muted-foreground truncate">{selectedRoomData.description}</p>
                )}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => setShowAddMember(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition text-xs font-semibold"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Add Member
                </button>
                <button
                  onClick={() => setSidePanel(sidePanel === 'members' ? 'none' : 'members')}
                  className={'p-2 rounded-xl transition ' + (sidePanel === 'members' ? 'bg-blue-500 text-white' : 'hover:bg-accent')}
                >
                  <Users className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages + Side Panel */}
            <div className="flex flex-1 overflow-hidden">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50 dark:bg-slate-900/30">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-3">
                      <MessageSquare className="w-8 h-8 text-blue-500" />
                    </div>
                    <h3 className="font-bold mb-1">No messages yet</h3>
                    <p className="text-sm text-muted-foreground">Start the conversation!</p>
                  </div>
                ) : messages.map((msg: any, index: number) => {
                  const isMe = msg.senderId === user?.id;
                  const showAvatar = index === 0 || messages[index - 1]?.senderId !== msg.senderId;

                  return (
                    <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={'flex gap-3 ' + (isMe ? 'flex-row-reverse' : '')}>
                      {showAvatar ? (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {getInitials(msg.sender?.name || 'U')}
                        </div>
                      ) : <div className="w-9 flex-shrink-0" />}

                      <div className={'max-w-[65%] flex flex-col ' + (isMe ? 'items-end' : 'items-start')}>
                        {showAvatar && (
                          <div className={'flex items-center gap-2 mb-1 ' + (isMe ? 'flex-row-reverse' : '')}>
                            <span className="text-xs font-bold">{msg.sender?.name}</span>
                            <span className="text-xs text-muted-foreground">{timeAgo(msg.createdAt)}</span>
                          </div>
                        )}
                        <div className={'px-4 py-2 rounded-2xl text-sm break-words ' + (isMe ? 'bg-blue-500 text-white rounded-tr-sm' : 'bg-white dark:bg-slate-950 rounded-tl-sm shadow-sm')}>
                          {msg.content}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}

                {typingUsers.length > 0 && (
                  <div className="text-xs text-muted-foreground italic">
                    {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Members Side Panel */}
              <AnimatePresence>
                {sidePanel === 'members' && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 240, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-y-auto flex-shrink-0"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-sm flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-500" />
                          Members
                        </h3>
                        <button onClick={() => setSidePanel('none')} className="p-1 rounded-lg hover:bg-accent">
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <button
                        onClick={() => setShowAddMember(true)}
                        className="w-full flex items-center gap-2 p-2.5 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-800 hover:border-blue-500 text-blue-600 text-xs font-semibold transition mb-3"
                      >
                        <UserPlus className="w-4 h-4" />
                        Invite Member
                      </button>

                      <div className="space-y-2">
                        {allUsers.filter((u: any) => u.isActive).slice(0, 15).map((u: any) => (
                          <div key={u.id} className="flex items-center gap-2 p-2 rounded-xl hover:bg-muted/50 transition">
                            <div className="relative flex-shrink-0">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                {getInitials(u.name)}
                              </div>
                              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-white dark:border-slate-950" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-semibold truncate">{u.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{u.role}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Message Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
              className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
            >
              <div className="flex gap-2 items-center">
                <button type="button" className="p-2 rounded-xl hover:bg-muted transition flex-shrink-0">
                  <Smile className="w-5 h-5 text-muted-foreground" />
                </button>
                <input
                  type="text"
                  value={message}
                  onChange={(e) => { setMessage(e.target.value); handleTyping(); }}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder={'Message #' + (selectedRoomData?.name || 'channel')}
                  className="flex-1 px-4 py-2.5 rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-transparent text-sm focus:border-blue-500 outline-none transition-all"
                />
                <button
                  type="submit"
                  disabled={!message.trim()}
                  className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center hover:bg-blue-600 disabled:opacity-50 transition shadow-lg flex-shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-slate-50 dark:bg-slate-900/30">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-5 shadow-2xl shadow-blue-500/25">
                <MessageSquare className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Welcome to Chat</h3>
              <p className="text-muted-foreground mb-5">Select or create a channel to start.</p>
              <Button onClick={() => setShowCreateRoom(true)}>
                <Plus className="w-4 h-4 mr-2" /> Create Channel
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      <Modal isOpen={showCreateRoom} onClose={() => setShowCreateRoom(false)} title="Create Channel">
        <form onSubmit={(e) => { e.preventDefault(); createRoomMutation.mutate(roomForm); }} className="space-y-4">
          <Input
            label="Channel Name *"
            value={roomForm.name}
            onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
            placeholder="general, design, backend..."
            required
          />
          <Input
            label="Description"
            value={roomForm.description}
            onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
            placeholder="What is this channel about?"
          />
          <div className="space-y-1">
            <label className="text-sm font-semibold">Link to Project (optional)</label>
            <select
              value={roomForm.projectId}
              onChange={(e) => setRoomForm({ ...roomForm, projectId: e.target.value })}
              className="w-full px-4 py-3 rounded-2xl border-2 border-muted bg-white dark:bg-slate-950 text-sm"
            >
              <option value="">General channel (no project)</option>
              {projects.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" type="button" onClick={() => setShowCreateRoom(false)}>Cancel</Button>
            <Button type="submit" loading={createRoomMutation.isPending}>Create Channel</Button>
          </div>
        </form>
      </Modal>

      {/* Add Member Modal */}
      <Modal isOpen={showAddMember} onClose={() => setShowAddMember(false)} title="Invite Member to Channel">
        <div className="space-y-5">
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-400 font-medium">
              Channel: <span className="font-bold">#{selectedRoomData?.name}</span>
            </p>
            {selectedRoomData?.projectId ? (
              <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                Linked to project - adding user will add them to the project.
              </p>
            ) : (
              <p className="text-xs text-blue-600 dark:text-blue-500 mt-1">
                General channel - all workspace members can participate.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold">Select User</label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border-2 border-muted bg-white dark:bg-slate-950 text-sm focus:border-blue-500 outline-none"
            >
              <option value="">Choose a user...</option>
              {allUsers.map((u: any) => (
                <option key={u.id} value={u.id}>
                  {u.name} - {u.email} ({u.role})
                </option>
              ))}
            </select>
          </div>

          {selectedUserId && (
            <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {getInitials(allUsers.find((u: any) => u.id === selectedUserId)?.name || 'U')}
              </div>
              <div>
                <p className="text-sm font-semibold">
                  {allUsers.find((u: any) => u.id === selectedUserId)?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {allUsers.find((u: any) => u.id === selectedUserId)?.email}
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowAddMember(false)}>Cancel</Button>
            <Button onClick={handleInviteUser} disabled={!selectedUserId}>
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
