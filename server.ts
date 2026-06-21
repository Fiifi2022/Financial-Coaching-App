import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

// Lazy initialization of GoogleGenAI client to avoid crash on startup if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is not defined");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", time: new Date().toISOString() });
  });

  // API Route: Auto-Categorize transaction note using Gemini 3.5-flash
  app.post("/api/gemini/categorize", async (req, res) => {
    const { text } = req.body;
    if (!text || typeof text !== "string") {
      res.status(400).json({ error: "Text prompt is required" });
      return;
    }

    try {
      try {
        const ai = getGeminiClient();
        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Analyze the following personal finance description and extract:
1. Category - Map it to one of these: "Food & Dining", "Transportation", "Utilities", "Rent & Housing", "Entertainment", "Healthcare", "Salary & Income", "Side Hustle & Business", "Savings & Investments", "Debt Repayment", "Miscellaneous".
2. Amount - If a number is mentioned (such as "GHS 25" or "250cedis"), extract it as a number.
3. Note - A clean title version of what was purchased or earned.
4. Priority - An integer rank structure from 1 (crucial necessity like rent/utilities) to 5 (pure discretionary waste/luxury).

Text: "${text}"`,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                category: { 
                  type: Type.STRING, 
                  description: "One of the mapped financial categories." 
                },
                amount: { 
                  type: Type.NUMBER, 
                  description: "Extracted money value, defaults to 0 if not specified." 
                },
                note: { 
                  type: Type.STRING, 
                  description: "A friendly and clean title summary of the ledger entry." 
                },
                priorityRank: { 
                  type: Type.INTEGER, 
                  description: "Priority from 1 (rent, transport, utilities) to 5 (leisure, entertainment)." 
                }
              },
              required: ["category", "amount", "note", "priorityRank"]
            }
          }
        });

        if (response.text) {
          const parsed = JSON.parse(response.text.trim());
          res.json({ success: true, data: parsed, source: "gemini" });
        } else {
          throw new Error("Empty response text from model");
        }
      } catch (gemError: any) {
        console.warn("Gemini Client call failed, applying rule-based smart fallback fallback: ", gemError.message);
        
        // Smart rule-based fallback when key is not loaded or failing
        const desc = text.toLowerCase();
        let category = "Miscellaneous";
        let amount = 0;
        let pRank = 4;
        let note = text;

        // Extract amount number logic mapping (e.g., GHS 250 or 50 cedis)
        const match = desc.match(/(ghs|cedis|cedi|\$)?\s*?(\d+(\.\d{1,2})?)/i);
        if (match) {
          amount = parseFloat(match[2]);
        }

        if (desc.includes("waakye") || desc.includes("food") || desc.includes("dining") || desc.includes("lunch") || desc.includes("dinner") || desc.includes("eat") || desc.includes("restaurant") || desc.includes("pizza") || desc.includes("grocery")) {
          category = "Food & Dining";
          pRank = 3;
        } else if (desc.includes("transport") || desc.includes("taxi") || desc.includes("uber") || desc.includes("bolt") || desc.includes("fuel") || desc.includes("bus") || desc.includes("trotro") || desc.includes("commute")) {
          category = "Transportation";
          pRank = 2;
        } else if (desc.includes("ecg") || desc.includes("electricity") || desc.includes("water") || desc.includes("utility") || desc.includes("utilities") || desc.includes("dstv") || desc.includes("internet") || desc.includes("data bundle") || desc.includes("airtime")) {
          category = "Utilities";
          pRank = 1;
        } else if (desc.includes("rent") || desc.includes("housing") || desc.includes("hostel") || desc.includes("landlord")) {
          category = "Rent & Housing";
          pRank = 1;
        } else if (desc.includes("salary") || desc.includes("paycheck") || desc.includes("dividend") || desc.includes("allowance")) {
          category = "Salary & Income";
          pRank = 1;
        } else if (desc.includes("gig") || desc.includes("hustle") || desc.includes("business") || desc.includes("cosmetics") || desc.includes("sales") || desc.includes("store")) {
          category = "Side Hustle & Business";
          pRank = 1;
        } else if (desc.includes("loan") || desc.includes("credit") || desc.includes("borrow") || desc.includes("debt") || desc.includes("repay")) {
          category = "Debt Repayment";
          pRank = 2;
        } else if (desc.includes("save") || desc.includes("investment") || desc.includes("shares") || desc.includes("mutual fund")) {
          category = "Savings & Investments";
          pRank = 2;
        } else if (desc.includes("hospital") || desc.includes("drug") || desc.includes("medical") || desc.includes("health") || desc.includes("pharmacy")) {
          category = "Healthcare";
          pRank = 1;
        } else if (desc.includes("movie") || desc.includes("beer") || desc.includes("bar") || desc.includes("club") || desc.includes("party") || desc.includes("game") || desc.includes("entertainment")) {
          category = "Entertainment";
          pRank = 5;
        }

        res.json({
          success: true,
          data: {
            category,
            amount,
            note: note.slice(0, 50),
            priorityRank: pRank
          },
          source: "fallback-classifier"
        });
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // API Route: AI Coach analysis on portfolios and budget performances
  app.post("/api/coaching/analyze", async (req, res) => {
    const { wallets, transactions, goals, debts, totalIncome, totalExpenses, budgetMethod } = req.body;

    try {
      try {
        const ai = getGeminiClient();
        
        const systemPrompt = `You are an elite fintech advisor, behavioral economist, and certified financial coach. 
Analyze the user's financial setup and return a structured JSON audit with visual scoring, habits analysis, wasteful spending patterns, risk detections, and encouraging tailored solutions.
Ensure you address local Ghanian fintech touchpoints (MTN MoMo, GCB, Ecobank, waakye, ECG, etc.) if applicable as the user lives there.`;

        const userContext = `Context:
- Primary wallets: ${JSON.stringify(wallets)}
- Recent Transactions (past 30 days): ${JSON.stringify(transactions)}
- Savings Goals: ${JSON.stringify(goals)}
- Long-term Debts: ${JSON.stringify(debts)}
- Current Month Financial Summary:
  * Total Income: GHS ${totalIncome || 0}
  * Total Expenses: GHS ${totalExpenses || 0}
  * Budgeting Method selected: ${budgetMethod || '50/30/20'}

Deliver exactly a JSON response representing concrete financial insights.`;

        const response = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: userContext,
          config: {
            systemInstruction: systemPrompt,
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                score: { 
                  type: Type.INTEGER, 
                  description: "Dynamic financial health score from 0-100." 
                },
                weeklyReport: { 
                  type: Type.STRING, 
                  description: "A custom 2-3 sentence overview audit." 
                },
                criticalInsights: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Key actionable tips (e.g. emergency fund coverage status)."
                },
                riskyIndicators: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Habit indicators showing wasteful or overspending tendencies."
                },
                savingPotentialGHS: { 
                  type: Type.NUMBER, 
                  description: "Recommended GHS amount to shave from discretionary spend and redirect to goal focus." 
                }
              },
              required: ["score", "weeklyReport", "criticalInsights", "riskyIndicators", "savingPotentialGHS"]
            }
          }
        });

        if (response.text) {
          res.json(JSON.parse(response.text.trim()));
        } else {
          throw new Error("Empty response text from coaching gemini model");
        }
      } catch (coError) {
        console.warn("Gemini Coaching Model failed/not-set, supplying heuristic engine output");

        // Heuristic Financial coaching calculator as backup
        let score = 65;
        const insights: string[] = [];
        const riskList: string[] = [];
        let savingsPot = 150;

        const inc = totalIncome || 1;
        const exp = totalExpenses || 0;
        const ratio = inc > 0 ? (exp / inc) : 0;
        
        // Calculate Emergency fund metrics
        const emergGoal = goals?.find((g: any) => g.name.toLowerCase().includes("emergency"));
        const emergAmt = emergGoal ? emergGoal.currentAmount : 0;
        const monthlyEssentials = (exp * 0.7) || 1200; // approximation
        const monthsFund = (emergAmt / monthlyEssentials).toFixed(1);

        if (ratio < 0.5) {
          score += 20;
          insights.push("Excellent credit! You are spending less than half of your monthly inflows.");
        } else if (ratio < 0.8) {
          score += 10;
          insights.push("Decent cashflow balance, but reducing discretionary services can push savings rate towards 30%.");
        } else {
          score -= 15;
          insights.push("Warning: Your expenses consume over 80% of your inflows. High vulnerability to unforeseen shortfalls.");
          riskList.push("Unsafe spending velocity. Discretionary leakages leaving very narrow margins.");
        }

        if (emergAmt === 0 || parseFloat(monthsFund) < 3) {
          score -= 10;
          insights.push(`Your Emergency Fund covers only ${monthsFund} months of essentials. Target: 6 months of defense.`);
          riskList.push("Low liquid emergency buffer represents high credit reliance if income drops.");
        } else {
          score += 10;
          insights.push(`Your Emergency Fund reserves are in great health, protecting ${monthsFund} months of safety.`);
        }

        const totalDebt = debts?.reduce((acc: number, cur: any) => acc + (cur.balanceRemaining || 0), 0) || 0;
        const debtRatio = inc > 0 ? (totalDebt / inc) * 100 : 0;
        if (debtRatio > 40) {
          score -= 15;
          insights.push(`Debt-to-Income quotient stands at ${debtRatio.toFixed(0)}%. Highly leveraged. Transition into Avalanche debt paydown.`);
          riskList.push("Elevated debt load draining active liquid cashflows each month.");
        } else if (debtRatio > 0) {
          insights.push(`Debt-to-Income is ${debtRatio.toFixed(0)}%, which is controllable. Target clearing balances inside Fidelity and Bank.`);
        }

        res.json({
          score: Math.max(0, Math.min(100, score)),
          weeklyReport: "Solid portfolio baseline. Direct cash reserves represent dynamic flexibility, but trimming recurring small-item costs can raise wealth building quotients significantly.",
          criticalInsights: insights,
          riskyIndicators: riskList,
          savingPotentialGHS: savingsPot
        });
      }
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Serve static assets in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Financial Server running on port ${PORT}`);
  });
}

startServer();
