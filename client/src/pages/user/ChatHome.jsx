import React, { useRef, useState } from 'react'
import ChatCard from '../../components/user/ChatCard.jsx'
import { useEffect } from 'react'
import { userApi } from '../../api/user.api.js'
import { useContext } from 'react'
import { authContext } from '../../context/AuthProvider.jsx'
import { socket } from '../../socket/socket.js'
import {
    MessageCircle,
    Send,
    MoveDown,
    ArrowDownCircleIcon,
    Search,
    Zap,
    Bell,
    User,
    Users,
    Settings,
    Plus,
    LogOut,
    X,
    ChevronRight
} from 'lucide-react'
import Swal from 'sweetalert2';
import Message from '../../components/message/Message.jsx'
import { messageApi } from '../../api/message.api.js'
import { useChatStore } from '../../store/useChatStore.js'
import { chatApi } from '../../api/chat.api.js'
import { userAuthStore } from '../../store/userStore.js'
import { socketEvents } from '../../constants/socketEvents.js'
import { useAssetsStore } from '../../store/useAssetsStore.js'
import FileUpload from '../../components/message/FileUpload.jsx'
import MediaPreview from '../../components/message/MediaPreview.jsx'
import SingleFilePreview from '../../components/message/SingleFilePreview.jsx'
import Profile from '../../components/user/Profile.jsx'
import CreateGroup from '../../components/user/CreateGroup.jsx'
import SettingsPanel from '../../components/user/Settings.jsx'
import ChatList from '../../components/user/ChatList.jsx'
import GroupInfo from '../../components/user/GroupInfo.jsx'
import Sidebar from './Sidebar.jsx'
import { useRequest } from '../../hooks/useRequest.jsx'
import { useNotification } from '../../hooks/useNotification.jsx'
import Navbar from '../../components/user/Navbar.jsx'

