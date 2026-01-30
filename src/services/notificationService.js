import { ref, onValue, query, limitToLast } from "firebase/database";
import { database } from "../firebase";

let lastNotifiedMessage = {};

export const setupNewMessageNotifications = (currentUserId) => {
  if (!currentUserId) return () => {};

  const userChatsRef = ref(database, `userChats/${currentUserId}`);

  const unsubscribe = onValue(userChatsRef, (snapshot) => {
    snapshot.forEach((child) => {
      const chatData = child.val();
      const convId = child.key;
      const unread = chatData.unreadCount || 0;

      if (unread > 0 && chatData.lastMessageSender !== currentUserId) {
        const lastMsgQuery = query(
          ref(database, `chats/${convId}/messages`),
          limitToLast(1)
        );

        onValue(lastMsgQuery, (msgSnap) => {
          if (!msgSnap.exists()) return;

          msgSnap.forEach(async (msgChild) => {
            const msg = msgChild.val();
            const msgId = msgChild.key;

            // Avoid duplicate notifications
            if (
              lastNotifiedMessage[convId] === msgId ||
              msg.senderId === currentUserId
            ) {
              return;
            }

            lastNotifiedMessage[convId] = msgId;

            // Show browser notification
            if (Notification.permission === "granted") {
              const notification = new Notification(
                `New message from ${chatData.otherUserName || "Someone"}`,
                {
                  body: msg.text,
                  icon: chatData.otherUserPic || "/logo.png",
                }
              );

              // Play notification sound
              try {
                const audio = new Audio("/sounds/notification.mp3");
                await audio.play();
              } catch (e) {
                console.log("Audio play failed:", e);
              }
            }
          });
        });
      }
    });
  });

  return unsubscribe;
};
