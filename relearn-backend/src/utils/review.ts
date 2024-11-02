import axios from "axios";

export async function review(modules: string[], marks: number[], semestersPassed: number, numOfSemesters: number) {
    // Calculate average marks
    const totalMarks = marks.reduce((sum, mark) => sum + mark, 0);
    const averageMarks = totalMarks / marks.length;

    // Prepare a detailed description for each module
    const moduleDescriptions = modules.map((module, index) => {
        return `${module}: Current Mark - ${marks[index]}`;
    }).join('\n');

    // Construct the prompt for the API
    const prompt = `The following are the current marks for the user: 
    ${moduleDescriptions}
    
    The average mark is ${averageMarks.toFixed(2)}. 
    Given this information, please provide insights on how the user can improve their marks. 
    Describe each module and provide recommendations based on the current performance. 
    Consider that ${semestersPassed} out of ${numOfSemesters} semesters have been completed.`;

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', 
            {
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 1024 // Adjust token limit based on desired response length
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Check if there are choices and if they contain a message
        if (response.data.choices && response.data.choices.length > 0) {
            const feedback = response.data.choices[0].message.content.trim();
            return feedback;
        } else {
            throw new Error("No feedback returned from the AI.");
        }

    } catch (error: any) {
        console.error("Error fetching review from ChatGPT:", error);
        throw error;
    }
}
