import { BusinessType } from "@/types";

export const DOCUMENT_SUGGESTIONS: Record<BusinessType, string[]> = {
  restaurant: [
    "FSSAI License",
    "Fire NOC",
    "Eating House License",
    "GST Registration",
    "Shop & Establishment Act",
    "Music License",
    "Liquor License",
  ],
  clinic: [
    "Medical Registration Certificate",
    "Clinic Establishment Act License",
    "Biomedical Waste Authorization",
    "Fire NOC",
    "GST Registration",
    "Signage Permission",
  ],
  retail: [
    "Shop & Establishment Act",
    "Trade License",
    "GST Registration",
    "Weights & Measures Certificate",
    "Fire NOC",
  ],
  transport: [
    "Vehicle Insurance",
    "Vehicle PUC Certificate",
    "Vehicle Fitness Certificate",
    "Driver License",
    "National Permit",
    "State Permit",
  ],
  contractor: [
    "Contractor License",
    "Labour License",
    "PF Registration",
    "ESIC Registration",
    "GST Registration",
    "Safety Certificate",
  ],
  other: [
    "Trade License",
    "GST Registration",
    "Shop & Establishment Act",
    "Fire NOC",
  ],
};

export const BUSINESS_TYPE_LABELS: Record<BusinessType, string> = {
  restaurant: "Restaurant / Dhaba",
  clinic: "Medical Clinic",
  retail: "Retail Shop",
  transport: "Transport / Fleet",
  contractor: "Contractor",
  other: "Other",
};
