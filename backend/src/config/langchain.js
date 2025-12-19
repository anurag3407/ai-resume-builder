import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// System prompt template for resume enhancement
const getSystemPrompt = (jobRole, yearsOfExperience, skills, industry, customInstructions) => {
  return `You are an expert resume writer specializing in tech industry resumes with a deep understanding of ATS (Applicant Tracking System) requirements and Harvard resume template formatting.

Your task is to analyze and enhance the provided resume for a ${jobRole} position.

Candidate Profile:
- Target Role: ${jobRole}
- Years of Experience: ${yearsOfExperience} years
- Key Skills to Highlight: ${skills.join(', ')}
${industry ? `- Industry Preference: ${industry}` : ''}
${customInstructions ? `- Additional Instructions: ${customInstructions}` : ''}

Enhancement Requirements:

1. **Structure (Harvard Template Format)**:
   - Contact Information (Name, Email, Phone, LinkedIn, Portfolio)
   - Summary/Objective (2-3 impactful sentences)
   - Education (Degree, Institution, Graduation Date, GPA if >3.5)
   - Experience (Reverse chronological order)
   - Projects (if applicable)
   - Skills & Technologies
   - Leadership & Activities (if applicable)
   - Certifications & Awards (if applicable)

2. **Content Optimization**:
   - Use strong action verbs (Led, Developed, Implemented, Architected, Engineered, Optimized, Spearheaded, etc.)
   - Quantify achievements with specific metrics (percentages, numbers, dollar amounts)
   - Focus on impact and results, not just responsibilities
   - Highlight relevant technical skills for ${jobRole}
   - Include industry-specific keywords for ATS optimization

3. **Formatting Guidelines**:
   - Keep bullet points concise (1-2 lines each)
   - Use consistent formatting throughout
   - Remove personal pronouns (I, my, we)
   - Use present tense for current roles, past tense for previous roles
   - Prioritize most relevant experience and skills

4. **ATS Optimization**:
   - Include relevant keywords naturally throughout
   - Use standard section headings
   - Avoid graphics, tables, or special characters
   - Ensure clean, parseable text

5. **Critical Rules**:
   - NEVER fabricate information or add false claims
   - ONLY enhance and restructure existing information
   - Maintain factual accuracy at all times
   - If information seems incomplete, improve presentation of what's available

Return the enhanced resume in clean, well-formatted markdown with clear section headers using ## for main sections.`;
};

// Function to enhance resume using Google Gemini
export const enhanceResume = async (resumeText, preferences) => {
  const { 
    jobRole, 
    yearsOfExperience, 
    skills = [], 
    industry = '', 
    customInstructions = '' 
  } = preferences;

  try {
    const systemPrompt = getSystemPrompt(
      jobRole, 
      yearsOfExperience, 
      skills, 
      industry, 
      customInstructions
    );

    const prompt = `${systemPrompt}\n\nPlease enhance the following resume:\n\n${resumeText}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return {
      success: true,
      enhancedResume: text,
      tokensUsed: {
        prompt: 0,
        completion: 0,
        total: 0
      }
    };
  } catch (error) {
    console.error('Error enhancing resume:', error);
    throw new Error(`Failed to enhance resume: ${error.message}`);
  }
};

// Function to generate resume summary
export const generateSummary = async (resumeText, jobRole) => {
  try {
    const prompt = `You are an expert resume writer. Generate a compelling 2-3 sentence professional summary for a ${jobRole} position based on the provided resume. Focus on key achievements, years of experience, and core competencies. Be concise and impactful.

Resume:
${resumeText}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return {
      success: true,
      summary: text
    };
  } catch (error) {
    console.error('Error generating summary:', error);
    throw new Error(`Failed to generate summary: ${error.message}`);
  }
};

// Function to suggest improvements
export const suggestImprovements = async (resumeText, jobRole) => {
  try {
    const prompt = `You are an expert resume reviewer. Analyze the provided resume for a ${jobRole} position and provide 5 specific, actionable improvement suggestions. Format as a numbered list.

Resume:
${resumeText}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    return {
      success: true,
      suggestions: text
    };
  } catch (error) {
    console.error('Error suggesting improvements:', error);
    throw new Error(`Failed to suggest improvements: ${error.message}`);
  }
};

export default { enhanceResume, generateSummary, suggestImprovements };
