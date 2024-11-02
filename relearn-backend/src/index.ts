import express, { Express, Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import bodyParser from "body-parser";
import { PrismaClient } from "@prisma/client";
import multer from 'multer';
import pdf from 'pdf-parse';
import Tesseract from 'tesseract.js';
import { parseTranscriptText } from "./utils/transcriptToText";
import { review } from "./utils/review";
import cors from 'cors';
import path from "path";
import axios from "axios";

dotenv.config();

const prisma = new PrismaClient();
const app: Express = express();
const port = process.env.PORT || 3000;
app.use(bodyParser.json());
app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage });

type StudentInfo = {
    name: string;
    studentNumber: string;
    idNumber: string;
    qualification: string;
    nqfLevel: number;
    minimumCredits: number;
    saqaId: number;
    conduct: string;
    languageOfInstruction: string;
    cumulativeAverage: string;
    totalCumulativeCredits: number;
};

const authenticateUser = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies?.token;
    if (!token) {
        res.status(401).json({ message: "Unauthorized, no token provided" });
        return;
    }

    try {
        const payload = jwt.verify(token, process.env.JSON_WEB_TOKEN as string) as { userId: string };
        (req as any).userId = payload.userId;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });
    }
};

app.post('/auth/login', async (req: any, res: any) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { emailAddress: email } });

        if (!user || !(await bcrypt.compare(password, user.password || ""))) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user.id }, process.env.JSON_WEB_TOKEN as string, { expiresIn: '1h' });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600000,
            sameSite: "strict"
        });
        res.status(200).json({ message: "Login successful", user, token });
    } catch (error: any) {
        res.status(500).json({ message: "Login failed", error: error.message || "Server Error" });
    }
});

app.post('/auth/registration', async (req: Request, res: Response) => {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
        const user = await prisma.user.create({
            data: { username, emailAddress: email, password: hashedPassword },
        });
        res.status(201).json({ message: "Registration Successful", user });
    } catch (error: any) {
        res.status(500).json({ message: "Registration failed", error: error.message || "Server Error" });
    }
});

app.post('/transcripts/send', upload.single('file'), async (req: any, res: any) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }

    try {
        const data = await pdf(req.file.buffer);
        const text = data.text;
        const predictedMarks = await predictMarks(text);
        res.status(200).json({ text, predictedMarks});
    } catch (error) {
        res.status(500).json({ error: 'Error reading PDF file.' });
    }
});

app.post('/transcripts/review', async (req: any, res: any) => {
    const { modules, marks, semestersPassed, numOfSemesters } = req.body;
    if (!Array.isArray(modules) || !Array.isArray(marks) || modules.length !== marks.length) {
        return res.status(400).json({ error: "Modules and marks arrays are required and must be the same length." });
    }
    try {
        const feedback = await review(modules, marks, semestersPassed, numOfSemesters);
        res.status(200).json({ feedback });
    } catch (error) {
        res.status(500).json({ error: "An error occurred while processing the review." });
    }
});

app.listen(port, () => {
    console.log(`[server]: Server is running at http://localhost:${port}`);
});

const predictMarks = async (text: string) => {
    const prompt = `
      Given the transcript text: "${text}", extract the modules and marks. 
      Determine the semesters that have passed by analyzing the text and the number of semesters expected in total.
      Predict the marks for the remaining modules based on past performance.
      Just return it in json format. No text just JSON. Give feedback on modules that are below and at the average. Provide suggestions to fix the problem.
      Respond only in the following JSON format without any additional text:
      {
        "predictedMarks": [
          { "module": "Module Name", "predictedMark": 90 },
          ...
        ],  
        "modulesToFocus": [
          { "module": "Module Name", "topics": ["Topic1", "Topic2"] }
        ],
        "suggestion": {
          "module": "Module Name",
          "text": "Focus on improving your understanding of the topics listed."
        }
      }
    `;

    try {
        const response = await axios.post(
            'https://api.openai.com/v1/chat/completions',
            {
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 2000 // Adjust token limit based on response length
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        const content = response.data.choices[0].message.content;

        // Attempt to parse the response as JSON
        let predictedMarks;
        try {
            predictedMarks = JSON.parse(content);
            // Validate the structure of the parsed JSON
            if (!predictedMarks.predictedMarks || !predictedMarks.modulesToFocus || !predictedMarks.suggestion) {
                throw new Error("Invalid response structure");
            }
        } catch (error) {
            console.error("Failed to parse predicted marks as JSON:", error);
            console.log("Raw Response Content:", content); // Log content for debugging
            return { error: "Failed to parse response as JSON", rawContent: content };
        }

        console.log(predictedMarks); // Log the parsed JSON object
        return predictedMarks;

    } catch (error: any) {
        console.error("Error predicting marks:", error);
        return { error: "Error predicting marks", details: error.message }; // Standardized error response
    }
};