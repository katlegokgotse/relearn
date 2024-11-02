import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import bcrypt from 'bcrypt'
import { PrismaClient } from "@prisma/client";
import jwt from 'jsonwebtoken'

dotenv.config();

const prisma = new PrismaClient();
const app: Express = express();
const port = process.env.PORT;

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

app.post('/auth/login', async(req: any, res: any) =>{
  const { email, password } = req.body;
    try {
      const user = await prisma.user.findUnique({where: { email }});

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
  const { name, username, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 15)
  try{
    const user = await prisma.user.create({
      data: {name, username, email, password: hashedPassword}, 
    });
    res.status(201).json({message: "Registration Successful", user});
  } catch( error: any){
    res.status(500).json({ message: 'Registration failed', error: error.message || "Server Error" });
  }
});

app.post('/transcripts/send', ({req, res}: any)=>{

});

app.post('/transcripts/read', ({req, res}: any) => {

});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});