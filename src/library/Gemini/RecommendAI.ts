import { GoogleGenerativeAI } from "@google/generative-ai";
import axios from "axios";

interface ContactDetails {
  phone: string;
  email: string;
  emergencyContact: string;
}

interface Address {
  village: string;
  district: string;
  state: string;
  pincode: string;
}

interface ChronicCondition {
  name: string;
  diagnosedDate: string;
  severity: string;
  status: string;
}

interface Allergy {
  allergen: string;
  type: string;
  severity: string;
  reaction: string;
}

interface Medication {
  name: string;
  dosage: string;
  prescribedBy: string;
  nextRefillDate: string;
}

interface HealthReport {
  type: string;
  latestReading: string;
  improvement: boolean;
  improvementValue: string;
}

interface Vaccination {
  vaccineName: string;
  dueDate: string;
  notes: string;
}

interface RecommendedVaccination {
  vaccineName: string;
  priority: string;
  warning: string;
}

interface FamilyMember {
  name: string;
  relationship: string;
  age: number;
  coveredUnderInsurance: boolean;
}

interface GovernmentScheme {
  name: string;
  status: string;
  coverageDetails: string;
}

interface PastMedicalCondition {
  name: string;
  treatment: string;
  startDate: string;
  endDate: string;
}

interface HospitalVisit {
  hospitalName: string;
  date: string;
  doctorName: string;
  diagnosis: string;
}

interface Surgery {
  name: string;
  date: string;
  surgeon: string;
  details: string;
}

interface MedicinePackage {
  name: string;
  active: boolean;
  nextDeliveryDate: string;
  medications: string[];
}

interface VaccinationRecord {
  vaccineName: string;
  date: string;
  location: string;
}

interface UserData {
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  bloodGroup: string;
  address: Address;
  contactDetails: ContactDetails;
  chronicConditions: ChronicCondition[];
  allergies: Allergy[];
  currentMedications: Medication[];
  healthReports: HealthReport[];
  upcomingVaccinations: Vaccination[];
  recommendedVaccinations: RecommendedVaccination[];
  insuranceCoverage: boolean;
  insuranceCoverageAmount: string;
  insuranceValidUntil: string;
  subscriptionBenefits: string[];
  familyDetails: FamilyMember[];
  govtSchemes: GovernmentScheme[];
  pastMedicalConditions: PastMedicalCondition[];
  hospitalVisits: HospitalVisit[];
  surgeries: Surgery[];
  medicinePackages: MedicinePackage[];
  vaccinationRecords: VaccinationRecord[];
}

