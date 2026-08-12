const normalize = (text = "") => text.toLowerCase().trim();

export const getGuffAssistantReply = (message) => {
  const question = normalize(message);

  if (!question || /^(hi|hello|hey|help)\b/.test(question)) {
    return "Hi! I’m Guff Assistant. Ask me about messages, posts, profiles, the map, notifications, or audio-call testing.";
  }
  if (/(audio|call|phone|microphone|mic)/.test(question)) {
    return "To test an audio call, open a direct message, tap the green phone button, and have the other signed-in user accept. Both people must allow microphone access. Test calls may not connect on restrictive networks.";
  }
  if (/(message|chat|dm|direct)/.test(question)) {
    return "Open Messages, choose a member under Direct Messages, and type your note. Unread conversations are highlighted and the Messages tab shows how many people have new messages.";
  }
  if (/(post|feed|share)/.test(question)) {
    return "Use New Post from the feed or desktop navigation. You can include text, a photo, and a location before publishing.";
  }
  if (/(map|location|place|restaurant|shop)/.test(question)) {
    return "Open Explore Map to search for a place, then select it to attach that location to a post or message.";
  }
  if (/(profile|follow|user)/.test(question)) {
    return "Tap a member’s name or avatar to view their profile. From there you can follow them or open a private conversation.";
  }
  if (/(notification|new|unread)/.test(question)) {
    return "New direct messages highlight their conversation and show a count. Opening that conversation marks its message notifications as read.";
  }

  return "I’m a built-in help assistant, so I can guide you around Guff but I don’t use an external AI service. Try asking about messages, posts, profiles, the map, notifications, or audio calls.";
};
