import { Program, SituationExtraction, ActionPlanItem, DocumentItem, CaseOverview } from '../types';
import { APP_IMAGES } from './images';

export const EMPTY_SITUATION: SituationExtraction = {
  location: "Not provided yet",
  householdSize: 0,
  dependents: "Not specified yet",
  incomeSituation: "Not provided yet",
  employmentStatus: "Not provided yet",
  specificNeeds: [],
  confidence: "needs_verification",
  lastEditedAt: "Pending input"
};

export const INITIAL_EXTRACTED_SITUATION: SituationExtraction = {
  location: "Lahore District, Punjab",
  householdSize: 3,
  dependents: "1 infant (7 months old), 1 adult partner",
  incomeSituation: "Rs 0 current household earnings following unexpected mass layoff on May 12th",
  employmentStatus: "Recently separated (involuntary layoff without severance)",
  specificNeeds: [
    "Immediate grocery, flour & infant formula assistance",
    "Health coverage continuation for infant and postpartum mother",
    "Income bridge while seeking re-employment",
    "Rental lease stabilization for upcoming month (Rs 22,000 rent due)"
  ],
  confidence: "high",
  lastEditedAt: "Today, 10:42 AM"
};

export const MOCK_PROGRAMS: Program[] = [
  {
    id: "prog-uim-01",
    name: "Worker Unemployment & Wage Transition Relief",
    shortCode: "PESSI / Worker Relief",
    agency: "Punjab Employees Social Security & Labor Directorate",
    category: "unemployment",
    matchStrength: "high",
    matchReason: "Involuntary separation from industrial employment within qualifying base period without misconduct.",
    missingEvidence: [
      "Employer Separation Notice / Discharge Certificate",
      "Most recent monthly salary slip prior to layoff"
    ],
    sourceUrl: "https://pessi.punjab.gov.pk",
    lastUpdated: "April 18, 2026",
    estimatedBenefit: "Rs 15,000 – Rs 25,000 / month for up to 6 months",
    timeframeToReceive: "First payment disbursed within 14–21 days of biometric CNIC verification",
    plainEligibilitySummary: "Financial transition stipend for formal and industrial workers who experienced involuntary retrenchment or job downsizing through no fault of their own.",
    eligibilityCriteria: [
      "Involuntary separation (plant downsizing, retrenchment, or contract end)",
      "Prior regular wage record of at least Rs 32,000 monthly in base qualifying quarters",
      "Pakistani citizen with verified NADRA CNIC",
      "Registered on provincial labor & social security database"
    ],
    imageUrl: APP_IMAGES.workerRelief,
    officialLogoText: "PESSI LABOUR",
    requiredDocuments: [
      {
        id: "doc-sep-notice",
        name: "Employer Separation / Layoff Notice",
        description: "Official signed letter from employer confirming release date and involuntary separation reason",
        category: "Employment Verification",
        status: "needed",
        acceptableFormats: ["PDF", "JPG", "PNG"]
      },
      {
        id: "doc-paystub",
        name: "Most Recent Salary / Wage Slip",
        description: "Showing gross monthly earnings and social security deductions from last pay cycle",
        category: "Income Verification",
        status: "uploaded",
        acceptableFormats: ["PDF", "JPG", "PNG"]
      },
      {
        id: "doc-id",
        name: "NADRA Computerized National Identity Card (CNIC)",
        description: "Valid Pakistani Computerized National Identity Card or Smart Card",
        category: "Identity",
        status: "verified",
        acceptableFormats: ["PDF", "JPG", "PNG"]
      }
    ],
    applicationSteps: [
      {
        stepNumber: 1,
        title: "Initiate Claim on Provincial Labor Portal",
        instruction: "Authenticate identity using your 13-digit CNIC number and biometric citizen profile.",
        channel: "online",
        timing: "Day 1 (Immediate)"
      },
      {
        stepNumber: 2,
        title: "Submit Wage History & Separation Notice",
        instruction: "Input employer registration number, last working day, and upload separation letter.",
        channel: "online",
        timing: "Within 14 days of separation"
      },
      {
        stepNumber: 3,
        title: "Biometric Confirmation at Partner Bank Branch",
        instruction: "Complete biometric thumb verification at Bank of Punjab or HBL branch to authorize monthly direct deposit.",
        channel: "in-person",
        timing: "Following initial eligibility notice"
      }
    ]
  },
  {
    id: "prog-wic-02",
    name: "Benazir Nashonuma & Maternal Nutrition Support",
    shortCode: "BISP / Nashonuma",
    agency: "Benazir Income Support Programme (BISP) & Health Directorate",
    category: "food_nutrition",
    matchStrength: "high",
    matchReason: "Household has an infant under 1 year of age and current income falls under the national PMT welfare threshold.",
    missingEvidence: [
      "NADRA Child Registration Certificate (B-Form)"
    ],
    sourceUrl: "https://bisp.gov.pk",
    lastUpdated: "May 2, 2026",
    estimatedBenefit: "Rs 8,000 – Rs 12,500 / quarter + specialized nutritional food sachets for infant",
    timeframeToReceive: "Loaded to BISP digital biometric wallet / HBL Konnect within 48–72 hours of clinic check-in",
    plainEligibilitySummary: "Conditional cash transfers and specialized fortified nutritional supplements for pregnant mothers, nursing women, and infants up to 24 months to prevent malnutrition and support baby health.",
    eligibilityCriteria: [
      "Household falls within qualifying PMT welfare score band (BISP registry)",
      "Mother or child registered with district health authority",
      "Infant or child under 2 years of age in the home"
    ],
    imageUrl: APP_IMAGES.motherInfant,
    officialLogoText: "BISP NASHONUMA",
    requiredDocuments: [
      {
        id: "doc-birth-cert",
        name: "NADRA Child Registration Certificate (B-Form)",
        description: "Official NADRA B-Form or Hospital Birth & Crib Vaccination Record verifying infant age",
        category: "Vital Record",
        status: "needed",
        acceptableFormats: ["PDF", "JPG", "PNG"]
      },
      {
        id: "doc-residence",
        name: "Proof of District Residence",
        description: "Recent electricity bill, gas bill, or signed tenancy agreement within 60 days",
        category: "Residency",
        status: "uploaded",
        acceptableFormats: ["PDF", "JPG", "PNG"]
      }
    ],
    applicationSteps: [
      {
        stepNumber: 1,
        title: "Visit Nearest BISP Tehsil Facilitation Desk",
        instruction: "Present mother's CNIC and child B-form for quick PMT score verification.",
        channel: "in-person",
        timing: "Immediate (Next 48 Hours)"
      },
      {
        stepNumber: 2,
        title: "Attend Rapid Health & Immunization Check",
        instruction: "Clinical nurse logs infant growth milestones and issues specialized nutrition packages.",
        channel: "in-person",
        timing: "At time of enrollment"
      },
      {
        stepNumber: 3,
        title: "Collect Quarterly Stipend via Biometric ATM",
        instruction: "Withdraw cash grant at any BISP-authorized ATM or biometric retailer with zero deduction fees.",
        channel: "in-person",
        timing: "Every quarter"
      }
    ]
  },
  {
    id: "prog-med-03",
    name: "Sehat Sahulat Universal Health Protection Card",
    shortCode: "Sehat Card",
    agency: "Ministry of National Health Services & State Life Insurance",
    category: "healthcare",
    matchStrength: "high",
    matchReason: "Family qualifies for 100% free secondary and tertiary inpatient healthcare across empaneled hospitals.",
    missingEvidence: [
      "NADRA Family Registration Certificate (FRC) or Hospital Referral"
    ],
    sourceUrl: "https://www.pmhealthprogram.gov.pk",
    lastUpdated: "January 15, 2026",
    estimatedBenefit: "Up to Rs 1,000,000 / year in 100% cashless inpatient & pediatric hospital treatments",
    timeframeToReceive: "Active immediately upon presentation of CNIC at empaneled hospitals",
    plainEligibilitySummary: "Universal cashless health protection covering hospital admissions, surgical operations, maternity care, pediatric emergencies, and post-discharge medicines up to Rs 1,000,000 per family annually.",
    eligibilityCriteria: [
      "Permanent resident of participating province with NADRA family record",
      "Valid Computerized National Identity Card (CNIC)",
      "Treatment at registered empaneled public or private hospital"
    ],
    imageUrl: APP_IMAGES.clinicCare,
    officialLogoText: "SEHAT SAHULAT",
    requiredDocuments: [
      {
        id: "doc-cov-term",
        name: "Hospital Inpatient Admission Prescription",
        description: "Official doctor admission slip or medical summary for inpatient hospital care",
        category: "Healthcare",
        status: "needed",
        acceptableFormats: ["PDF", "JPG"]
      }
    ],
    applicationSteps: [
      {
        stepNumber: 1,
        title: "Present CNIC at Hospital Sehat Sahulat Desk",
        instruction: "Dedicated hospital Sehat Sahulat officer verifies your family tree instantly in NADRA database.",
        channel: "in-person",
        timing: "At time of admission"
      },
      {
        stepNumber: 2,
        title: "Receive Cashless Medical Treatment",
        instruction: "All hospital room charges, operations, and medicines are covered with zero out-of-pocket charges up to Rs 1,000,000.",
        channel: "in-person",
        timing: "During hospital stay"
      }
    ]
  },
  {
    id: "prog-erap-04",
    name: "Emergency Relief & Rent/Utility Hardship Fund",
    shortCode: "Bait-ul-Mal / Relief",
    agency: "Pakistan Bait-ul-Mal (PBM) & Social Welfare Department",
    category: "housing",
    matchStrength: "possible",
    matchReason: "Significant reduction in household income risking housing eviction; Rs 22,000 rent due on upcoming 1st of month.",
    missingEvidence: [
      "Signed Residential Tenancy Agreement",
      "Electricity / Gas Utility Bill with pending arrears"
    ],
    sourceUrl: "https://pbm.gov.pk",
    lastUpdated: "March 11, 2026",
    estimatedBenefit: "Rs 25,000 – Rs 50,000 one-time emergency relief grant for rent and utility stabilization",
    timeframeToReceive: "Disbursed via bank transfer or crossed cheque within 10–14 working days",
    plainEligibilitySummary: "Special emergency grants designed to prevent eviction, utility disconnections, and severe financial distress for families struck by sudden unexpected breadwinner income loss.",
    eligibilityCriteria: [
      "Monthly household income below Rs 40,000",
      "Documented sudden income loss or retrenchment",
      "Resident tenant with valid tenancy agreement or utility bill"
    ],
    imageUrl: APP_IMAGES.communityAid,
    officialLogoText: "BAIT-UL-MAL",
    requiredDocuments: [
      {
        id: "doc-lease",
        name: "Signed Residential Tenancy Agreement",
        description: "Copy showing landlord contact details and monthly rent of Rs 22,000",
        category: "Housing",
        status: "needed",
        acceptableFormats: ["PDF", "JPG"]
      }
    ],
    applicationSteps: [
      {
        stepNumber: 1,
        title: "Submit Emergency Hardship Application",
        instruction: "Fill out PBM Form-A with household income details and proof of retrenchment.",
        channel: "in-person",
        timing: "Day 3–5"
      },
      {
        stepNumber: 2,
        title: "Upload Rent Agreement & Arrears Bill",
        instruction: "Attach signed tenancy agreement and landlord CNIC copy.",
        channel: "online",
        timing: "With initial application"
      }
    ]
  }
];

