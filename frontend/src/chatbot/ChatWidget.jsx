import React, { useState, useRef, useEffect } from 'react';
import { Plus, Search, Download, Trash2, Share2, Edit, Send, Bot, User, MoreVertical, MessageCircle, X, Maximize2, Minimize2, Settings } from 'lucide-react';

const ChatWidget = () => {
  const [widgetState, setWidgetState] = useState('closed'); // 'closed', 'medium', 'large'
  const [selectedChat, setSelectedChat] = useState(1);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hello! How can I help you today?', timestamp: new Date() }
  ]);
  const [chats, setChats] = useState([
    { 
      id: 1, 
      name: 'Welcome Chat', 
      messages: [
        { from: 'bot', text: 'Hello! How can I help you today?', timestamp: new Date() }
      ],
      lastActivity: new Date()
    },
    { 
      id: 2, 
      name: 'Previous Conversation', 
      messages: [
        { from: 'user', text: 'What is React?', timestamp: new Date(Date.now() - 3600000) },
        { from: 'bot', text: 'React is a JavaScript library for building user interfaces...', timestamp: new Date(Date.now() - 3500000) }
      ],
      lastActivity: new Date(Date.now() - 3600000)
    }
  ]);
  const [isRenaming, setIsRenaming] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Load messages for selected chat
    const currentChat = chats.find(chat => chat.id === selectedChat);
    if (currentChat) {
      setMessages(currentChat.messages);
    }
  }, [selectedChat, chats]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = () => {
    if (!message.trim()) return;
    
    const newMsg = { from: 'user', text: message, timestamp: new Date() };
    const updatedMsgs = [...messages, newMsg];
    setMessages(updatedMsgs);
    setMessage('');
    
    // Update chat with new message
    setChats(prev =>
      prev.map(chat =>
        chat.id === selectedChat 
          ? { ...chat, messages: updatedMsgs, lastActivity: new Date() }
          : chat
      )
    );

    // Simulate bot response
    setIsTyping(true);
    setTimeout(() => {
      const botResponse = { from: 'bot', text: 'Thank you for your message! This is a demo response.', timestamp: new Date() };
      const finalMsgs = [...updatedMsgs, botResponse];
      setMessages(finalMsgs);
      setChats(prev =>
        prev.map(chat =>
          chat.id === selectedChat 
            ? { ...chat, messages: finalMsgs, lastActivity: new Date() }
            : chat
        )
      );
      setIsTyping(false);
    }, 1500);
  };

  const handleChatSelect = (chat) => {
    setSelectedChat(chat.id);
    setMessages(chat.messages);
  };

  const handleNewChat = () => {
    const newId = Date.now();
    const newChat = { 
      id: newId, 
      name: `Chat ${chats.length + 1}`, 
      messages: [
        { from: 'bot', text: 'Hello! How can I help you today?', timestamp: new Date() }
      ],
      lastActivity: new Date()
    };
    setChats([newChat, ...chats]);
    setSelectedChat(newId);
    setMessages(newChat.messages);
  };

  const handleRename = (id, newName) => {
    if (newName.trim()) {
      setChats(prev => prev.map(chat => chat.id === id ? { ...chat, name: newName.trim() } : chat));
    }
    setIsRenaming(null);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this chat?")) {
      setChats(prev => prev.filter(chat => chat.id !== id));
      if (selectedChat === id) {
        const remainingChats = chats.filter(chat => chat.id !== id);
        if (remainingChats.length > 0) {
          setSelectedChat(remainingChats[0].id);
          setMessages(remainingChats[0].messages);
        } else {
          handleNewChat();
        }
      }
    }
  };

  const handleExport = (format) => {
    const data = format === 'json' 
      ? JSON.stringify(chats, null, 2)
      : chats.map(chat => `Chat: ${chat.name}\n${chat.messages.map(msg => `${msg.from}: ${msg.text}`).join('\n')}`).join('\n\n');
    
    const blob = new Blob([data], { 
      type: format === 'json' ? 'application/json' : 'text/plain' 
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `chat_export.${format}`;
    link.click();
    setDropdownOpen(false);
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const today = new Date();
    const msgDate = new Date(timestamp);
    if (msgDate.toDateString() === today.toDateString()) {
      return formatTime(timestamp);
    }
    return msgDate.toLocaleDateString();
  };

  // Filter chats based on search query
  const filteredChats = chats.filter(chat =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.messages.some(msg => msg.text.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Floating chat button (closed state)
  if (widgetState === 'closed') {
    return (
      <div className="fixed z-50 bottom-6 right-6">
        <button
          onClick={() => setWidgetState('medium')}
          className="relative flex items-center justify-center text-white transition-all duration-300 transform rounded-full shadow-2xl group w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-blue-500/25 hover:scale-110"
        >
          <MessageCircle size={24} />
          <div className="absolute w-4 h-4 bg-green-500 rounded-full -top-1 -right-1 animate-pulse"></div>
          <div className="absolute right-0 px-3 py-2 text-sm text-white transition-opacity duration-200 bg-gray-900 rounded-lg opacity-0 bottom-16 group-hover:opacity-100 whitespace-nowrap">
            Chat with us!
          </div>
        </button>
      </div>
    );
  }

  // Medium popup state
  if (widgetState === 'medium') {
    return (
      <div className="fixed z-50 bottom-6 right-6">
        <div className="flex flex-col overflow-hidden bg-white border border-gray-200 shadow-2xl w-80 h-96 dark:bg-gray-900 rounded-2xl dark:border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between p-4 text-white bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/20">
                <Bot size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold">AI Assistant</h3>
                <p className="text-xs opacity-90">Online</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setWidgetState('large')}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Maximize2 size={16} />
              </button>
              <button
                onClick={() => setWidgetState('closed')}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} mb-3`}>
                <div className={`max-w-[75%] px-3 py-2 rounded-2xl ${
                  msg.from === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                }`}>
                  <p className="text-sm">{msg.text}</p>
                  <div className="mt-1 text-xs opacity-70">{formatTime(msg.timestamp)}</div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start mb-3">
                <div className="px-3 py-2 bg-white shadow-sm dark:bg-gray-700 rounded-2xl">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef}></div>
          </div>

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-200 dark:bg-gray-900 dark:border-gray-700">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 px-3 py-2 text-sm bg-gray-100 border-0 rounded-full dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSend}
                disabled={!message.trim()}
                className="p-2 text-white transition-colors bg-blue-600 rounded-full hover:bg-blue-700 disabled:bg-gray-400"
              >
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Large popup state (full ChatGPT-like interface)
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="w-full max-w-6xl h-full max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex overflow-hidden">
        {/* Sidebar */}
        <aside className="flex flex-col border-r border-gray-200 w-80 bg-gray-50 dark:bg-gray-800 dark:border-gray-700">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <button 
              onClick={handleNewChat} 
              className="flex items-center px-4 py-2 space-x-2 text-white transition-all duration-200 transform rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:scale-105"
            >
              <Plus size={16} />
              <span className="font-medium">New Chat</span>
            </button>
            <button
              onClick={() => setWidgetState('medium')}
              className="p-2 text-gray-500 transition-colors rounded-lg hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <Minimize2 size={16} />
            </button>
          </div>
          
          <div className="p-4">
            <div className="relative mb-4">
              <Search size={16} className="absolute text-gray-400 transform -translate-y-1/2 left-3 top-1/2" />
              <input
                type="text"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2 pl-10 pr-4 text-sm bg-white border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-220px)]">
              {filteredChats.map(chat => (
                <div 
                  key={chat.id} 
                  className={`group flex justify-between items-center px-3 py-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedChat === chat.id 
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-l-4 border-blue-500' 
                      : 'hover:bg-gray-200 dark:hover:bg-gray-700'
                  }`}
                >
                  {isRenaming === chat.id ? (
                    <input
                      type="text"
                      defaultValue={chat.name}
                      autoFocus
                      onBlur={(e) => handleRename(chat.id, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(chat.id, e.target.value);
                        if (e.key === 'Escape') setIsRenaming(null);
                      }}
                      className="w-full text-sm bg-transparent border-b border-blue-500 focus:outline-none"
                    />
                  ) : (
                    <div onClick={() => handleChatSelect(chat)} className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate dark:text-white">{chat.name}</h4>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{formatDate(chat.lastActivity)}</p>
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-1 transition-opacity opacity-0 group-hover:opacity-100">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsRenaming(chat.id);
                      }}
                      className="p-1.5 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors"
                    >
                      <Edit size={12} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigator.share ? navigator.share({ title: chat.name, text: 'Check out this chat' }) : alert('Share feature coming soon!');
                      }}
                      className="p-1.5 hover:bg-gray-300 dark:hover:bg-gray-600 rounded transition-colors"
                    >
                      <Share2 size={12} />
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(chat.id);
                      }}
                      className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 rounded transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
              
              {filteredChats.length === 0 && searchQuery && (
                <div className="py-8 text-center text-gray-500 dark:text-gray-400">
                  <Search size={24} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No chats found</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="relative p-4 mt-auto border-t border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => setDropdownOpen(!dropdownOpen)} 
              className="flex items-center justify-between w-full px-4 py-2 text-white transition-all duration-200 rounded-lg bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              <div className="flex items-center space-x-2">
                <Download size={16} />
                <span>Export Chats</span>
              </div>
              <MoreVertical size={16} />
            </button>
            
            {dropdownOpen && (
              <div className="absolute mb-2 overflow-hidden bg-white border border-gray-200 rounded-lg shadow-lg bottom-full right-4 left-4 dark:bg-gray-800 dark:border-gray-700">
                <button 
                  onClick={() => handleExport('txt')} 
                  className="w-full px-4 py-3 text-left transition-colors border-b border-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 dark:border-gray-700"
                >
                  <div className="flex items-center space-x-2">
                    <Download size={14} />
                    <span className="text-sm">Export as Text</span>
                  </div>
                </button>
                <button 
                  onClick={() => handleExport('json')} 
                  className="w-full px-4 py-3 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <div className="flex items-center space-x-2">
                    <Download size={14} />
                    <span className="text-sm">Export as JSON</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Main Chat Area */}
        <main className="flex flex-col flex-1 bg-white dark:bg-gray-900">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600">
                <Bot size={20} className="text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white">AI Assistant</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Always here to help</p>
              </div>
            </div>
            <button
              onClick={() => setWidgetState('closed')}
              className="p-2 text-gray-500 transition-colors rounded-lg hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
            <div className="max-w-4xl mx-auto space-y-6">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`flex items-start space-x-3 max-w-3xl ${msg.from === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.from === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    }`}>
                      {msg.from === 'user' ? <User size={16} /> : <Bot size={16} />}
                    </div>
                    <div className={`px-4 py-3 rounded-2xl ${
                      msg.from === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm border border-gray-200 dark:border-gray-700'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.text}</p>
                      <div className={`text-xs mt-2 ${msg.from === 'user' ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                        {formatTime(msg.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="flex items-start max-w-3xl space-x-3">
                    <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 text-white rounded-full bg-gradient-to-r from-purple-600 to-blue-600">
                      <Bot size={16} />
                    </div>
                    <div className="px-4 py-3 bg-white border border-gray-200 shadow-sm dark:bg-gray-800 rounded-2xl dark:border-gray-700">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef}></div>
          </div>

          {/* Input */}
          <div className="p-6 bg-white border-t border-gray-200 dark:border-gray-700 dark:bg-gray-900">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-end space-x-4">
                <div className="relative flex-1">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message here..."
                    rows={1}
                    className="w-full px-4 py-3 pr-12 bg-gray-100 border border-gray-300 resize-none rounded-2xl dark:bg-gray-800 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    style={{minHeight: '48px', maxHeight: '120px'}}
                  />
                </div>
                <button
                  onClick={handleSend}
                  disabled={!message.trim() || isTyping}
                  className="p-3 text-white transition-all duration-200 transform shadow-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 rounded-2xl hover:scale-105 disabled:scale-100"
                >
                  <Send size={20} />
                </button>
              </div>
              <p className="mt-2 text-xs text-center text-gray-500 dark:text-gray-400">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ChatWidget;