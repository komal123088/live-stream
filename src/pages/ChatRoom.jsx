import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { auth, database } from "../firebase";
import {
  ref,
  onValue,
  push,
  set,
  serverTimestamp,
  update,
  get,
} from "firebase/database";
import { getUserById } from "../services/userService";
import BottomNav from "../components/BottomNav";

export default function ChatRoom() {
  const { id: otherUserId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherUser, setOtherUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const messagesEndRef = useRef(null);
  const currentUser = auth.currentUser;

  const conversationId =
    currentUser?.uid < otherUserId
      ? `${currentUser.uid}_${otherUserId}`
      : `${otherUserId}_${currentUser.uid}`;

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  // Fetch other user
  useEffect(() => {
    const fetchOtherUser = async () => {
      const user = await getUserById(otherUserId);
      setOtherUser(user);
    };
    fetchOtherUser();
  }, [otherUserId]);

  // Listen to messages
  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    const messagesRef = ref(database, `chats/${conversationId}/messages`);
    const userChatRef = ref(
      database,
      `userChats/${currentUser.uid}/${conversationId}`
    );

    const unsubscribe = onValue(messagesRef, async (snapshot) => {
      const msgs = [];
      snapshot.forEach((child) => {
        msgs.push({ id: child.key, ...child.val() });
      });
      setMessages(msgs);
      setLoading(false);

      // Reset unread count when user opens the chat
      if (snapshot.exists()) {
        await update(userChatRef, {
          unreadCount: 0,
        });
      }
    });

    return () => unsubscribe();
  }, [conversationId, currentUser, navigate]);

  useEffect(() => {
    if (messages.length > 0) scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      const messagesRef = ref(database, `chats/${conversationId}/messages`);
      const newMsgRef = push(messagesRef);

      await set(newMsgRef, {
        text: newMessage,
        senderId: currentUser.uid,
        createdAt: serverTimestamp(),
      });

      const convRef = ref(database, `chats/${conversationId}`);
      await update(convRef, {
        lastMessage: newMessage,
        lastMessageTime: serverTimestamp(),
        lastMessageSender: currentUser.uid,
      });

      // Update sender's chat list
      await set(
        ref(database, `userChats/${currentUser.uid}/${conversationId}`),
        {
          otherUserId,
          lastMessage: newMessage,
          lastMessageTime: serverTimestamp(),
          lastMessageSender: currentUser.uid,
          unreadCount: 0,
        }
      );

      // Update receiver's chat list + increment unread
      const receiverChatRef = ref(
        database,
        `userChats/${otherUserId}/${conversationId}`
      );
      const receiverData = (await get(receiverChatRef)).val() || {};
      await update(receiverChatRef, {
        otherUserId: currentUser.uid,
        lastMessage: newMessage,
        lastMessageTime: serverTimestamp(),
        lastMessageSender: currentUser.uid,
        unreadCount: (receiverData.unreadCount || 0) + 1,
      });

      setNewMessage("");
      scrollToBottom();
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  if (loading) {
    return (
      <div className="chat-loading">
        <div className="spinner-border text-pink"></div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          ←
        </button>
        <img
          src={otherUser?.profilePic || "https://via.placeholder.com/40"}
          alt={otherUser?.name}
          className="chat-header-avatar"
        />
        <h3>{otherUser?.name || "Chat"}</h3>
      </div>

      <div className="messages-list">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message ${
              msg.senderId === currentUser.uid ? "sent" : "received"
            }`}
          >
            <p>{msg.text}</p>
            <span className="timestamp">
              {msg.createdAt
                ? new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : ""}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form className="message-input" onSubmit={handleSend}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>

      <BottomNav active="chat" />
    </div>
  );
}
