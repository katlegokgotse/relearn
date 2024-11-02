import axios from "axios";

export async function predictMarks(modules: string[], marks: number[], semestersPassed: number, numOfSemesters: number) {
    try {
        // Create the prompt for the API, emphasizing the role of semesters passed
        const prompt = `Given the current marks: ${marks.join(", ")} for the modules: ${modules.join(", ")}, predict the next semester's marks. 
        Consider that ${semestersPassed} out of ${numOfSemesters} semesters have been completed. 
        Calculate the average growth or decrease based on the provided marks. 
        If any modules are repeated, such as "Science," factor in the difference between the two instances and the overall performance in those modules. 
        Provide realistic predictions for each module, including reasonable expectations for those marked as null in previous predictions.`;

        const response = await axios.post('https://api.openai.com/v1/chat/completions', 
            {
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                max_tokens: 1024 // Increased token limit for a more detailed response
            },
            {
                headers: {
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        // Log the raw API response for debugging
        console.log("Raw API response:", response.data);

        // Check if there are choices and if they contain a message
        if (response.data.choices && response.data.choices.length > 0) {
            const predictedMarks = response.data.choices[0].message.content.trim();

            // Log the predicted marks string
            console.log("Predicted marks string:", predictedMarks);

            // Create a map to hold predicted marks for each module
            const predictedMarksMap = new Map();

            // Use regex to extract predicted marks from the response
            const lines = predictedMarks.split('\n');
            lines.forEach((line: string) => {
                const match = line.match(/(\w+):\s*(\d+)/); // Matches 'Module: 90'
                if (match) {
                    const moduleName = match[1];
                    const predictedMark = parseFloat(match[2]);

                    // If the module already exists in the map, store the predicted mark
                    if (!predictedMarksMap.has(moduleName)) {
                        predictedMarksMap.set(moduleName, []); // Initialize if it doesn't exist
                    }
                    predictedMarksMap.get(moduleName).push(predictedMark);
                }
            });

            // Create the final JSON result
            const predictedMarksJSON = Array.from(predictedMarksMap.entries()).map(([module, predictions]) => ({
                module,
                predictedMark: predictions.length > 0 ? predictions[predictions.length - 1] : null // Get the latest prediction or null
            }));

            return predictedMarksJSON;

        } else {
            throw new Error("No predictions returned from the AI.");
        }

    } catch (error: any) {
        console.error("Error fetching predictions from ChatGPT:", error);
        throw error;
    }
}
