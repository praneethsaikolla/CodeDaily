export interface TestCase {
  input: string;
  output: string;
  explanation?: string;
}

export interface Problem {
  id: number;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  constraints: string[];
  examples: TestCase[];
  starterCode: Record<string, string>;
}

export interface TestResult {
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export interface ExecutionResult {
  status: 'Pass' | 'Fail' | 'Error';
  executionTime: number; // in ms
  results: TestResult[];
  errorMessage?: string;
}

export type SupportedLanguage = 'python' | 'java' | 'cpp' | 'c';
