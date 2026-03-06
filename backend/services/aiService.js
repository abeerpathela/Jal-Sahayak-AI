import Groq from 'groq-sdk';

// Lazy client: initialized on first use so dotenv has time to load
let _groq = null;
const getGroqClient = () => {
  if (!_groq) _groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  return _groq;
};

// ─── Knowledge Base (RAG Context) ───────────────────────────────────────────
const knowledgeBase = [
  {
    keywords: ['supply', 'schedule', 'timing', 'time', 'when', 'hours'],
    topic: 'Water Supply Schedule',
    content: `Water supply schedule for Jal Shakti zones:
      - Zone A & B: 6:00 AM – 9:00 AM and 6:00 PM – 8:00 PM daily.
      - Zone C & D: 7:00 AM – 10:00 AM and 5:00 PM – 7:00 PM daily.
      - Emergency/Tanker supply is available 24x7 on helpline 1916.`,
  },
  {
    keywords: ['dirty', 'muddy', 'smell', 'colour', 'color', 'quality', 'contaminated', 'polluted', 'brown', 'yellow'],
    topic: 'Water Quality Issues',
    content: `If you receive dirty, muddy, or foul-smelling water:
      - Let the tap run for 5–10 minutes; this may clear pipe sediment.
      - If the problem continues, do NOT use water for drinking or cooking.
      - This may indicate pipeline contamination or a broken mains. Register a complaint immediately.
      - Water quality tests can be requested at your local Jal Shakti office.`,
  },
  {
    keywords: ['scheme', 'jal jeevan', 'mission', 'yojana', 'government', 'subsidy', 'connection', 'new connection'],
    topic: 'Government Schemes',
    content: `Key Government water schemes:
      - Jal Jeevan Mission (JJM): Provides tap water connections (Har Ghar Jal) to every rural household by 2024.
      - Atal Mission for Rejuvenation (AMRUT): Urban water supply improvement.
      - Apply for new connections at: jalshakti-ddws.gov.in or your nearest Jal Shakti office.
      - BPL households are eligible for subsidised connections.`,
  },
  {
    keywords: ['bill', 'billing', 'payment', 'charge', 'pay', 'amount', 'invoice', 'overcharge'],
    topic: 'Billing',
    content: `Water billing information:
      - Bills are generated every quarter (3 months).
      - Pay online at the Jal Shakti citizen portal or at any authorised payment centre or Paytm/GPay.
      - For billing disputes or overcharging, contact your zone's billing officer.
      - Failure to pay may lead to supply disconnection after 30 days notice.`,
  },
  {
    keywords: ['no water', 'no supply', 'water not coming', '3 days', 'days', 'outage', 'stopped', 'cut'],
    topic: 'No Water Supply',
    content: `If you have no water supply:
      - Check if neighbours are also facing the issue (could be a zone-level problem).
      - Planned maintenance cuts are usually announced 48 hours in advance via SMS/WhatsApp.
      - If unplanned: Call the 24x7 helpline 1916 immediately.
      - Right to water: No supply for more than 24 hours is a violation and constitutes a HIGH priority complaint.`,
  },
  {
    keywords: ['leak', 'leakage', 'pipe', 'broken', 'burst', 'road'],
    topic: 'Pipe Leakage',
    content: `For pipe leakage or burst mains:
      - Call helpline 1916 immediately. Leaks waste thousands of litres per hour.
      - Do not attempt to repair municipal pipes yourself — it is illegal.
      - Mark your complaint as urgent; leakages are classified as HIGH priority.
      - An engineering team is dispatched within 2–4 hours for burst mains.`,
  },
  {
    keywords: ['complaint', 'track', 'status', 'number', 'registered', 'check'],
    topic: 'Complaint Tracking',
    content: `To track a complaint:
      - Use your Complaint Number (format: JSA-XXXXXXXX) on the Jal Sahayak portal.
      - Complaints are typically addressed within:
        HIGH priority: 4–12 hours
        MEDIUM priority: 1–3 days
        LOW priority: 3–7 days
      - You can reopen a complaint if you are not satisfied with the resolution.`,
  },
];

