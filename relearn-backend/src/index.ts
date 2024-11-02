import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import bcrypt from 'bcrypt'
import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken'
import bodyParser from "body-parser";
import { predictMarks } from "./utils/predict";
import Plot from 'plotly.js';
dotenv.config();

const prisma = new PrismaClient();
const app: Express = express();
const port = process.env.PORT;
app.use(bodyParser.json());

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

app.post('/auth/registration', async({req, res}: any) => {
  const {  username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 15)
  try{
    const user = await prisma.user.create({
      data: { username, emailAddress: email, password: hashedPassword}, 
    });
    res.status(201).json({message: "Registration Successful", user});
  } catch( error: any){
    res.status(500).json({ message: 'Registration failed', error: error.message || "Server Error" });
  }
});

app.post('/transcripts/send', authenticateUser, async (req: any, res: any) => {
  const { modules, marks } = req.body;
  // Validate input
  if (!Array.isArray(modules) || !Array.isArray(marks) || modules.length !== marks.length) {
      return res.status(400).json({ error: "Modules and marks arrays are required and must be the same length." });
  }

  // Generate predicted marks (e.g., increase for illustration purposes)
  const predictedMarks = await predictMarks(modules, marks);

  // Chart configuration
  const data = [
    {
      x: modules,
      y: marks,
      type: 'bar',
      name: 'Previous Marks',
      marker: { color: `rgba(54, 162, 235, 0.7)`}
    },
    {
      x: modules,
      y: marks,
      type: 'bar',
      name: 'Predicted Marks',
      marker: { color: `rgba(255, 99, 132, 0.7)`}
    },
  ];
  const layout  = {
    title: 'Transcript Analysis with Predicted Marks',
    xaxis: {title: 'Modules'},
    yaxis: {title: 'Marks', range: [0, 100]},
    barmode: 'group'
  }
  const imgOpts = { format: 'png', width: 800, height: 400 };
 Plot.newPlot('chart', data, layout, imgOpts).then((image: any)=> {
  res.set('Content-Type', 'image/png');
  res.send(image)
 }).catch ((error: any) => {
      res.status(500).json({ error: "Failed to generate transcript chart." });
  })
});
app.post('/transcripts/process', authenticateUser, ({req, res}: any) => {

});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});