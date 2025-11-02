import { json } from "@sveltejs/kit";
import { Ollama } from "ollama";
const documentsDB_SA = [
  {
    id: "doc-001",
    title: "Health Plan A - Comprehensive Medical Aid",
    content: `Health Plan A - Comprehensive Cover:

IN-HOSPITAL COVER:
- Private hospital admission: 100% of costs at network hospitals
- Non-network hospitals: Cover up to 100% of medical aid rate (you pay gap)
- Specialists: 200% of medical aid rate
- Co-payment: R450 per admission
- Pre-authorisation required for planned procedures

DAY-TO-DAY BENEFITS:
- GP consultations: Unlimited from savings (R550 per visit average)
- Specialist visits: From savings, R850 per visit average
- Chronic medication: Covered from chronic benefit (not savings) for CDL conditions
- Acute medication: From savings account
- Dentist: 2 check-ups per year covered 100%, procedures from savings
- Optometrist: R1,800 per beneficiary every 2 years

SAVINGS ACCOUNT:
- Annual allocation: R15,000 individual / R35,000 family
- Rolls over if not used (up to R5,000)
- Once depleted, you pay from pocket until threshold

OUT-OF-POCKET THRESHOLD:
- Individual: R18,000 per year
- Family: R40,000 per year
- After threshold, scheme covers from Above Threshold Benefit (ATB)

Monthly Contribution: R4,500 individual / R12,000 family

Network: Netcare, Life Healthcare, Mediclinic (all provinces)`,
    category: "health_insurance",
    metadata: { plan_type: "Comprehensive", annual_cost: 54e3 }
  },
  {
    id: "doc-002",
    title: "Health Plan B - Network Hospital Plan with Savings",
    content: `Health Plan B - Affordable Network Plan:

IN-HOSPITAL COVER:
- Network hospital admission: 100% covered, no co-payment
- Non-network hospitals: Not covered except for emergencies
- Must use Designated Service Providers (DSPs)
- Specialists: 100% of medical aid rate at network hospitals
- Emergency stabilisation: Covered at any hospital

DAY-TO-DAY BENEFITS:
- GP consultations: From savings (must use network GPs)
- Network GP visit: R350 co-payment
- Non-network GP: Pay full amount (R750+ average)
- Chronic medication: Covered for 27 chronic conditions
- Acute medication: From savings account
- Dentist: R2,000 per beneficiary per year from savings
- Optometrist: R800 per beneficiary every 2 years

SAVINGS ACCOUNT:
- Annual allocation: R8,500 individual / R20,000 family
- Does not roll over
- No Above Threshold Benefit

ADVANTAGES:
- Lower monthly contributions
- Full in-hospital cover at network facilities
- Chronic cover included
- Good for healthy individuals

LIMITATIONS:
- Must use network providers
- No gap cover for specialists
- Limited day-to-day benefits
- No ATB (you pay from pocket after savings)

Monthly Contribution: R2,800 individual / R7,500 family

Network: Life Healthcare hospitals, network GP panel (list on website)

Best for: Healthy individuals wanting lower contributions with hospital security`,
    category: "health_insurance",
    metadata: { plan_type: "Network Hospital Plan", annual_cost: 33600 }
  },
  {
    id: "doc-003",
    title: "Dental Benefits - All Plans",
    content: `Dental Cover Across Medical Aid Plans:

PREVENTIVE CARE (from risk benefits):
- 2 dental check-ups per year: Covered 100%
- Scale and polish: Covered during check-ups
- X-rays (diagnostic): Covered during check-ups
- No co-payment for preventive care

BASIC PROCEDURES (from savings):
- Fillings: Average cost R800-R1,200 per tooth
- Extractions: Average cost R600-R1,500
- Root canal treatment: R3,000-R5,000
- Your savings account pays for these procedures

MAJOR PROCEDURES (from savings):
- Crowns: R6,000-R10,000 per tooth
- Bridges: R8,000-R15,000
- Dentures: R5,000-R12,000 (partial/full)
- Implants: R15,000-R25,000 per tooth (often not covered)

ORTHODONTICS (BRACES):
- Children under 18: Some plans cover up to R12,000
- Adults: Usually not covered or very limited
- Pre-authorisation required
- Usually lifetime limit

EMERGENCY DENTAL:
- Severe toothache, abscess: From savings or casualty if after hours
- Casualty fee: R3,000-R5,000 if treated at hospital

Network: 5,000+ registered dentists nationwide
Most dentists are private practitioners (not in network)
You pay the gap between what dentist charges and medical aid pays`,
    category: "dental_insurance",
    metadata: { annual_max: 3e4, preventive_coverage: 100 }
  },
  {
    id: "doc-004",
    title: "How to File a Medical Aid Claim",
    content: `Filing Claims with Your Medical Aid Scheme:

MOST CLAIMS ARE AUTOMATIC:
- GPs and specialists usually submit claims directly
- Pharmacies submit medication claims automatically
- Network hospitals submit claims on your behalf
- You only pay your co-payment or gap

WHEN YOU MUST CLAIM YOURSELF:
1. Non-network providers who don't submit
2. Out-of-pocket expenses when savings depleted
3. Claims for medical services abroad
4. Reimbursements for approved emergency treatment

HOW TO SUBMIT A CLAIM:

Online (Fastest):
1. Log into your medical scheme's website or app
2. Upload invoice and proof of payment
3. Include: ICD-10 code (diagnosis), procedure code, provider details
4. Submit within 4 months of treatment date
5. Processing time: 5-10 working days
6. Payment directly into your bank account

By Email:
1. Scan invoice, proof of payment, and claim form
2. Email to: claims@yourmedicalscheme.co.za
3. Processing time: 10-15 working days

By Post:
1. Complete claim form (download from website)
2. Attach original invoice and proof of payment
3. Post to: Claims Department, PO Box XXXX, City, XXXX
4. Processing time: 15-30 working days

WHAT YOU NEED:
- Original tax invoice from provider
- Proof of payment (bank statement, receipt)
- Completed claim form with:
  * Member number
  * Dependant code (if claim is for dependant)
  * ICD-10 diagnosis code
  * Procedure/tariff code
  * Provider practice number
  * Date of service

EMERGENCY CLAIMS:
- Emergency room visits: Hospital submits directly
- If you paid upfront: Claim within 30 days
- Include casualty admission report
- PMB emergencies must be covered in full

REJECTED CLAIMS:
- Appeal within 90 days of rejection
- Email: disputes@yourmedicalscheme.co.za
- Include: Reason for dispute, supporting documents
- Council for Medical Schemes can help if still disputed

PRESCRIPTION CLAIMS:
- Chronic medication: Automatic at pharmacy
- Acute medication: Comes from savings, automatic
- If you paid privately: Claim with original receipt and prescription

COMMON REJECTION REASONS:
- Submitted after 4-month limit
- Missing ICD-10 or procedure code
- Treatment not covered by your plan
- Savings depleted
- Pre-authorisation not obtained

Help: 0860 XXX XXX or claims@medicalscheme.co.za`,
    category: "procedures",
    metadata: { topic: "claims" }
  },
  {
    id: "doc-005",
    title: "Understanding Your Medical Aid Statement",
    content: `Reading Your Monthly Medical Aid Statement:

YOUR STATEMENT SHOWS:
1. Monthly contribution paid
2. Claims processed this month
3. Savings account balance
4. Available benefits
5. What you owe (if anything)

KEY SECTIONS:

CONTRIBUTIONS:
- Principal member: R4,500
- Adult dependant (spouse): R4,500
- Child dependants (2): R1,800 each
- Total monthly contribution: R12,600

CLAIMS PROCESSED:
- Date of service
- Provider name
- What was claimed (procedure code)
- Amount charged by provider
- Medical aid rate (what scheme uses for calculation)
- Amount paid by scheme
- Amount paid from savings
- Amount you must pay (co-payment or gap)

EXAMPLE CLAIM:
- GP Consultation, Dr. Smith
- Provider charged: R750
- Medical aid rate: R550
- Paid from savings: R550
- You pay: R200 (gap because GP charged above rate)

SAVINGS ACCOUNT:
- Opening balance: R15,000 (yearly allocation)
- Claims paid: -R3,500 (year to date)
- Balance remaining: R11,500
- Projected to last: 8 more months (at current usage)

CHRONIC MEDICATION:
- Separate benefit (not from savings)
- Shows medication approved
- Balance unlimited (for CDL conditions)

HOSPITAL COVER:
- Shows any hospital pre-auths approved
- Admission co-payment: R450 when admitted
- In-hospital cover: Unlimited at network hospitals

WHAT YOU OWE:
- Out-of-pocket payments made to providers
- These don't show on medical aid statement
- Provider will invoice you directly for gaps

THRESHOLD TRACKER:
- Some statements show progress towards threshold
- Once you've paid R18,000, ATB benefits start
- Important for plan comparison

COMMON CODES:
- 0190: General consultation (GP)
- 0191: Follow-up consultation
- 3909: Medication dispensing fee
- Various procedure codes for specialists

DISPUTES:
- If claim looks wrong, call scheme within 30 days
- Check: Did they use correct rate? Was it from savings or risk?
- Keep statements for tax purposes (medical expense deduction)`,
    category: "procedures",
    metadata: { topic: "statements" }
  }
];
function getSimplificationPromptSA() {
  return `
You are a medical aid assistant for South Africans. Answer questions clearly using the provided documents.

LANGUAGE REQUIREMENTS:
- Use South African/British English (hospitalisation, centre, not center)
- Use Rands (R) not dollars ($)
- Use "medical aid" or "medical scheme" not just "insurance"
- Use SA terms: GP, casualty (not ER), network hospitals, gap cover, PMBs

RULES:
1. Answer directly and concisely
2. Use plain language - avoid jargon unless explaining it
3. Include specific Rand amounts from the documents
4. If you use medical aid terms (co-payment, gap cover, PMBs, etc.), briefly explain them in brackets
5. Focus on answering what was asked - don't provide unsolicited advice
6. Reference SA context where relevant (Netcare, Life Healthcare, etc.)

ANSWER FORMAT:
- Start with the direct answer
- Include relevant costs in Rands
- Only explain terms if you used them
- Be brief and specific

Answer based ONLY on the provided documents below.
`;
}
const ollama = new Ollama({ host: "http://localhost:11434" });
function searchDocuments(query, limit = 3) {
  const queryLower = query.toLowerCase();
  const queryTerms = queryLower.split(/\s+/);
  const scored = documentsDB_SA.map((doc) => {
    const contentLower = (doc.title + " " + doc.content).toLowerCase();
    const score = queryTerms.reduce((acc, term) => {
      const matches = (contentLower.match(new RegExp(term, "g")) || []).length;
      return acc + matches;
    }, 0);
    return { doc, score };
  });
  return scored.filter((item) => item.score > 0).sort((a, b) => b.score - a.score).slice(0, limit).map((item) => item.doc);
}
async function queryInsurance(question, model = "llama3.2") {
  const relevantDocs = searchDocuments(question, 3);
  if (relevantDocs.length === 0) {
    return {
      response: "I couldn't find information about that in our insurance documents. Can you rephrase your question or ask about a specific plan?",
      sources: []
    };
  }
  const context = relevantDocs.map((doc) => `Document: ${doc.title}
${doc.content}`).join("\n\n---\n\n");
  const simplificationPrompt = getSimplificationPromptSA();
  const prompt = `${simplificationPrompt}

MEDICAL AID DOCUMENTS TO USE:
${context}

USER'S QUESTION: ${question}

YOUR ANSWER (Remember: Use SA English, Rands, and medical aid terminology):`;
  const response = await ollama.chat({
    model,
    messages: [
      {
        role: "user",
        content: prompt
      }
    ],
    stream: false
  });
  return {
    response: response.message.content,
    sources: relevantDocs.map((doc) => doc.title)
  };
}
const POST = async ({ request }) => {
  try {
    const { message } = await request.json();
    if (!message) {
      return json({ error: "Message is required" }, { status: 400 });
    }
    const result = await queryInsurance(message);
    return json(result);
  } catch (error) {
    console.error("Error:", error);
    return json({ error: "An error occurred while processing your request" }, { status: 500 });
  }
};
export {
  POST
};