export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: "doc-id",
    title: "NADRA Computerized National Identity Card (CNIC)",
    fileName: "NADRA_Smart_CNIC_35201.jpg",
    fileSize: "2.4 MB",
    uploadedAt: "Today, 10:48 AM",
    status: "verified",
    associatedProgramIds: ["prog-uim-01", "prog-med-03"],
    extractedData: {
      documentTypeRead: "NADRA Smart National Identity Card",
      issuer: "NADRA (Govt. of Pakistan)",
      dateDetected: "Valid thru 11/2032",
      keyFigures: "CNIC: 35201-8491023-1 | DOB: 14-Oct-1992",
      confidenceScore: 98,
      notes: "High confidence identity match with applicant citizen profile.",
      userVerified: true
    }
  },
  {
    id: "doc-paystub",
    title: "Most Recent Salary / Wage Slip",
    fileName: "Salary_Slip_MillatWorks_April.pdf",
    fileSize: "410 KB",
    uploadedAt: "Today, 10:52 AM",
    status: "uploaded",
    associatedProgramIds: ["prog-uim-01"],
    extractedData: {
      documentTypeRead: "Monthly Salary Statement",
      issuer: "Millat Industrial Works Ltd.",
      dateDetected: "Period Ending April 30, 2026",
      keyFigures: "Gross Monthly Earnings: Rs 38,500.00 | Prior YTD: Rs 340,000.00",
      confidenceScore: 92,
      notes: "Clear wage statement confirming base qualifying period earnings threshold.",
      userVerified: true
    }
  },
  {
    id: "doc-sep-notice",
    title: "Employer Separation / Layoff Notice",
    status: "needed",
    associatedProgramIds: ["prog-uim-01", "prog-med-03", "prog-erap-04"]
  },
  {
    id: "doc-birth-cert",
    title: "NADRA Child Registration Certificate (B-Form)",
    status: "needed",
    associatedProgramIds: ["prog-wic-02", "prog-med-03"]
  },
  {
    id: "doc-lease",
    title: "Signed Residential Tenancy Agreement",
    status: "needed",
    associatedProgramIds: ["prog-erap-04"]
  }
];

