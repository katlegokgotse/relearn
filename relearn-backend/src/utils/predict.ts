import axios from "axios";

export async function predictMarks(modules: string[], marks: number[]){
    try {
        const prompt = `Predict next semester's marks based on these current marks: ${marks.join(", ")} for the modules: ${modules.join(", ")}. 
        Assume slight improvement if marks are below average and stability if high. Give realistic predictions for each module.`;
        const response = await axios.post('https://api.openai.com/v1/chat/completions', 
            {
                model: "gpt-4o-mini",
                messages: [{role: "user", content: prompt}],
                max_tokens: 20
            },
            {
                headers:{
                      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );
        const predictions = response.data[0].choices.message.content
        return predictions.split(", ").map(Number)
    }catch(error: any){
        console.error("Error fetching predictions from ChatGPT:", error);
        throw error;
    }
}