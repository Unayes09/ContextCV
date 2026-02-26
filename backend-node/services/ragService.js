const { Pinecone } = require('@pinecone-database/pinecone');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Clients
const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
const index = pc.index(process.env.PINECONE_INDEX);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const ragService = {
  
  /**
   * Helper: Split markdown into chunks
   */
  chunkMarkdown(text, maxLength = 1000) {
    // 1. Try to split by headers (handles both \n and \r\n)
    let sections = text.split(/\r?\n(?=#{1,6} )/);
    
    // If no headers were found, split by double newlines
    if (sections.length <= 1) {
      sections = text.split(/\r?\n\r?\n/);
    }

    const chunks = [];
    let currentChunk = "";

    for (const section of sections) {
      if (section.length > maxLength) {
        if (currentChunk) {
          chunks.push(currentChunk.trim());
          currentChunk = "";
        }
        let remaining = section;
        while (remaining.length > 0) {
          chunks.push(remaining.substring(0, maxLength).trim());
          remaining = remaining.substring(maxLength);
        }
      } else if ((currentChunk + section).length > maxLength && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = section;
      } else {
        currentChunk += (currentChunk ? "\n\n" : "") + section;
      }
    }
    
    if (currentChunk) chunks.push(currentChunk.trim());
    return chunks.filter(c => c.length > 0);
  },

  /**
   * 1. GET EMBEDDING
   */
  async getEmbedding(text, isQuery = false) {
    try {
      const result = await pc.inference.embed(
        "llama-text-embed-v2",
        [text],
        { 
          input_type: isQuery ? "query" : "passage", 
          dimension: 768 
        }
      );
      return result.data[0].values;
    } catch (error) {
      console.error("Embedding Error:", error);
      throw error;
    }
  },

  /**
   * 2. SYNC TO PINECONE (Optimized with Chunking and Metadata)
   */
  async syncToPinecone(userId, content) {
    try {
      const uid = userId.toString().trim();
      console.log(`--- SYNC START for user: "${uid}" ---`);
      
      // 1. Delete old vectors
      try {
        await index.deleteMany({ filter: { userId: { '$eq': uid } } });
      } catch (e) {
        console.log("Delete filter skipped");
      }

      // 2. Chunk the new content
      const chunks = this.chunkMarkdown(content);
      console.log(`Created ${chunks.length} chunks`);
      const vectors = [];

      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const values = await this.getEmbedding(chunk, false);
        
        const metadata = { 
          userId: uid, 
          text: chunk,
          chunkIndex: i
        };

        console.log(`Chunk ${i} metadata check:`, JSON.stringify(metadata).substring(0, 100));

        vectors.push({
          id: `${uid}_${i}_${Date.now()}`, // Added timestamp to ensure uniqueness
          values: values,
          metadata: metadata
        });
      }

      // 3. Batch upsert
      if (vectors.length > 0) {
        await index.upsert(vectors);
        console.log(`--- SYNC COMPLETE: Upserted ${vectors.length} vectors ---`);
      }
    } catch (error) {
      console.error("Sync Error:", error);
      throw error;
    }
  },

  /**
   * 3. GET CONTEXT (Semantic Search with Metadata Filter)
   */
  async getContext(question, targetUserId) {
    try {
      const uid = targetUserId.toString().trim();
      console.log(`--- QUERY START for user: "${uid}" ---`);
      
      const queryVector = await this.getEmbedding(question, true);
      
      const queryResponse = await index.query({
        vector: queryVector,
        topK: 5,
        filter: { userId: { '$eq': uid } },
        includeMetadata: true
      });

      console.log(`Matches found with filter: ${queryResponse.matches?.length || 0}`);

      if (!queryResponse.matches || queryResponse.matches.length === 0) {
        // Fallback: search without filter to debug what's in the index
        console.log("DEBUG: Searching without filter to see what's available...");
        const debugQuery = await index.query({
          vector: queryVector,
          topK: 3,
          includeMetadata: true
        });
        
        if (debugQuery.matches && debugQuery.matches.length > 0) {
          console.log("Top unfiltered match metadata:", JSON.stringify(debugQuery.matches[0].metadata));
        }
        return "I haven't included that specific detail in my portfolio yet.";
      }

      const contextText = queryResponse.matches
        .map(match => match.metadata.text)
        .join("\n\n---\n\n");

      return contextText;
    } catch (error) {
      console.error("Error fetching context:", error);
      return "";
    }
  }
};

module.exports = ragService;