function ChatHome() {

    const context = useContext(authContext);
    const [message, setMessage] = React.useState("")
    const [query, setQuery] = React.useState("")

    // Panel state: null | 'notifications' | 'profile' | 'newGroup' | 'settings'
    const [activePanel, setActivePanel] = useState("chats")

    const { user } = userAuthStore()
    const { fetchRequests } = useRequest()
    const { fetchNotifications } = useNotification()

    const users = useChatStore(state => state.userChats)
    const setUsers = useChatStore(state => state.setUserChats)

    const messages = useChatStore(state => state.userMessages)
    const addMessage = useChatStore(state => state.addMessage)
    const currentChatId = useChatStore(state => state.currentChatId)
    const userMessages = useChatStore().userMessages

    const {
        userSearch,
        setUserSearch,
        setChatUsersInfo,
        chatUsersInfo,
        emitedTyping,
        toogleEmitedTyping,
        onlineStatus,
        incrementNewMessagesCount,
        incrementNewMessagesCountByN,
        resetNewMessagesCount,
        mediaFiles,
        removeMessage,
        resetMediaFiles,
        setCurrentPreviewFile,
        currentPreviewFile
    } = useChatStore()

    const {
        scrollToBottomInChat,
        setScrollToBottomInChat
    } = useAssetsStore()

    const typingTimeoutRef = useRef(null);
    const isTypingRef = useRef(false);
    const messageEndRef = useRef(null);
    const chatContainerRef = useRef(null)
    const [isAtBottom, setIsAtBottom] = React.useState(true);
    const isMedia = mediaFiles[currentChatId]?.length > 0
    const [showSidebar, setShowSidebar] = useState(true)
    const [groupsOnly, setGroupsOnly] = useState(false)

    // Total unread count for notification badge
    const totalUnread = Object.values(chatUsersInfo).reduce((sum, c) => sum + (c?.newMessages || 0), 0)

    const togglePanel = (panel) => setActivePanel(prev => prev === panel ? null : panel)

    const loadUnreadMessages = (chats) => {
        chats.forEach((chat) => {
            incrementNewMessagesCountByN(chat._id, chat.unreadMessagesCount)
        })
    }

    const getMyNotifications = async () => {
        await fetchNotifications()
    }

    const getAllUsers = async () => {
        const response = await chatApi.getUserChats();
        if (response.success) {
            setUsers(response.data);
            loadUnreadMessages(response.data)
            setChatUsersInfo(response.data)
            console.log("All users fetched:", response.data);
        }
    }

    const getOnlineUsers = async () => {
        const response = await userApi.getOnlineUsers();
        if (response.success) {
            const { setOnlineStatus } = useChatStore.getState();
            console.log("Online Users List Received from socket server (API):", response.data);
            for (let user of response.data) {
                setOnlineStatus(user, true)
            }
        }
    }

    const getConversationMessages = async (otherUserId) => {
        const messages = await messageApi.getConversation(otherUserId)
    }

    const handleSend = async (e) => {
        e.preventDefault()
        console.log("Send button clicked");

        if (message.trim() === "" && !mediaFiles[currentChatId].length) {
            console.log("Returning Function HandleSend")
            return;
        }

        const tempId = `temp-${Date.now()}`

        addMessage(currentChatId, {
            _id: tempId,
            chatId: currentChatId,
            message: message.trim() !== "" ? message : "",
            sender: user._id,
            attachments: mediaFiles[currentChatId] || [],
            status: "uploading",
            createdAt: "2026-02-21T08:49:25.317Z"
        })

        setScrollToBottomInChat(true);

        const formData = new FormData()
        let uploadInfo;

        if (mediaFiles[currentChatId]?.length > 0) {
            mediaFiles[currentChatId].length > 0 && mediaFiles[currentChatId].forEach(image => {
                formData.append("images", image.file)
            })

            resetMediaFiles(currentChatId)

            uploadInfo = await messageApi.uploadImages(formData)

            console.log("Upload Info :: ", uploadInfo)

            if (!uploadInfo.success) {
                removeMessage(currentChatId, tempId)
                alert("Message Failed Please Try Again.")
            }
        }

        if (!socket) return

        socket.emit(socketEvents.NEW_MESSAGE, {
            message: message || "",
            attachments: uploadInfo?.data || [],
            receiver: context.currentChatUser._id,
            chatId: currentChatId || null,
            tempId: tempId
        }, (ack) => {
            console.log("Ack from server:", ack);
        })

        setMessage("")
    }

    const scrollToBottom = () => {
        const container = chatContainerRef.current;
        if (!container) return;
        container.scrollTop = container.scrollHeight;
    };

    useEffect(() => {
        if (user) {
            console.log("Emitting GET_ONLINE_STATUS for user:", user._id);
            socket.emit(socketEvents.GET_ONLINE_STATUS);
        }
        getAllUsers();
        getMyNotifications();
        getOnlineUsers();

        const container = chatContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const atBottom =
                container.scrollTop + container.clientHeight >=
                container.scrollHeight - 5;
            setIsAtBottom(atBottom);
        };

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, [])

    useEffect(() => {
        if (!isAtBottom) {
            scrollToBottom()
        }
    }, [setIsAtBottom])

    useEffect(() => {
        if (activePanel !== "newGroup") {
            setGroupsOnly(true)
        } else {
            setGroupsOnly(false)
        }

    }, [activePanel])

    useEffect(() => {
        if (scrollToBottomInChat) {
            scrollToBottom();
            setScrollToBottomInChat(false);
        }
    }, [scrollToBottomInChat])

    const searchUsers = async (query) => {
        setQuery(query);
        try {
            const response = await userApi.searchUsers(query);
            if (response.success) {
                setUserSearch(response.data);
            }
        } catch (error) {
            console.log("Error while searching users :", error);
        }
    }

    const handleTyping = (e) => {
        const value = e.target.value;
        setMessage(value);

        if (!socket || !context.currentChatUser || !currentChatId) return;

        if (!isTypingRef.current) {
            socket.emit(socketEvents.TYPING, {
                chatId: currentChatId,
                isTyping: true,
            });
            isTypingRef.current = true;
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            socket.emit(socketEvents.TYPING, {
                chatId: currentChatId,
                isTyping: false,
            });
            isTypingRef.current = false;
        }, 2000);
    };

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-surface-900">
            <Navbar />
            <div className="flex flex-1 overflow-hidden">
                <style>{`
                    .typing-dot { animation: typing-blink 1.2s infinite; }
                    .typing-dot:nth-child(2) { animation-delay: 0.2s; }
                    .typing-dot:nth-child(3) { animation-delay: 0.4s; }
                    .online-pulse { animation: pulse-dot 2s infinite; }
                    .fade-in-up { animation: fadeInUp 0.3s ease; }
                    .custom-scroll { scrollbar-width: thin; scrollbar-color: #1a1d28 transparent; }
                    .custom-scroll::-webkit-scrollbar { width: 4px; }
                    .msg-input-wrap:focus-within {
                        border-color: rgba(99,102,241,0.35) !important;
                        box-shadow: 0 0 0 3px rgba(99,102,241,0.15) !important;
                    }
                `}</style>

                {/* ── SIDEBAR ── */}
                <Sidebar
                    activePanel={activePanel}
                    setActivePanel={setActivePanel}
                    query={query}
                    setQuery={setQuery}
                    users={users}
                    setShowSidebar={setShowSidebar}
                    chatUsersInfo={chatUsersInfo}
                    totalUnread={totalUnread}
                    user={user}
                    searchUsers={searchUsers}
                />
                
                {/* ── MAIN WINDOW ── */}
                <div className="relative flex flex-col flex-1 h-full bg-surface-800 overflow-hidden hidden md:flex">
                    <div className="absolute -top-24 -right-24 w-[400px] h-[400px] rounded-full pointer-events-none z-0 bg-accent/5 blur-[80px]" />
                    
                    {context.currentChatUser ? (
                        <>
                            <nav className="sticky top-0 z-10 flex items-center gap-3.5 h-16 px-6 border-b border-white/[0.06] bg-surface-800/90 backdrop-blur-xl">
                                <div className="relative w-10 h-10 flex-shrink-0">
                                    <img
                                        src={context.currentChatUser.avtar}
                                        alt=""
                                        className="w-10 h-10 rounded-full object-cover border-2 border-white/[0.07]"
                                    />
                                    {onlineStatus[context.currentChatUser._id] && (
                                        <div className="online-pulse absolute bottom-[1px] right-[1px] w-2.5 h-2.5 rounded-full bg-success border-2 border-surface-800" />
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[15px] font-semibold text-text-primary">
                                        {context.currentChatUser.username}
                                    </span>
                                    {chatUsersInfo[currentChatId]?.typing ? (
                                        <span className="text-xs text-success font-medium">typing...</span>
                                    ) : (
                                        <span className="text-xs text-text-dim">
                                            {onlineStatus[context.currentChatUser._id] ? 'Online' : 'Offline'}
                                        </span>
                                    )}
                                </div>
                            </nav>

                            {isMedia ? (
                                <MediaPreview
                                    isMedia={isMedia}
                                    handleSend={handleSend}
                                    message={message}
                                    setMessage={setMessage}
                                />
                            ) : currentPreviewFile ? (
                                <SingleFilePreview />
                            ) : (
                                <>
                                    <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-6 pt-6 pb-2 z-[1] custom-scroll">
                                        {messages[currentChatId]?.map((msg) => (
                                            <Message key={msg._id} msg={msg} />
                                        ))}
                                        <div ref={messageEndRef} />
                                    </div>

                                    <footer className="z-10 flex items-center gap-3 h-20 px-5 border-t border-white/[0.06] bg-surface-800/90 backdrop-blur-xl">
                                        <div className="msg-input-wrap flex flex-1 items-center gap-2 bg-surface-700 border border-white/[0.06] rounded-2xl px-1 pr-1.5 transition-all">
                                            <FileUpload />
                                            <input
                                                type="text"
                                                value={message}
                                                onChange={handleTyping}
                                                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend(e)}
                                                placeholder="Type a message…"
                                                className="flex-1 bg-transparent border-none outline-none text-text-primary text-sm py-3.5 px-2"
                                            />
                                        </div>
                                        <button onClick={handleSend} className="w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-r from-indigo-500 to-violet-500">
                                            <Send size={18} className="text-white" />
                                        </button>
                                    </footer>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center w-full h-full gap-4">
                            <MessageCircle size={48} className="text-accent-light" />
                            <h1 className="text-xl font-bold text-text-primary">Select a Conversation</h1>
                            <p className="text-sm text-text-dim text-center max-w-[280px]">
                                Choose from your active sidebar contacts to start chatting.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ChatHome;
