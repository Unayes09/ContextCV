require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const ragService = require('./services/ragService');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: "Malformed JSON received" });
  }
  next();
});
connectDB();

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Hero Portfolio API',
      version: '1.0.0',
      description: 'API documentation for Hero Portfolio Backend Node',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Local server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/portfolio', require('./routes/portfolioRoutes'));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

io.on('connection', (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on('chat_with_bot', async ({ targetUserId, question }) => {
    // console.log(`[${socket.id}] chat_with_bot received:`, { targetUserId, question });
    
    try {
      console.log(`[${socket.id}] Fetching RAG context...`);
      const context = await ragService.getContext(question, targetUserId);
    //   console.log(`[${socket.id}] Context retrieved (length: ${context?.length || 0})`);
      
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
      
      const systemInstruction = `
      You are the owner of this portfolio.
      Your profile content is provided below.
      
      Instructions:
      1. Answer in the first person ("I", "my").
      2. Use ONLY the provided Context to answer.
      3. If the answer is not in the context, say "I haven't included that in my portfolio yet."
      4. Be friendly and professional.
      
      Context:
      ${context}
      `;

      const prompt = `${systemInstruction}\n\nVisitor Question: ${question}\n\nAnswer:`;
      // console.log(`[${socket.id}] Sending prompt to Gemini...`);
      
      const result = await model.generateContentStream(prompt);

      let chunkCount = 0;
      for await (const chunk of result.stream) {
        const text = chunk.text();
        // console.log(`[${socket.id}] Stream chunk received:`, text.substring(0, 50) + "...");
        socket.emit('bot_stream', text);
        chunkCount++;
      }
      console.log(`[${socket.id}] Streaming complete. Chunks sent: ${chunkCount}`);
      
    } catch (err) {
      console.error(`[${socket.id}] Error in chat_with_bot:`, err);
      socket.emit('error', "AI error: " + err.message);
    }
  });
});

server.listen(process.env.PORT || 5000, () => console.log("🚀 Server Ready"));