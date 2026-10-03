export default async function getOrCreateConversation(otherUserId) {
  try {
    const conversationExists = await fetch(
      `/api/chat/conversations/get/${otherUserId}`,
    )
    const conversationId = await conversationExists.json()
    if (conversationExists.status === 404) {
      const createConversation = await fetch('/api/chat/conversations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ otherUserId: otherUserId }),
      })
      const ConversationId = await createConversation.json()
      return ConversationId
    }
    return conversationId.id
  } catch (err) {
    console.error(err)
    throw err
  }
}
