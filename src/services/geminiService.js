// src/services/geminiService.js
import { GoogleGenAI } from '@google/genai';

// Initialize Gemini AI client
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY 
});

/**
 * Generate life insights based on user data
 * @param {Array} finances - User's finance records
 * @param {Array} journals - User's journal entries
 * @param {Array} habits - User's habits
 * @returns {Promise<string>} - AI-generated insights
 */
export const generateInsights = async (finances, journals, habits) => {
  try {
    // Validate API key
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('Gemini API key is not configured');
    }

    // Prepare finance summary
    const financeSummary = prepareFinanceSummary(finances);
    
    // Prepare journal summary
    const journalSummary = prepareJournalSummary(journals);
    
    // Prepare habit summary
    const habitSummary = prepareHabitSummary(habits);

    // Create comprehensive prompt
    const prompt = `
You are a professional cognitive performance coach analyzing a user's life data. 

**Finance Data:**
${financeSummary}

**Journal Entries:**
${journalSummary}

**Habit Tracking:**
${habitSummary}

Based on this data, provide a comprehensive analysis with the following structure:

1. **WEEKLY LIFE SUMMARY** (2-3 sentences)
   - Overall performance assessment
   - Key patterns observed

2. **FINANCIAL HEALTH** (2 bullet points)
   - Current spending patterns
   - Specific actionable recommendation

3. **MENTAL WELLBEING** (2 bullet points)
   - Mood trends and emotional state
   - Specific actionable recommendation

4. **HABIT CONSISTENCY** (2 bullet points)
   - Progress on tracked habits
   - Specific actionable recommendation

5. **TOP 3 ACTION ITEMS**
   - Concrete, specific steps to improve in the next week
   - Each should be actionable and measurable

Keep the tone professional, motivating, and concise. Focus on actionable insights.
DO NOT use markdown formatting - use plain text with line breaks only.
`;

    // Call Gemini API
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: prompt,
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    // Extract and return the text
    const insights = response.text || "Unable to generate insights at this time.";
    
    return insights;

  } catch (error) {
    console.error('Gemini Service Error:', error);
    
    // Handle specific error types
    if (error.message?.includes('API key')) {
      throw new Error('AI service configuration error');
    }
    
    if (error.message?.includes('quota')) {
      throw new Error('AI service quota exceeded. Please try again later.');
    }

    if (error.message?.includes('rate limit')) {
      throw new Error('Too many requests. Please try again in a few moments.');
    }

    throw new Error('AI services are currently offline. Please try again later.');
  }
};

/**
 * Prepare finance data summary
 */
const prepareFinanceSummary = (finances) => {
  if (!finances || finances.length === 0) {
    return "No recent financial data available.";
  }

  const income = finances.filter(f => f.type === 'income');
  const expenses = finances.filter(f => f.type === 'expense');

  const totalIncome = income.reduce((sum, f) => sum + f.amount, 0);
  const totalExpenses = expenses.reduce((sum, f) => sum + f.amount, 0);
  const balance = totalIncome - totalExpenses;

  // Group expenses by category
  const expensesByCategory = {};
  expenses.forEach(exp => {
    expensesByCategory[exp.category] = (expensesByCategory[exp.category] || 0) + exp.amount;
  });

  const topCategories = Object.entries(expensesByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([cat, amt]) => `${cat}: Rs ${amt.toFixed(2)}`)
    .join(', ');

  return `
Total Income: Rs ${totalIncome.toFixed(2)}
Total Expenses: Rs ${totalExpenses.toFixed(2)}
Net Balance: Rs ${balance.toFixed(2)}
Top Spending Categories: ${topCategories || 'None'}
Recent Transactions: ${finances.length}
  `.trim();
};

/**
 * Prepare journal data summary
 */
const prepareJournalSummary = (journals) => {
  if (!journals || journals.length === 0) {
    return "No recent journal entries available.";
  }

  const moods = journals.map(j => j.mood);
  const averageMood = (moods.reduce((sum, m) => sum + m, 0) / moods.length).toFixed(1);
  
  const moodTrend = analyzeMoodTrend(moods);
  
  // Get snippets from recent entries
  const recentEntries = journals
    .slice(0, 3)
    .map((j, i) => `Entry ${i + 1} (Mood: ${j.mood}/5): "${j.text.substring(0, 100)}${j.text.length > 100 ? '...' : ''}"`)
    .join('\n');

  return `
Average Mood: ${averageMood}/5
Mood Trend: ${moodTrend}
Total Entries: ${journals.length}

Recent Entries:
${recentEntries}
  `.trim();
};

/**
 * Analyze mood trend
 */
