## 1. Introduction
- **Purpose**:  When asked to look into the future or stay in present most people will say they would like to see how the future looks. The questions of "Where do you find yourself in 5 years?" or "What do you think the stock will be in 10 years." So looking into the future has always been an inherent desire for humanity. Every learner has been at a point where they don't know the outcome or result of their future regardless of effort they have put into it. ReLearn is an application that will allow students to be able to peek into the future.
- **Scope: **ReLearn is basically a student management tool that does  one thing. Manage students instead of students trying to manage their lives with it. This project manages the lives and marks of particular students
## 2. System Overview
- **Application Description**: Provide a high-level overview of the application.
- **Primary Focus**: Personalized academic assistance and Predictive academic overview
## 3. Architecture Design
- **System Architecture**: **Next.js**: This is the frontend framework that will power the user interface, enabling smooth navigation and interactions. **Express**: The backend server that handles requests, manages API routes, and performs data processing tasks. **Prisma**: The ORM (Object-Relational Mapper) that connects the backend with the database, handling data schema management and database queries in a streamlined way..
- **Component Diagram**:[﻿ Relearn Mockups](https://www.figma.com/design/wonwTbMYRLmnHg9E1Pz8G4/Hackathon?node-id=0-1&t=PFI5JhNMqL5QaKq4-1) 
## 4. Detailed Design
### 4.1. User Interface
- **Components**: Describe UI components such as graphs, charts, and form inputs.
- **User Experience**: **Login and Registration**: Allowing students to create accounts and log in. **Dashboard**: Providing an overview of current academic performance, predictions, and suggestions.**Report Generation**: Enabling students to view detailed breakdowns of their progress and future projections.
### 4.2. Backend Services
- **Express Server**: 
    - **/auth** - This route is used to authenticates users.
    - **/transcripts** - This route processes and returns user academic data.
    - **/predictions** - This route retrieves predictive analysis based on user data.
- **Data Handling**: Explain how transcripts are processed and stored using Prisma.
### 4.3. AI Model
- **Model Type**: ChatGPT 4o Mini will be used to be aimed at predicting outcomes based on provided academic data. You might expand on what specific type of predictions or academic assistance it offers
- **Data Sources**: Historical academic data and user-provided transcripts.
- **Integration**: How the AI model is integrated using the ChatGPT API.
## 5. Data Design
- **Database Schema**: `User`, `Transcript`, `Performance`, and `Prediction`. Describe relationships (e.g., a `User` has many `Transcripts`) and any unique fields, like a user’s GPA or predicted grade.
- **Data Flow**: Frontend Input -> API Call -> Backend Processing -> Database Update -> Frontend Display.
## 6. Security and Privacy
- **Authentication**: JWT (JSON Web Token) is used for user authentication, ensuring each user session is securely tracked.
- **Data Privacy**: Specify measures like data encryption, limited access, and GDPR compliance (if applicable). This is especially relevant for sensitive academic data.
## 7 API Integration
- **External APIs**: **ChatGPT API**: For predictive academic insights. **Data Visualization Library (D3.js)**: For creating interactive graphs on the frontend.
- **Axios Usage**: Axios’s role in handling HTTP requests, error handling, and asynchronous API calls for efficient data retrieval and processing between frontend and backend
## 8. Error Handling and Logging
- **Error Handling**: **Client-Side Validation**: Checking for correct inputs before submission. **Server-Side Validation**: Ensuring the backend can handle or reject incorrect or unexpected data. **Error Pages**: Displaying error messages for 404s, 500s, or connection issues.
- **Logging**: **Error Logs**: Capturing errors for debugging. **Request Logs**: Tracking API request details for analytics and performance improvements. **Logging Tools**: Tools like `Render`   or cloud logging solutions if applicable.
## 13. Appendices
- **Glossary**: Define any additional terms.
- **References**: List any references or resources used in the document.





