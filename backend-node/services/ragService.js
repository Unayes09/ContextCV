const { Pinecone } = require('@pinecone-database/pinecone');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Clients
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index(process.env.PINECONE_INDEX);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const ragService = {
  
  /**
   * 1. GET EMBEDDING (Updated for Pinecone Llama Inference)
   */
  async getEmbedding(text, isQuery = false) {
    try {
      const result = await pc.inference.embed(
        "llama-text-embed-v2",
        [text],
        { 
          // Use "query" for searching, "passage" for storing the README
          input_type: isQuery ? "query" : "passage", 
          dimension: 768 // Matches your 768-dim index exactly
        }
      );
      
      // Pinecone returns an array of vectors; we return the first one
      return result.data[0].values;
    } catch (error) {
      console.error("Embedding Error:", error);
      throw error;
    }
  },

  /**
   * 2. SYNC TO PINECONE (For User A: Saving/Updating Readme)
   */
  async syncToPinecone(userId, content) {
    // Generate the vector using 'passage' mode
    const values = await this.getEmbedding(content, false);
    
    await index.upsert([{
      id: userId.toString(),
      values: values,
      metadata: { text: content } // Store the text so the bot can read it later
    }]);
  },

  /**
   * 3. GET CONTEXT (Updated to fetch full profile directly)
   */
  async getContext(question, targetUserId) {
    try {
      // Since we store one vector per user (the whole README), 
      // we can fetch by ID directly instead of semantic search.
      // This guarantees we get the user's data without metadata filtering issues.
      const fetchResponse = await index.fetch([targetUserId]);
      
      const record = fetchResponse.records[targetUserId];
      if (record && record.metadata && record.metadata.text) {
        return record.metadata.text;
      }
      
      return "";
    } catch (error) {
      console.error("Error fetching context:", error);
      return "";
    }
  }
};

module.exports = ragService;