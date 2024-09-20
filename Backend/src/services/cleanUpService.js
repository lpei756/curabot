import ChatSession from '../models/ChatSession.js';

 export const deleteOldChatHistories = async () => {
   try {
     const oneYearAgo = new Date();
     oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
     const result = await ChatSession.deleteMany({ createdAt: { $lt: oneYearAgo } });
   } catch (error) {
     console.error('Error deleting old chat histories:', error);
   }
 };