interface Schemes {
  SchemeTitle: string;
  SchemeProviderState: string;
  SchemeDescription: string;
  benefits: string;
  details: string;
  eligibility: string;
  schemeLink: string;
  _id: string;
}
interface FetchUserDataResponse {
  success: boolean;
  data: UserData;
}
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey as string);
async function fetchUserData(userId: string): Promise<UserData> {
  try {
    const res = await axios.get<FetchUserDataResponse>(
      `https://healthcare-plus-nine.vercel.app/api/get-user-data/${userId}`
    );
    if (!res.data.success) {
      throw new Error("Failed to fetch user data");
    }
    return res.data.data;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}
export async function getSchemeRecommendation(schemes: Schemes[]) {
  const userData: UserData = await fetchUserData("67cab7250b3cc6436cebd7a7");

  const schemesList = schemes
    .map(
      (scheme: Schemes) =>
        `Name: ${scheme.SchemeTitle}, Scheme-provider-State: ${scheme.SchemeProviderState}, Scheme-Description: ${scheme.SchemeDescription}, Scheme-Details:${scheme.details}, Benefits:${scheme.benefits}, Eligibility:${scheme.eligibility}, Scheme-Id:${scheme._id}`
    )
    .join("\n\n");

  const prompt = `Given the following user details:
 - Name: ${userData.firstName} ${userData.lastName}
- Age: ${userData.age}
- Gender: ${userData.gender}
- Blood Group: ${userData.bloodGroup}
- Address: ${userData.address.village}, ${userData.address.district}, ${
    userData.address.state
  }, ${userData.address.pincode}
- Contact Details: Phone: ${userData.contactDetails.phone}, Email: ${
    userData.contactDetails.email
  }, Emergency Contact: ${userData.contactDetails.emergencyContact}
- Chronic Conditions: ${userData.chronicConditions
    .map(
      (condition) =>
        `${condition.name} (Diagnosed: ${condition.diagnosedDate}, Severity: ${condition.severity}, Status: ${condition.status})`
    )
    .join(", ")}
- Allergies: ${userData.allergies
    .map(
      (allergy) =>
        `${allergy.allergen} (Type: ${allergy.type}, Severity: ${allergy.severity}, Reaction: ${allergy.reaction})`
    )
    .join(", ")}
- Current Medications: ${userData.currentMedications
    .map(
      (med) =>
        `${med.name} (Dosage: ${med.dosage}, Prescribed By: ${med.prescribedBy}, Next Refill: ${med.nextRefillDate})`
    )
    .join(", ")}
- Health Reports: ${userData.healthReports
    .map(
      (report) =>
        `${report.type}: ${report.latestReading} (Improvement: ${
          report.improvement ? "Yes" : "No"
        }, Improvement Value: ${report.improvementValue})`
    )
    .join(", ")}
- Upcoming Vaccinations: ${userData.upcomingVaccinations
    .map(
      (vaccine) =>
        `${vaccine.vaccineName} (Due Date: ${vaccine.dueDate}, Notes: ${vaccine.notes})`
    )
    .join(", ")}
- Recommended Vaccinations: ${userData.recommendedVaccinations
    .map(
      (vaccine) =>
        `${vaccine.vaccineName} (Priority: ${vaccine.priority}, Warning: ${vaccine.warning})`
    )
    .join(", ")}
- Insurance Coverage: ${
    userData.insuranceCoverage ? "Yes" : "No"
  } (Coverage Amount: ${userData.insuranceCoverageAmount}, Valid Until: ${
    userData.insuranceValidUntil
  })
- Subscription Benefits: ${userData.subscriptionBenefits.join(", ")}
- Family Details: ${userData.familyDetails
    .map(
      (member) =>
        `${member.name} (Relationship: ${member.relationship}, Age: ${
          member.age
        }, Covered Under Insurance: ${
          member.coveredUnderInsurance ? "Yes" : "No"
        })`
    )
    .join(", ")}
- Government Schemes: ${userData.govtSchemes
    .map(
      (scheme) =>
        `${scheme.name} (Status: ${scheme.status}, Coverage: ${scheme.coverageDetails})`
    )
    .join(", ")}
- Past Medical Conditions: ${userData.pastMedicalConditions
    .map(
      (condition) =>
        `${condition.name} (Treatment: ${condition.treatment}, Dates: ${condition.startDate} to ${condition.endDate})`
    )
    .join(", ")}
- Hospital Visits: ${userData.hospitalVisits
    .map(
      (visit) =>
        `${visit.hospitalName} (Date: ${visit.date}, Doctor: ${visit.doctorName}, Diagnosis: ${visit.diagnosis})`
    )
    .join(", ")}
- Surgeries: ${userData.surgeries
    .map(
      (surgery) =>
        `${surgery.name} (Date: ${surgery.date}, Surgeon: ${surgery.surgeon}, Details: ${surgery.details})`
    )
    .join(", ")}
- Medicine Packages: ${userData.medicinePackages
    .map(
      (pkg) =>
        `${pkg.name} (Active: ${pkg.active ? "Yes" : "No"}, Next Delivery: ${
          pkg.nextDeliveryDate
        }, Medications: ${pkg.medications.join(", ")})`
    )
    .join(", ")}
- Vaccination Records: ${userData.vaccinationRecords
    .map(
      (record) =>
        `${record.vaccineName} (Date: ${record.date}, Location: ${record.location})`
    )
    .join(", ")}
  
  Based on these details, recommend the best government schemes from the list below and some Schemes By yourself in your  knowledge.
  
  **Schemes List:**  
  ${schemesList}

  **Response Format (Always Follow This Structure):**  
  Return the result in **JSON format** with the following structure:

  \`\`\`json
  {
    "recommended_schemes": [
      {
        "name": "Scheme Name",
        "category": "Scheme Category",
        "eligibility": "Eligibility Criteria",
        "reason": "Why this scheme is suitable for the user.",
        "TrustScore": "Give Score based on Scheme in the scale of 1-5",
        "schemeId": "Give 6 unique numeric and alphabetic value"
      }
    ]
  }
  \`\`\`

  Ensure that the response **strictly follows this JSON format** without additional text or explanation.`;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent(prompt);
    const response = await result.response;

    const rawText = await response.text();
    console.log("Raw Response from Gemini:", rawText);

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    const cleanedText = jsonMatch ? jsonMatch[0] : "{}";

    return JSON.parse(cleanedText || "{}");
  } catch (error) {
    console.error("Gemini API Error:", error);
    return { recommended_schemes: [] };
  }
}