export const INITIAL_ACTION_PLAN: ActionPlanItem[] = [
  {
    id: "act-1",
    title: "Submit PESSI Worker Unemployment Relief Claim",
    description: "Submit online salary slips and separation statement on the provincial labor portal to begin Rs 15,000 – Rs 25,000 / mo benefit processing.",
    programId: "prog-uim-01",
    programName: "Worker Unemployment Relief",
    priority: "immediate",
    deadline: "Within 3 days (Before Sunday)",
    deadlineDays: 3,
    completed: false,
    relatedDocId: "doc-sep-notice",
    actionType: "apply",
    sourceUrl: "https://pessi.punjab.gov.pk"
  },
  {
    id: "act-2",
    title: "Register for BISP Nashonuma Maternal Nutrition Support",
    description: "Visit nearest Tehsil health facility with infant B-Form to enroll for Rs 8,000 – Rs 12,500 / quarter stipend and nutritional packages.",
    programId: "prog-wic-02",
    programName: "BISP Nashonuma Program",
    priority: "immediate",
    deadline: "Tomorrow (Within 48 hours)",
    deadlineDays: 1,
    completed: false,
    relatedDocId: "doc-birth-cert",
    actionType: "contact_agency",
    sourceUrl: "https://bisp.gov.pk"
  },
  {
    id: "act-3",
    title: "Obtain Layoff Notice from Industrial Employer",
    description: "Request official written Separation Certificate confirming involuntary layoff date for social support verification.",
    programName: "All Programs (Universal Proof)",
    priority: "immediate",
    deadline: "Today",
    deadlineDays: 0,
    completed: true,
    actionType: "verification"
  },
  {
    id: "act-4",
    title: "Verify Sehat Sahulat Hospital Family Registration",
    description: "Confirm active family registration status on Sehat Sahulat portal (SMS 8500) for Rs 1,000,000 universal inpatient coverage.",
    programId: "prog-med-03",
    programName: "Sehat Sahulat Program",
    priority: "week_1",
    deadline: "Within 7 days",
    deadlineDays: 7,
    completed: false,
    actionType: "apply",
    sourceUrl: "https://www.pmhealthprogram.gov.pk"
  },
  {
    id: "act-5",
    title: "Submit Emergency Rent Stabilization Application (PBM)",
    description: "Submit tenancy agreement showing Rs 22,000 monthly rent to Pakistan Bait-ul-Mal for emergency one-time hardship relief grant.",
    programId: "prog-erap-04",
    programName: "Bait-ul-Mal Emergency Relief",
    priority: "week_2",
    deadline: "Before 1st of upcoming month",
    deadlineDays: 20,
    completed: false,
    relatedDocId: "doc-lease",
    actionType: "upload_doc"
  }
];

