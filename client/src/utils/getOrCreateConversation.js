export default async function getOrCreateConversation(otherUserId) {
  try {
    const conversationExists = await fetch(
      `${import.meta.env.VITE_API_URL}/api/chat/conversations/get/${otherUserId}`,
      {
        credentials: 'include',
      },
    )

    const conversationId = await conversationExists.json()

    if (conversationExists.status === 404) {
      const createConversation = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chat/conversations`,
        {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ otherUserId: otherUserId }),
        },
      )

      const ConversationId = await createConversation.json()
      return ConversationId
    }

    return conversationId.id
  } catch (err) {
    console.error(err)
    throw err
  }
}
