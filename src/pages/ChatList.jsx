import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { auth, database } from "../firebase";
import { ref, onValue, remove } from "firebase/database";
import { getUserById } from "../services/userService";
import BottomNav from "../components/BottomNav";

export default function ChatList() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    convId: null,
  });
  const navigate = useNavigate();
  const currentUser = auth.currentUser;
  const contextMenuRef = useRef(null);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    const userChatsRef = ref(database, `userChats/${currentUser.uid}`);

    const unsubscribe = onValue(userChatsRef, async (snapshot) => {
      const chatList = [];
      const promises = [];

      snapshot.forEach((child) => {
        const chatData = child.val();
        const convId = child.key;
        const otherUserId = chatData.otherUserId;

        promises.push(
          getUserById(otherUserId)
            .then((user) => {
              if (user) {
                chatList.push({
                  id: convId,
                  otherUserId,
                  otherUserName: user.name || "Unknown",
                  otherUserPic:
                    user.profilePic || "https://via.placeholder.com/50",
                  lastMessage: chatData.lastMessage || "No messages yet",
                  lastMessageTime: chatData.lastMessageTime || 0,
                  unreadCount: chatData.unreadCount || 0,
                });
              }
            })
            .catch((err) =>
              console.error("Failed to fetch user", otherUserId, err)
            )
        );
      });

      await Promise.all(promises);
      chatList.sort((a, b) => b.lastMessageTime - a.lastMessageTime);
      setChats(chatList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, navigate]);

  const handleDeleteChat = async (convId) => {
    if (!window.confirm("Are you sure you want to delete this chat?")) return;
    try {
      await remove(ref(database, `userChats/${currentUser.uid}/${convId}`));
      console.log("Chat deleted:", convId);
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete chat");
    }
  };

  // Show context menu
  const showContextMenu = (e, convId) => {
    e.preventDefault(); // Prevent default browser context menu
    e.stopPropagation();

    // For touch events, use touches[0] if available
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    setContextMenu({
      visible: true,
      x: clientX,
      y: clientY,
      convId,
    });
  };

  // Hide on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(e.target)
      ) {
        setContextMenu({ visible: false, x: 0, y: 0, convId: null });
      }
    };

    document.addEventListener("click", handleClickOutside);
    document.addEventListener("touchend", handleClickOutside); // For mobile
    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("touchend", handleClickOutside);
    };
  }, []);

  if (loading) {
    return (
      <div className="chatlist-loading">
        <div className="spinner-border text-pink"></div>
      </div>
    );
  }

  return (
    <div className="chatlist-container">
      <h2>Messages</h2>
      {chats.length === 0 ? (
        <div className="no-chats">
          <p>No conversations yet. Start chatting!</p>
        </div>
      ) : (
        <div className="chatlist-items">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className="chat-item"
              onClick={() => navigate(`/chat/${chat.otherUserId}`)}
              onContextMenu={(e) => showContextMenu(e, chat.id)} // Desktop right-click
              onTouchStart={(e) => {
                // Mobile long press (600ms)
                const timer = setTimeout(() => {
                  showContextMenu(e, chat.id);
                }, 600);
                e.currentTarget.addEventListener(
                  "touchend",
                  () => clearTimeout(timer),
                  { once: true }
                );
                e.currentTarget.addEventListener(
                  "touchmove",
                  () => clearTimeout(timer),
                  { once: true }
                );
              }}
            >
              <img
                src={chat.otherUserPic}
                alt={chat.otherUserName}
                className="chat-avatar"
                onError={(e) =>
                  (e.target.src = "https://via.placeholder.com/50")
                }
              />
              <div className="chat-info">
                <h4>{chat.otherUserName}</h4>
                <p className="last-message">{chat.lastMessage}</p>
              </div>

              <div className="chat-actions">
                <span className="chat-timestamp">
                  {chat.lastMessageTime
                    ? new Date(chat.lastMessageTime).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""}
                </span>

                {chat.unreadCount > 0 && (
                  <span className="unread-badge">
                    {chat.unreadCount > 99 ? "99+" : chat.unreadCount}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Custom Context Menu */}
      {contextMenu.visible && (
        <div
          ref={contextMenuRef}
          className="context-menu"
          style={{
            position: "fixed",
            top: `${contextMenu.y}px`,
            left: `${contextMenu.x}px`,
            zIndex: 1000,
          }}
        >
          <button
            onClick={() => {
              handleDeleteChat(contextMenu.convId);
              setContextMenu({ visible: false, x: 0, y: 0, convId: null });
            }}
          >
            Delete Chat
          </button>
        </div>
      )}

      <BottomNav active="messages" />
    </div>
  );
}