const analyzeMoodTrend = (moods) => {
  if (moods.length < 2) return 'Insufficient data';
  
  const recent = moods.slice(0, Math.ceil(moods.length / 2));
  const older = moods.slice(Math.ceil(moods.length / 2));
  
  const recentAvg = recent.reduce((sum, m) => sum + m, 0) / recent.length;
  const olderAvg = older.reduce((sum, m) => sum + m, 0) / older.length;
  
  const diff = recentAvg - olderAvg;
  
  if (diff > 0.5) return 'Improving';
  if (diff < -0.5) return 'Declining';
  return 'Stable';
};

/**
 * Prepare habit data summary
 */
const prepareHabitSummary = (habits) => {
  if (!habits || habits.length === 0) {
    return "No habits being tracked.";
  }

  const totalHabits = habits.length;
  const activeHabits = habits.filter(h => h.streak > 0).length;
  const totalStreak = habits.reduce((sum, h) => sum + h.streak, 0);
  const averageStreak = totalHabits > 0 ? (totalStreak / totalHabits).toFixed(1) : 0;
  const longestStreak = Math.max(...habits.map(h => h.longestStreak), 0);

  const habitList = habits
    .slice(0, 5)
    .map(h => `${h.name}: ${h.streak} day streak (best: ${h.longestStreak})`)
    .join('\n');

  return `
Total Habits: ${totalHabits}
Active Habits: ${activeHabits}
Average Streak: ${averageStreak} days
Longest Streak (Overall): ${longestStreak} days

Current Habits:
${habitList}
  `.trim();
};

/**
 * Generate personalized recommendations
 * @param {Object} user - User profile
 * @param {Array} finances - Finance records
 * @param {Array} journals - Journal entries
 * @param {Array} habits - Habits
 * @returns {Promise<Object>} - Recommendations by category
 */
export const generateRecommendations = async (user, finances, journals, habits) => {
  try {
    const recommendations = {
      financial: [],
      wellness: [],
      productivity: []
    };

    // Financial recommendations
    if (finances && finances.length > 0) {
      const expenses = finances.filter(f => f.type === 'expense');
      const totalExpenses = expenses.reduce((sum, f) => sum + f.amount, 0);
      
      if (totalExpenses > 0) {
        recommendations.financial.push({
          title: 'Track Spending Patterns',
          description: 'Review your top spending categories weekly',
          priority: 'medium'
        });
      }
    }

    // Wellness recommendations
    if (journals && journals.length > 0) {
      const averageMood = journals.reduce((sum, j) => sum + j.mood, 0) / journals.length;
      
      if (averageMood < 3) {
        recommendations.wellness.push({
          title: 'Boost Mental Wellbeing',
          description: 'Consider meditation or talking to someone',
          priority: 'high'
        });
      }
    }

    // Productivity recommendations
    if (habits && habits.length > 0) {
      const lowStreakHabits = habits.filter(h => h.streak < 3);
      
      if (lowStreakHabits.length > 0) {
        recommendations.productivity.push({
          title: 'Build Consistency',
          description: `Focus on ${lowStreakHabits[0].name} to build momentum`,
          priority: 'high'
        });
      }
    }

    return recommendations;

  } catch (error) {
    console.error('Recommendations Error:', error);
    return {
      financial: [],
      wellness: [],
      productivity: []
    };
  }
};

/**
 * Generate goal suggestions based on user data
 * @param {Array} finances - Finance records
 * @param {Array} habits - Habits
 * @returns {Promise<Array>} - Suggested goals
 */
export const generateGoalSuggestions = async (finances, habits) => {
  try {
    const goals = [];

    // Financial goals
    if (finances && finances.length > 0) {
      const income = finances.filter(f => f.type === 'income');
      const totalIncome = income.reduce((sum, f) => sum + f.amount, 0);
      
      if (totalIncome > 0) {
        const suggestedSavings = totalIncome * 0.2; // 20% savings goal
        goals.push({
          category: 'financial',
          title: 'Emergency Fund',
          target: suggestedSavings,
          timeframe: '3 months',
          description: 'Build an emergency fund equal to 20% of monthly income'
        });
      }
    }

    // Habit goals
    if (habits && habits.length > 0) {
      const avgStreak = habits.reduce((sum, h) => sum + h.streak, 0) / habits.length;
      
      if (avgStreak < 7) {
        goals.push({
          category: 'productivity',
          title: 'Build Habit Consistency',
          target: 7,
          timeframe: '1 week',
          description: 'Maintain a 7-day streak on your primary habit'
        });
      }
    }

    return goals;

  } catch (error) {
    console.error('Goal Suggestions Error:', error);
    return [];
  }
};

export default {
  generateInsights,
  generateRecommendations,
  generateGoalSuggestions
};