export async function parseTranscriptText(text: string): Promise<{ modules: string[]; marks: number[]; semestersPassed: number; numOfSemesters: number; }> {
    const modules: string[] = [];
    const marks: number[] = [];
    let semestersPassed = 3; // Placeholder for extracted value
    let numOfSemesters = 4;  // Placeholder for extracted value

    // Example regex to extract modules and marks (adjust according to your expected format)
    const moduleRegex = /(\w[\w\s]*):\s*(\d+)/g;
    let match;
    while ((match = moduleRegex.exec(text)) !== null) {
        modules.push(match[1].trim());
        marks.push(parseFloat(match[2]));
    }

    return { modules, marks, semestersPassed, numOfSemesters };
}
