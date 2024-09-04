import ChatSession from '../models/ChatSession.js';

 // Function to delete chat histories older than 1 year
 export const deleteOldChatHistories = async () => {
   try {
     const oneYearAgo = new Date();
     oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
     const result = await ChatSession.deleteMany({ createdAt: { $lt: oneYearAgo } });
     console.log(`Deleted ${result.deletedCount} old chat sessions.`);
   } catch (error) {
     console.error('Error deleting old chat histories:', error);
   }
 };