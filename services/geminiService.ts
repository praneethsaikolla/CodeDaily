import { GoogleGenAI, Type } from "@google/genai";
import { Problem, ExecutionResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const evaluateCode = async (
  code: string,
  language: string,
  problem: Problem
): Promise<ExecutionResult> => {
  const modelId = "gemini-3-flash-preview";
  
  const testCasesString = problem.examples.map((tc, index) => 
    `Test Case ${index + 1}: Input: ${tc.input}, Expected Output: ${tc.output}`
  ).join("\n");

  const prompt = `
    You are a code execution engine. 
    Problem: ${problem.title}
    Description: ${problem.description}
    Language: ${language}
    
    The user has submitted the following code:
    \`\`\`${language}
    ${code}
    \`\`\`
    
    You need to simulate the execution of this code against the following test cases:
    ${testCasesString}
    
    Perform the following:
    1. Analyze the code for syntax errors.
    2. If there are syntax errors, return status "Error" and the error message.
    3. If valid, simulate execution for each test case.
    4. Determine if the output matches the expected output strictly.
    5. Estimate execution time (mock reasonable values based on complexity).
    
    Return a strictly formatted JSON object.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            status: { type: Type.STRING, enum: ["Pass", "Fail", "Error"] },
            executionTime: { type: Type.NUMBER },
            errorMessage: { type: Type.STRING },
            results: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  input: { type: Type.STRING },
                  expected: { type: Type.STRING },
                  actual: { type: Type.STRING },
                  passed: { type: Type.BOOLEAN },
                },
                required: ["input", "expected", "actual", "passed"],
              },
            },
          },
          required: ["status", "executionTime", "results"],
        },
      },
    });

    const resultText = response.text;
    if (!resultText) {
      throw new Error("Empty response from AI");
    }

    const result = JSON.parse(resultText) as ExecutionResult;
    return result;

  } catch (error) {
    console.error("Gemini API Error:", error);
    return {
      status: "Error",
      executionTime: 0,
      results: [],
      errorMessage: "Failed to communicate with execution engine.",
    };
  }
};