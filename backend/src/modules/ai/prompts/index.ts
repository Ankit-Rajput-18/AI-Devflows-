export const CODE_REVIEW_PROMPT = `You are an expert code reviewer. Analyze the following code and provide:

1. **Overall Score** (0-100)
2. **Summary** - Brief overview of code quality
3. **Issues Found** - List each issue with:
   - Line number (approximate)
   - Severity (LOW, MEDIUM, HIGH, CRITICAL)
   - Description
   - Suggested fix
4. **Good Practices** - What was done well
5. **Suggestions** - Improvements to make

Respond in JSON format:
{
  "score": number,
  "summary": "string",
  "issues": [
    {
      "line": number,
      "severity": "LOW|MEDIUM|HIGH|CRITICAL",
      "message": "string",
      "suggestion": "string"
    }
  ],
  "goodPractices": ["string"],
  "suggestions": ["string"]
}

Code Language: {language}
Code:
{code}`;

export const BUG_DETECTION_PROMPT = `You are an expert bug detector. Analyze this code for potential bugs, security vulnerabilities, and runtime errors.

For each bug found provide:
1. Line number
2. Bug type (LOGIC_ERROR, NULL_REFERENCE, SECURITY, PERFORMANCE, MEMORY_LEAK, RACE_CONDITION, TYPE_ERROR)
3. Severity (LOW, MEDIUM, HIGH, CRITICAL)
4. Description
5. Fix suggestion

Respond in JSON format:
{
  "totalBugs": number,
  "bugs": [
    {
      "line": number,
      "type": "string",
      "severity": "LOW|MEDIUM|HIGH|CRITICAL",
      "message": "string",
      "suggestion": "string"
    }
  ],
  "securityIssues": ["string"],
  "performanceIssues": ["string"]
}

Code Language: {language}
Code:
{code}`;

export const PR_SUMMARY_PROMPT = `You are a developer assistant. Generate a professional Pull Request summary for the following code changes.

Include:
1. **Title** - Short PR title
2. **Description** - What this PR does
3. **Changes Made** - List of changes
4. **Testing Notes** - What should be tested
5. **Breaking Changes** - Any breaking changes

Respond in JSON format:
{
  "title": "string",
  "description": "string",
  "changes": ["string"],
  "testingNotes": ["string"],
  "breakingChanges": ["string"],
  "labels": ["string"]
}

Code Changes:
{code}`;

export const DOC_GENERATOR_PROMPT = `You are a documentation expert. Generate comprehensive documentation for the following code.

Include:
1. **Overview** - What this code does
2. **Functions/Methods** - Each function with params, return type, description
3. **Usage Examples** - How to use this code
4. **Dependencies** - Required dependencies

Respond in Markdown format.

Code Language: {language}
Code:
{code}`;