export const INITIAL_CASE_OVERVIEW: CaseOverview = {
  caseId: "HQF-2026-8942",
  status: "matched",
  createdAt: "May 14, 2026",
  updatedAt: "Just now",
  overallProgressPercent: 42,
  activeProgramsCount: 4,
  documentsUploadedCount: 2,
  documentsTotalCount: 5,
  nextRecommendedAction: "Submit PESSI Worker Unemployment Relief Claim before the weekly cutoff",
  scheduledFollowUps: [
    {
      id: "flw-1",
      date: "Tomorrow, 2:00 PM",
      title: "BISP Tehsil Desk Registration",
      type: "appointment",
      programName: "BISP Nashonuma Program"
    },
    {
      id: "flw-2",
      date: "This Sunday, 11:59 PM",
      title: "PESSI First Worker Relief Cycle Cutoff",
      type: "deadline",
      programName: "Worker Unemployment Relief"
    },
    {
      id: "flw-3",
      date: "Next Friday, 5:00 PM",
      title: "Sehat Sahulat SMS 8500 Verification",
      type: "reminder",
      programName: "Sehat Sahulat Program"
    }
  ]
};

export const ALTERNATIVE_DEMO_SCENARIOS = [
  {
    id: "layoff-infant",
    title: "Sudden Industrial Layoff + Infant at Home (Recommended Demo)",
    description: "Unexpected factory job loss, Rs 0 current income, 7-month infant, rent of Rs 22,000 due, medical safety net needed.",
    prompt: "I was unexpectedly laid off two days ago from my factory job in Lahore without warning or severance. I live in Lahore District with my partner and our 7-month-old baby. Our income suddenly dropped to Rs 0, we have monthly rent of Rs 22,000 due in two weeks, and we urgently need infant milk/formula assistance and healthcare protection."
  },
  {
    id: "disability-health",
    title: "Sudden Workplace Injury & Medical Disability",
    description: "Back injury preventing manual work, hospital medical expenses, pharmacy prescriptions, daily income lost.",
    prompt: "I suffered a severe spinal injury at work last week in Rawalpindi that prevents me from standing or working. The doctor advised at least 4 months of bed rest. I have Rs 0 income coming in and need emergency medical treatment under Sehat Card and daily livelihood relief."
  },
  {
    id: "natural-disaster",
    title: "Monsoon Flood Displacement & Emergency Relief",
    description: "Home inundated by heavy monsoon rains, family in temporary municipal camp, emergency food ration and cash needed.",
    prompt: "Our residential home was heavily damaged by flash flood waters yesterday and declared unsafe. My family of 5 is currently sheltering at an emergency community camp. We lost essential food rations and need emergency cash relief of Rs 25,000 and medical support."
  }
];

