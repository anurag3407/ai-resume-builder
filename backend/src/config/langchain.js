import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

// System prompt template for resume enhancement
const getSystemPrompt = (jobRole, yearsOfExperience, skills, industry, customInstructions) => {
  return `You are an expert resume writer. Create a professional resume in strict Harvard template format.

Target Role: ${jobRole}
Years of Experience: ${yearsOfExperience}
Key Skills: ${skills.join(', ')}
${industry ? `Industry: ${industry}` : ''}
${customInstructions ? `Special Instructions: ${customInstructions}` : ''}

STRICT OUTPUT FORMAT (follow exactly):

# [Full Name]

[email@domain.com](mailto:email@domain.com) | [Phone Number] | [LinkedIn](https://linkedin.com/in/username) | [GitHub](https://github.com/username) | [Portfolio](https://portfolio-url.com)

## SUMMARY

[2-3 sentence professional summary highlighting key achievements and expertise for ${jobRole} role]

## EDUCATION

**[Degree Name]** | [University Name] | [Location] | [Graduation Date]
- GPA: [X.XX] (only if > 3.5)
- Relevant coursework or honors

## EXPERIENCE

**[Job Title]** | [Company Name] | [Location] | [Start Date] - [End Date]
- [Achievement with quantified impact using action verbs]
- [Another achievement with metrics]

## PROJECTS

**[Project Name]** | [Technologies Used] | [Date]
- [Description of project with impact/results]
- [Link if applicable: [Project Link](https://url.com)]

## SKILLS

**Languages:** [List]
**Frameworks:** [List]
**Tools:** [List]
**Other:** [List]

CRITICAL FORMATTING RULES:
1. ALL URLs must be clickable markdown links: [Display Text](https://full-url.com)
2. Email must be: [email@domain.com](mailto:email@domain.com)
3. LinkedIn must be: [LinkedIn](https://linkedin.com/in/username)
4. GitHub must be: [GitHub](https://github.com/username)
5. Phone numbers are plain text with country code
6. Use ** for bold text (job titles, degrees, project names)
7. Use - for bullet points
8. Each section header uses ## 
9. Name uses # (single hash)
10. Contact info goes on ONE line right after name, separated by |

OUTPUT RULES:
- Return ONLY the resume markdown, nothing else
- NO preamble like "Here is the resume"
- NO notes or commentary
- NO explanations
- Start with # [Name]
- End with the last skill or section`;
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
