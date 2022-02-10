import React, { useEffect, useRef, useState } from "react";
import { useChannel } from "./useChannel";
import styles from "./Chat.module.css";
import { Types } from "ably/ably";

function Chat() {
  const inputBox = useRef<HTMLTextAreaElement>(null);
  const messageEnd = useRef<HTMLDivElement>(null);
  const [messageText, setMessageText] = useState("");
  const [receivedMessages, setMessages] = useState<Types.Message[]>([]);
  const messageTextIsEmpty = messageText.trim().length === 0;

  const [channel, ably] = useChannel("chat-demo", (message) => {
    // Here we're computing the state that'll be drawn into the message history
    // We do that by slicing the last 199 messages from the receivedMessages buffer

    const history = receivedMessages.slice(-199);
    setMessages([...history, message]);

    // Then finally, we take the message history, and combine it with the new message
    // This means we'll always have up to 199 message + 1 new message, stored using the
    // setMessages react useState hook
  });

  const sendChatMessage = async (messageText: string) => {
    channel.publish({ name: "chat-message", data: messageText });
    setMessageText("");
    inputBox.current?.focus();
  };

  const handleFormSubmission = (event: React.SyntheticEvent) => {
    event.preventDefault();
    sendChatMessage(messageText);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.code !== "Backspace" || messageTextIsEmpty) {
      return;
    }
    sendChatMessage(messageText);
    event.preventDefault();
  };

  const messages = receivedMessages.map((message, index) => {
    const author = message.connectionId === ably.connection.id ? "me" : "other";
    return (
      <span key={index} className={styles.message} data-author={author}>
        {message.data}
      </span>
    );
  });

  useEffect(() => {
    messageEnd.current?.scrollIntoView({ behavior: "smooth" });
  });

  return (
    <div className={styles.chatHolder}>
      <div className={styles.chatText}>
        {messages}
        <div ref={messageEnd}></div>
      </div>
      <form onSubmit={handleFormSubmission} className={styles.form}>
        <textarea
          ref={inputBox}
          value={messageText}
          placeholder="Type a message..."
          onChange={(e) => setMessageText(e.target.value)}
          onKeyPress={handleKeyPress}
          className={styles.textarea}
        ></textarea>
        <button type="submit" className={styles.button} disabled={messageTextIsEmpty}>
          Send
        </button>
      </form>
    </div>
  );
}

export default Chat;
