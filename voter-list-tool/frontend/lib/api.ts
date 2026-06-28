export const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000";

export type Lang = "te" | "en";
export type SourceFilter = "all" | "life" | "general";

export type Job = {
  id: string;
  filename: string;
  source_kind: "life" | "general";
  source_badge: "L" | "G";
  source_label_te: string;
  source_label_en: string;
  status: string;
  message_te: string;
  created_at: string;
  page_count: number;
  voter_count: number;
  photo_count: number;
  review_count: number;
};

export type Area = {
  area_te: string;
  area_en?: string;
  count: number;
  missing_count: number;
};

export type AreaOption = {
  area_te: string;
  area_en?: string;
};

export type Voter = {
  id: string;
  job_id: string;
  source_filename: string;
  source_kind: "life" | "general";
  source_badge: "L" | "G";
  source_label_te: string;
  source_label_en: string;
  serial_no: string;
  card_no: string;
  name_te: string;
  name_en: string;
  relation_label_te: string;
  relation_name_te: string;
  age: string;
  occupation_te: string;
  house_no: string;
  area_te: string;
  area_en: string;
  page_no: number;
  row_no: number;
  col_no: number;
  photo_url: string;
  card_url: string;
  confidence: number;
  needs_review: boolean;
  raw_text: string;
  notes: string;
};

export const copy = {
  te: {
    title: "ఓటర్ జాబితా సాధనం",
    brand: "ఇస్లామిక్ ఫ్రంట్",
    premium: "IFP Premium Desk",
    subtitle: "PDF అప్లోడ్ చేసి ప్రాంతాల వారీగా ఓటర్లను చూడండి",
    login: "ప్రవేశించండి",
    code: "ప్రవేశ కోడ్",
    upload: "PDF అప్లోడ్",
    jobs: "PDF జాబితా",
    allPdfs: "అన్ని PDFలు",
    areas: "ప్రాంతాలు",
    all: "మొత్తం ఓటర్లు",
    total: "మొత్తం",
    photos: "ఫోటోలు",
    search: "పేరు, సీరియల్, ఇంటి నంబర్, ప్రాంతం వెతకండి",
    exportAll: "CSV ఎగుమతి",
    exportArea: "ప్రాంతం CSV",
    reprocess: "OCR మళ్లీ అమలు",
    save: "సేవ్",
    photo: "ఫోటో",
    card: "అసలు కార్డు",
    name: "పేరు",
    englishName: "English పేరు",
    relation: "తండ్రి పేరు",
    age: "వయస్సు",
    occupation: "వృత్తి",
    house: "ఇంటి నంబర్",
    serial: "క్రమ సంఖ్య",
    area: "ప్రాంతం",
    source: "వర్గం",
    sourceLife: "లైఫ్",
    sourceGeneral: "జనరల్",
    moveArea: "మరొక ప్రాంతానికి మార్చండి",
    mergeArea: "ఈ ప్రాంతాన్ని మరో ప్రాంతంలో కలపండి",
    mergeTarget: "కలపాల్సిన ప్రాంతం",
    mergeAction: "ప్రాంతం కలపండి",
    open: "తెరవండి",
    logout: "లాగౌట్",
    close: "మూసివేయండి",
    missing: "లోపాలు",
    areaSearch: "ప్రాంతం వెతకండి",
    lifeCount: "లైఫ్ ఓటర్లు",
    generalCount: "జనరల్ ఓటర్లు",
    areaBreakdown: "లైఫ్ / జనరల్ విభజన",
    overview: "సంగ్రహం",
    selectedArea: "ఎంపిక చేసిన ప్రాంతం",
  },
  en: {
    title: "Voter List Tool",
    brand: "Islamic Front",
    premium: "IFP Premium Desk",
    subtitle: "Upload PDFs and view voters area-wise",
    login: "Login",
    code: "Access code",
    upload: "Upload PDF",
    jobs: "PDF list",
    allPdfs: "All PDFs",
    areas: "Areas",
    all: "All voters",
    total: "Total",
    photos: "Photos",
    search: "Search name, serial, house number, area",
    exportAll: "Export CSV",
    exportArea: "Area CSV",
    reprocess: "Run OCR again",
    save: "Save",
    photo: "Photo",
    card: "Original card",
    name: "Name",
    englishName: "English name",
    relation: "Father name",
    age: "Age",
    occupation: "Occupation",
    house: "House number",
    serial: "Serial",
    area: "Area",
    source: "Category",
    sourceLife: "Life",
    sourceGeneral: "General",
    moveArea: "Move to another area",
    mergeArea: "Merge this area into another one",
    mergeTarget: "Merge target",
    mergeAction: "Merge area",
    open: "Open",
    logout: "Logout",
    close: "Close",
    missing: "Missing",
    areaSearch: "Search area",
    lifeCount: "Life voters",
    generalCount: "General voters",
    areaBreakdown: "Life / General split",
    overview: "Overview",
    selectedArea: "Selected area",
  },
} as const;

export async function api<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      Authorization: `Bearer ${token}`,
      ...(init.headers || {}),
    },
  });
  if (!res.ok) {
    throw new Error(await res.text());
  }
  return res.json() as Promise<T>;
}
