export const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

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
  is_deceased?: boolean;
  is_blocklisted?: boolean;
  is_cancelled?: boolean;
  is_ifp_voter?: boolean;
  is_yt_voter?: boolean;
  is_target?: boolean;
  is_mf_voter?: boolean;
  is_flagged?: boolean;
  mobile?: string;
  mobile_verified?: boolean;
  wa_optin?: boolean;
  opted_out?: boolean;
  consent_ts?: string;
  consent_source?: string;
  raw_text: string;
  notes: string;
};

export type MessagingNumber = {
  id: string;
  label: string;
  phone: string;
  status: string;            // "active" | "paused"
  daily_cap: number;
  warmup_start: number;
  sent_today: number;
  day_stamp: string;
  paused_reason: string;
  created_at: string;
};

export type Media = {
  id: string;
  filename: string;
  kind: string;              // image | video | document | audio
  url: string;
  size: number;
  created_at: string;
};

export type CampaignStats = Record<string, number>;

export type Campaign = {
  id: string;
  name: string;
  body: string;
  media_path: string;
  media_kind: string;
  status: string;
  total: number;
  schedule_at: string;
  created_at: string;
  stats: CampaignStats;
};

export type CampaignMessage = {
  id: string;
  campaign_id: string;
  voter_id: string;
  to_phone: string;
  number_id: string | null;
  status: string;
  provider_id: string;
  attempts: number;
  last_error: string;
  caption: string;
  media_path: string;
  media_kind: string;
  send_after: string;
  created_at: string;
  updated_at: string;
};

export type PhoneImportResult = {
  total_rows: number;
  phone_rows: number;
  matched: number;
  updated: number;
  not_found_count: number;
};

export type FlagImportResult = {
  total_rows: number;
  serial_rows: number;
  matched: number;
  flagged: number;
  already_flagged: number;
  not_found_count: number;
};

export type SegmentSpecInput = {
  area_te?: string;
  source?: string;
  tag?: string;
};

