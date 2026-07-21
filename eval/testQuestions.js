// eval/testQuestions.js
//
// 10 Q&A pairs grounded in actual uploaded document content:
//   - POSH_POLICY.pdf
//   - Probation_Review_Policy.pdf
//   - HR_Manual.pdf
//   - DRESS_CODE_POLICY.pdf
//   - REFERRAL_INCENTIVE_POLICY.pdf
//
// referenceAnswer = written by reading the actual source document.
// expectedKeywords = terms a correct answer should contain (used for automated scoring).
// sourceDoc = which uploaded file the answer comes from, for traceability.

export const testQuestions = [
  {
    id: 1,
    type: "relevant",
    sourceDoc: "POSH_POLICY.pdf",
    question: "What law is TechAhead's sexual harassment policy based on?",
    referenceAnswer:
      "The policy is based on the Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013.",
    expectedKeywords: ["sexual harassment", "2013", "act"],
  },
  {
    id: 2,
    type: "relevant",
    sourceDoc: "Probation_Review_Policy.pdf",
    question: "How long is the probation period for freshers/trainees, and how many times can it be extended?",
    referenceAnswer:
      "Freshers/trainees have a 6-month probation period. It can be extended up to two times, with each extension lasting 1 month.",
    expectedKeywords: ["6 months", "six months", "two", "extend"],
  },
  {
    id: 3,
    type: "relevant",
    sourceDoc: "HR_Manual.pdf",
    question: "How many days of paid paternity leave is a male employee entitled to?",
    referenceAnswer:
      "A male employee is eligible for 3 working days of paid paternity leave for the birth of his child, to be availed within 30 days of the child's birth.",
    expectedKeywords: ["3 working days", "three working days", "paternity"],
  },
  {
    id: 4,
    type: "relevant",
    sourceDoc: "DRESS_CODE_POLICY.pdf",
    question: "What is the dress code from Monday to Thursday, and when are casuals allowed?",
    referenceAnswer:
      "Employees must wear Business Casuals from Monday to Thursday. Casuals are permitted only on Friday and weekends (Saturday/Sunday) if employees are working due to business exigency.",
    expectedKeywords: ["business casual", "friday"],
  },
  {
    id: 5,
    type: "relevant",
    sourceDoc: "REFERRAL_INCENTIVE_POLICY.pdf",
    question: "How much is the referral incentive for referring a candidate with 5 to 8 years of experience?",
    referenceAnswer: "The referral incentive for a candidate with 5 to 8 years of experience is Rs. 30,000.",
    expectedKeywords: ["30,000", "30000"],
  },
  {
    id: 6,
    type: "relevant",
    sourceDoc: "HR_Manual.pdf",
    question: "What is the maximum amount of gratuity payable to an employee?",
    referenceAnswer:
      "The maximum amount of gratuity payable is INR 10 lakh. Amounts up to this are tax-exempt; any amount paid above this limit is taxable.",
    expectedKeywords: ["10 lakh"],
  },
  {
    id: 7,
    type: "irrelevant",
    sourceDoc: null,
    question: "What is the company's refund policy for customer purchases?",
    referenceAnswer:
      "Not covered — none of the uploaded documents (POSH, Probation Review, HR Manual, Dress Code, Referral Incentive) address customer refunds; they are internal HR/employee policies.",
    expectedKeywords: [], // should trigger "not enough information" fallback
  },
  {
    id: 8,
    type: "irrelevant",
    sourceDoc: null,
    question: "What programming languages does TechAhead use for its projects?",
    referenceAnswer:
      "Not covered — none of the uploaded HR policy documents mention technology stacks or programming languages.",
    expectedKeywords: [],
  },
  {
    id: 9,
    type: "ambiguous",
    sourceDoc: null,
    question: "What should I do if this happens to me?",
    referenceAnswer:
      "Ambiguous without more context. A reasonable grounded answer (assuming it refers to harassment, per the POSH policy) would point to: tell the accused the behavior is unwelcome, keep a record of incidents, and file a complaint with the Internal Complaints Committee as soon as possible. A good system should either ask for clarification or hedge appropriately rather than confidently picking one interpretation.",
    expectedKeywords: ["complaint", "committee"],
  },
  {
    id: 10,
    type: "multi-doc",
    sourceDoc: "HR_Manual.pdf + DRESS_CODE_POLICY.pdf",
    question: "What are the working hours and the dress code policy at TechAhead?",
    referenceAnswer:
      "Working hours are Monday to Friday, 10:00 A.M. to 7:00 P.M., including up to 40 minutes of lunch and 20 minutes of short breaks (lunch can be taken between 1:00 P.M. and 3:00 P.M.). The dress code requires Business Casuals from Monday to Thursday, with Casuals permitted on Friday and weekends if working due to business exigency.",
    expectedKeywords: ["10:00", "7:00", "business casual"],
  },
];

// Note: question #10 requires BOTH HR_Manual.pdf (working hours, section 3.1) and
// DRESS_CODE_POLICY.pdf to be uploaded and retrievable for a correct answer — use it to
// verify the system correctly pulls chunks from more than one source document.
//
// Question #11 (empty query) is a validation/edge-case test, not a real Q&A pair — kept
// separate from the 10 above per the assignment's "10 Q&A pairs" requirement.
export const emptyQueryTest = {
  id: 11,
  type: "empty",
  question: "",
  referenceAnswer: "N/A — should be rejected by input validation (400), not answered.",
  expectedKeywords: [],
};