// ─── RAG: Retrieve relevant context ─────────────────────────────────────────
const retrieveContext = (userMessage) => {
  const msg = userMessage.toLowerCase();
  const matched = knowledgeBase.filter(kb =>
    kb.keywords.some(keyword => msg.includes(keyword))
  );
  if (matched.length === 0) return null;
  return matched.map(m => `[${m.topic}]\n${m.content}`).join('\n\n');
};

// ─── Escalation Detection ────────────────────────────────────────────────────
export const shouldEscalate = (message) => {
  const keywords = ['complaint', 'urgent', 'not solved', 'not helping', 'escalate', 'contact support', 'frustrated', 'days'];
  return keywords.some(k => message.toLowerCase().includes(k));
};

// ─── Main AI Response (Groq + RAG) ──────────────────────────────────────────
export const getAIResponse = async (userMessage) => {
  try {
    const context = retrieveContext(userMessage);

    const systemPrompt = `You are Jal Sahayak AI, the official intelligent assistant for Jal Shakti Water Services, Government of India.

Your purpose:
- Answer citizen questions about water supply, quality, billing, govt schemes, and complaints.
- Be polite, professional, and empathetic.
- Keep responses concise (max 3–4 sentences unless providing a list).
- If the user seems frustrated or has an unresolved issue, suggest: "Would you like to register a formal complaint? Click the 'Contact Support' button."
- Do NOT fabricate contact numbers or schemes not in your knowledge base.
- Respond in the same language as the user (Hindi or English).

${context ? `Relevant Knowledge:\n${context}` : 'No specific knowledge matched. Answer from general knowledge about Indian water services.'}`;

    const chatCompletion = await getGroqClient().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.5,
      max_tokens: 512,
    });

    return chatCompletion.choices[0]?.message?.content?.trim() ||
      "I'm sorry, I couldn't understand that. Could you rephrase your question?";
  } catch (error) {
    console.error('Groq AI Error:', error?.message || error);
    return "I'm temporarily unavailable. Please try again or click 'Contact Support' to speak with a department representative.";
  }
};

// ─── Complaint Classification ────────────────────────────────────────────────
export const analyzeComplaint = async (description) => {
  try {
    const completion = await getGroqClient().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a complaint classifier for a water department.
Classify the following complaint into exactly ONE of these categories:
- Water Supply Issue
- Water Quality Issue
- Scheme Information
- Billing Issue
- Complaint Tracking
- Other

Reply with ONLY the category name. No explanation.`,
        },
        { role: 'user', content: description },
      ],
      temperature: 0,
      max_tokens: 20,
    });

    const category = completion.choices[0]?.message?.content?.trim();
    const validCategories = ['Water Supply Issue', 'Water Quality Issue', 'Scheme Information', 'Billing Issue', 'Complaint Tracking', 'Other'];
    return { category: validCategories.includes(category) ? category : 'Other' };
  } catch (error) {
    console.error('Classification error:', error?.message);
    return { category: 'Other' };
  }
};

// ─── AI Summary for Respondents ──────────────────────────────────────────────
export const getAISummary = async (chatHistory) => {
  try {
    const conversation = chatHistory
      .map(m => `${m.sender.toUpperCase()}: ${m.message}`)
      .join('\n');

    const completion = await getGroqClient().chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: 'Summarize this water service complaint conversation in 1-2 sentences for a department respondent. Be concise and factual.',
        },
        { role: 'user', content: conversation },
      ],
      temperature: 0.3,
      max_tokens: 100,
    });

    return completion.choices[0]?.message?.content?.trim() || 'Summary unavailable.';
  } catch (error) {
    console.error('Summary error:', error?.message);
    return 'AI summary unavailable.';
  }
};