export const copy = {
  te: {
    title: "ఓటర్ జాబితా సాధనం",
    brand: "ఇస్లామిక్ ఫ్రంట్",
    premium: "IFP Premium Desk",
    subtitle: "ప్రాంతాల వారీగా ఓటర్లను చూసి వర్గీకరించండి",
    login: "ప్రవేశించండి",
    code: "ప్రవేశ కోడ్",
    upload: "PDF అప్లోడ్",
    jobs: "PDF జాబితా",
    allPdfs: "అన్ని PDFలు",
    areas: "ప్రాంతాలు",
    all: "మొత్తం ఓటర్లు",
    total: "మొత్తం",
    photos: "ఫోటోలు",
    search: "పేరు, సీరియల్, D.no/Ward, ప్రాంతం వెతకండి",
    exportAll: "CSV ఎగుమతి",
    exportArea: "ప్రాంతం CSV",
    reprocess: "OCR మళ్లీ అమలు",
    save: "సేవ్",
    photo: "ఫోటో",
    card: "అసలు కార్డు",
    name: "పేరు",
    relation: "తండ్రి పేరు",
    age: "వయస్సు",
    occupation: "వృత్తి",
    house: "D.no/Ward",
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
    areaStats: "ప్రాంతాల మొత్తం పట్టిక",
    overview: "సంగ్రహం",
    selectedArea: "ఎంపిక చేసిన ప్రాంతం",
    deceased: "మరణించిన ఓటర్లు",
    deceasedCount: "మరణించినవారు",
    ifpCount: "IFP ఓటర్లు",
    ifpOnly: "IFP మాత్రమే",
    ifpCore: "పక్కా IFP",
    ifpShare: "IFP శాతం",
    markIfp: "IFP గా గుర్తించండి",
    unmarkIfp: "IFP గుర్తింపు తీసేయండి",
    ytCore: "YT ఓటరు",
    markYt: "YT గా గుర్తించండి",
    unmarkYt: "YT గుర్తింపు తీసేయండి",
    targetCore: "లక్ష్యం",
    markTarget: "లక్ష్యంగా గుర్తించండి",
    unmarkTarget: "లక్ష్యం తీసేయండి",
    mfCore: "MF ఓటరు",
    markMf: "MF గా గుర్తించండి",
    unmarkMf: "MF గుర్తింపు తీసేయండి",
    markedCore: "గుర్తు పెట్టినవారు",
    familyVoting: "కుటుంబ ఓటింగ్",
    familyGroups: "కుటుంబ గృహాలు",
    familyCovered: "కవర్ అయ్యే ఓటర్లు",
    familyMax: "పెద్ద కుటుంబం",
    familyDoor: "D.no/Ward",
    familyMembers: "సభ్యులు",
    familyCount: "కౌంట్",
    familyScope: "ప్రస్తుత ప్రాంతం, వర్గం ఫిల్టర్లలో ఒకే D.no/Ward ఉన్న కుటుంబాలను మాత్రమే చూపిస్తుంది",
    familyRule: "`-` లేదా `/` ఉన్న D.no/Ward విలువలనే ఈ లెక్కల్లో తీసుకుంటుంది",
    familyNoGroups: "ఈ పరిధిలో ఒకే D.no/Ward ఉన్న కుటుంబ గుంపులు లేవు",
    familyOpen: "కుటుంబ జాబితా",
    familyViewMembers: "సభ్యులను చూపండి",
    showDeceased: "మరణించిన జాబితా",
    showBlocklist: "బ్లాక్ లిస్ట్",
    showCancelled: "రద్దు జాబితా",
    showActive: "సక్రియ జాబితా",
    markDeceased: "మరణించినవారిగా మార్చండి",
    markBlocklist: "బ్లాక్ లిస్ట్‌కు మార్చండి",
    markCancelled: "రద్దు జాబితాకు మార్చండి",
    restoreActive: "సక్రియ జాబితాకు మార్చండి",
    currentView: "ప్రస్తుత వీక్షణ",
    missingName: "[పేరు తెలియదు]",
    noVoters: "ఈ వడపోతలో ఓటర్లు లేరు",
    englishPreview: "ఇంగ్లీష్ ప్రివ్యూ",
    manageAreas: "ప్రాంతాల నిర్వహణ",
    rawAreaCount: "ప్రాంతాలు",
    unclassifiedCount: "వర్గీకరించబడలేదు",
    allAreasClassified: "అన్ని ప్రాంతాలు సరిగ్గా వర్గీకరించబడ్డాయి",
    confirmDeceased: "ఈ ఓటర్‌ను మరణించినవారిగా మార్చాలా?",
    confirmYes: "అవును, మార్చండి",
    confirmNo: "రద్దు",
    exportPdf: "PDF ఎగుమతి",
    exportingPdf: "PDF తయారవుతోంది...",
    importPhones: "ఫోన్ నంబర్లు దిగుమతి (Excel)",
    importFlags: "ఫ్లాగ్‌లు దిగుమతి (Excel)",
  },
  en: {
    title: "Voter List Tool",
    brand: "Islamic Front",
    premium: "IFP Premium Desk",
    subtitle: "Browse and classify voters, organized by area",
    login: "Login",
    code: "Access code",
    upload: "Upload PDF",
    jobs: "PDF list",
    allPdfs: "All PDFs",
    areas: "Areas",
    all: "All voters",
    total: "Total",
    photos: "Photos",
    search: "Search name, serial, D.no/Ward, area",
    exportAll: "Export CSV",
    exportArea: "Area CSV",
    reprocess: "Run OCR again",
    save: "Save",
    photo: "Photo",
    card: "Original card",
    name: "Name",
    relation: "F.name",
    age: "Age",
    occupation: "Occupation",
    house: "D.no/Ward",
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
    areaStats: "Area totals",
    overview: "Overview",
    selectedArea: "Selected area",
    deceased: "Deceased voters",
    deceasedCount: "Deceased",
    ifpCount: "IFP voters",
    ifpOnly: "IFP only",
    ifpCore: "IFP core",
    ifpShare: "IFP share",
    markIfp: "Mark as IFP",
    unmarkIfp: "Remove IFP mark",
    ytCore: "YT voter",
    markYt: "Mark as YT",
    unmarkYt: "Remove YT mark",
    targetCore: "Target",
    markTarget: "Mark as Target",
    unmarkTarget: "Remove Target",
    mfCore: "MF voter",
    markMf: "Mark as MF",
    unmarkMf: "Remove MF mark",
    markedCore: "Marked",
    familyVoting: "Family Voting",
    familyGroups: "Family households",
    familyCovered: "Covered voters",
    familyMax: "Largest house",
    familyDoor: "D.no/Ward",
    familyMembers: "Members",
    familyCount: "Count",
    familyScope: "Shows same-household families from the current area and category filters",
    familyRule: "Only D.no/Ward values containing `-` or `/` are included here",
    familyNoGroups: "No same-household family groups found in this scope",
    familyOpen: "Family list",
    familyViewMembers: "Show members",
    showDeceased: "Deceased list",
    showBlocklist: "Block List",
    showCancelled: "Cancelled archive",
    showActive: "Active list",
    markDeceased: "Move to deceased",
    markBlocklist: "Move to block list",
    markCancelled: "Move to cancelled",
    restoreActive: "Restore to active",
    currentView: "Current view",
    missingName: "[Name missing]",
    noVoters: "No voters found for this filter",
    englishPreview: "English preview",
    manageAreas: "Manage Areas",
    rawAreaCount: "area strings",
    unclassifiedCount: "unclassified",
    allAreasClassified: "All areas are classified correctly",
    confirmDeceased: "Mark this voter as deceased?",
    confirmYes: "Yes, mark deceased",
    confirmNo: "Cancel",
    exportPdf: "Export PDF",
    exportingPdf: "Generating PDF...",
    importPhones: "Import phone numbers (Excel)",
    importFlags: "Import flags (Excel)",
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
