import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import bodyParser from "body-parser";
import { predictMarks } from "./utils/predict";
import { PrismaClient } from "@prisma/client";
import multer from 'multer';
import pdf from 'pdf-parse';
import Tesseract from 'tesseract.js';
import { parseTranscriptText } from "./utils/transcriptToText";
dotenv.config();

const prisma = new PrismaClient;
const app: Express = express();
const port = process.env.PORT;
app.use(bodyParser.json());

//process upload from frontend
const upload = multer({ storage: multer.memoryStorage() }); 
/** Middleware */
const authenticateUser = (req: express.Request, res: express.Response, next: express.NextFunction): void => { 
  const token = req.cookies?.token;
  if (!token) {
    res.status(401).json({ message: "Unauthorized, no token provided" });
    return;
  }

  try {
    const payload = jwt.verify(token, process.env.JSON_WEB_TOKEN as string) as { userId: string};
    (req as any).userId = payload.userId; //attach userId to req
    next();
  } catch(error: any) {
    if (error instanceof jwt.JsonWebTokenError) {
       res.status(401).json({ message: "Invalid token" });
    }
    res.status(500).json({ message: "Failed to authenticate" });
  }
};

app.post('/auth/login', authenticateUser, async(req: any, res: any) =>{
  const { email, password } = req.body;
    try {
      const user = await prisma.user.findUnique({where: { emailAddress: email  }});

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      const isPasswordValid = await bcrypt.compare(password, user.password || "");
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ userId: user.id}, process.env.JSON_WEB_TOKEN as string, { expiresIn: '1hr'});
      res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          maxAge: 3600000,
          sameSite: "strict"
      })
      res.status(200).json({ message: "Login successful", user, token });
    } catch (error: any) {
      res.status(500).json({ message: "Login failed", error: error.message || "Server Error" });
    }
});

app.post('/auth/registration', async(req: any, res: any) => {
  const {  username, email, password } = req.body;
  console.log(username)
  console.log(email)
  console.log(password)
  const hashedPassword = await bcrypt.hash(password, 15)
  try{
    const user = await prisma.user.create({
      data: { username, emailAddress: email, password: hashedPassword}, 
    });
    res.status(201).json({message: "Registration Successful", user});
  } catch( error: any){
    console.error("Error creating user:", error);
    res.status(500).json({ message: 'Registration failed', error: error.message || "Server Error" });
  }
});


app.post('/transcripts/send', upload.single('transcript'), async (req: any, res: any) => {
  try {
      // Check if a file was uploaded
      if (!req.file) {
          return res.status(400).json({ error: "No transcript file provided." });
      }

      let modules: string[] = [];
      let marks: number[] = [];
      let semestersPassed = 0; // Set a default or extract from the text
      let numOfSemesters = 0;  // Set a default or extract from the text

      // Determine file type and extract text accordingly
      const fileType = req.file.mimetype;

      if (fileType === 'application/pdf') {
          // Extract text from PDF
          const dataBuffer = req.file.buffer;
          const pdfData = await pdf(dataBuffer);
          const pdfText = pdfData.text;

          // Parse the PDF text to extract modules and marks
          ({ modules, marks, semestersPassed, numOfSemesters } = await parseTranscriptText(pdfText));

      } else if (fileType.startsWith('image/')) {
          // Extract text from image using Tesseract
          const imageData = req.file.buffer;

          const { data: { text } } = await Tesseract.recognize(imageData, 'eng', {
              logger: info => console.log(info) // Log progress
          });

          // Parse the OCR text to extract modules and marks
          ({ modules, marks, semestersPassed, numOfSemesters } = await parseTranscriptText(text));
      } else {
          return res.status(400).json({ error: "Unsupported file type. Please upload a PDF or an image." });
      }

      // Validate input
      if (!Array.isArray(modules) || !Array.isArray(marks) || modules.length !== marks.length) {
          return res.status(400).json({ error: "Modules and marks arrays are required and must be the same length." });
      }

      // Generate predicted marks
      const predictedMarks = await predictMarks(modules, marks, semestersPassed, numOfSemesters);

      // Prepare the response data
      const responseData = {
          modules,
          previousMarks: marks,
          predictedMarks
      };

      // Return the response as JSON
      res.status(200).json(responseData);
  } catch (error) {
      console.error("Error processing transcript:", error);
      res.status(500).json({ error: "An error occurred while processing the transcript." });
  }
});


app.post('/transcripts/review', (req: any, res: any) => {

});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});