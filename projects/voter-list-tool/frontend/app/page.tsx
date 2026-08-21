"use client";

import { KeyboardEvent as ReactKeyboardEvent, ReactNode, RefObject, TouchEvent as ReactTouchEvent, useEffect, useMemo, useRef, useState } from "react";
import { API_BASE, AreaOption, FlagImportResult, Job, Lang, PhoneImportResult, SourceFilter, Voter, WhatsappImportResult, api, copy } from "@/lib/api";
import { englishToTeluguName, toEnglishArea, toEnglishName } from "@/lib/transliterate";
import { SecureImage } from "@/components/SecureImage";
import { CampaignConsole } from "@/components/CampaignConsole";

type ScopeStats = {
  total: number;
  life: number;
  general: number;
  missing: number;
  yt: number;
  target: number;
  mf: number;
  ifp: number;
  unknown: number;
  flagged: number;
};

type PartyCategory = "ifp" | "yt" | "target" | "mf" | "unknown" | "flagged";
type AgeFilter = "all" | "youth" | "middle" | "senior";

type AreaTile = {
  key: string;
  label: string;
  aliases: string[];
  aliasSet: Set<string>;
};

type AreaTileSummary = AreaTile & ScopeStats;

type MoveAreaOption = {
  value: string;
  label: string;
};

type FamilyCluster = {
  key: string;
  areaKey: string;
  areaLabel: string;
  houseNo: string;
  count: number;
  life: number;
  general: number;
  ifp: number;
  voters: Voter[];
};

const AGE_FILTERS: Exclude<AgeFilter, "all">[] = ["youth", "middle", "senior"];
const CRITICAL_FIELDS: Array<keyof Voter> = ["serial_no", "name_te", "relation_name_te", "age", "occupation_te", "house_no", "area_te"];

const AREA_TILE_DEFS: Array<{ label: string; aliases: string[] }> = [
  { label: "13th Ward", aliases: ["\u0c07\u0c38\u0c4d\u0c30\u0c3e\u0c02\u0c2a\u0c47\u0c1f", "\u0c07\u0c38\u0c4d\u0c32\u0c3e\u0c02\u0c2a\u0c47\u0c1f", "\u0c1a\u0c3f\u0c28\u0c2a\u0c02\u0c1c\u0c3e \u0c35\u0c40\u0c27\u0c3f", "\u0c24\u0c46\u0c28\u0c3e\u0c32\u0c3f\u0c30\u0c4b\u0c21\u0c4d", "\u0c2e\u0c38\u0c40\u0c26\u0c41 \u0c35\u0c40\u0c27\u0c3f", "\u0c1a\u0c3f\u0c28\u0c4d\u0c28 \u0c2a\u0c02\u0c1c\u0c3e \u0c35\u0c40\u0c27\u0c3f", "\u0c2a\u0c46\u0c26\u0c15\u0c4b\u0c28\u0c47\u0c30\u0c41 \u0c35\u0c40\u0c27\u0c3f", "\u0c15\u0c4b\u0c28\u0c47\u0c30\u0c41 \u0c35\u0c40\u0c27\u0c3f", "\u0c2c\u0c41\u0c21\u0c4d\u0c1c\u0c2f\u0c4d\u0c2f \u0c17\u0c3e\u0c30\u0c3f \u0c35\u0c40\u0c27\u0c3f", "\u0c17\u0c4c\u0c24\u0c2e \u0c2c\u0c41\u0c26\u0c4d\u0c26\u0c3e\u0c30\u0c4b\u0c21\u0c4d", "\u0c2a\u0c40\u0c30\u0c4d\u0c32\u0c2a\u0c02\u0c1c\u0c3e"] },
  { label: "Kothapeta", aliases: ["\u0c15\u0c4a\u0c24\u0c4d\u0c24 \u0c2a\u0c47\u0c1f", "\u0c15\u0c4a\u0c24\u0c4d\u0c24\u0c2a\u0c47\u0c1f", "\u0c15\u0c40 \u0c24\u0c4d\u0c24 \u0c2a\u0c47\u0c1f", "\u0c15\u0c4b \u0c24\u0c4d\u0c30 \u0c2a\u0c47\u0c1f", "\u0c17\u0c4d\u0c30\u0c47\u0c1f\u0c4d \u0c07\u0c02\u0c21\u0c3f\u0c2f\u0c3e \u0c30\u0c4b\u0c21\u0c4d"] },
  { label: "Tipparla Bazar", aliases: ["\u0c1f\u0c3f\u0c2a\u0c4d\u0c2a\u0c30\u0c4d\u0c32 \u0c2c\u0c1c\u0c3e\u0c30\u0c4d", "\u0c1f\u0c3f\u0c2a\u0c4d\u0c2a\u0c30\u0c4d\u0c32\u0c2c\u0c1c\u0c3e\u0c30\u0c4d", "\u0c1f\u0c3f\u0c2a\u0c4d\u0c2a\u0c30\u0c4d\u0c32\u0c2c\u0c1c\u0c3e\u0c30\u0c41", "\u0c1f\u0c40\u0c2a\u0c4d\u0c2a\u0c30\u0c4d\u0c32\u0c2c\u0c1c\u0c3e\u0c30\u0c4d", "\u0c38\u0c40\u0c24\u0c3e\u0c30\u0c3e\u0c2e\u0c3e\u0c02\u0c1c\u0c28\u0c47\u0c2f \u0c2a\u0c47\u0c1f", "\u0c38\u0c40\u0c24\u0c3e\u0c30\u0c3e\u0c2e\u0c3e\u0c02\u0c1c\u0c28\u0c47\u0c2f\u0c2a\u0c47\u0c1f", "\u0c28\u0c4d\u0c2f\u0c42 \u0c2c\u0c4d\u0c35\u0c3e\u0c02\u0c15\u0c4d \u0c15\u0c3e\u0c32\u0c4b\u0c28\u0c40", "\u0c1f\u0c3f, \u0c2c\u0c1c\u0c3e\u0c30\u0c41", "\u0c1f\u0c3f.\u0c2c\u0c1c\u0c3e\u0c30\u0c41", "\u0c1f\u0c3f\u0c2a\u0c4d\u0c2a\u0c30\u0c4d\u0c32 \u0c2c\u0c1c\u0c3e\u0c30\u0c4d, \u0c38\u0c40\u0c24\u0c3e\u0c30\u0c3e\u0c2e\u0c3e\u0c02\u0c1c\u0c28\u0c47\u0c2f \u0c2a\u0c47\u0c1f"] },
  { label: "Manneam Vari Street", aliases: ["\u0c2e\u0c3e\u0c30\u0c4d\u0c15\u0c02\u0c21\u0c47\u0c2f \u0c15\u0c3e\u0c32\u0c4b\u0c28\u0c40", "\u0c2e\u0c3e\u0c30\u0c4d\u0c15\u0c02\u0c21\u0c47\u0c2f\u0c15\u0c3e\u0c32\u0c4b\u0c28\u0c3f", "\u0c2e\u0c28\u0c4d\u0c28\u0c46\u0c02 \u0c35\u0c3e\u0c30\u0c3f \u0c35\u0c40\u0c27\u0c3f", "\u0c1c\u0c46\u0c02\u0c21\u0c3e \u0c1a\u0c46\u0c1f\u0c4d\u0c1f\u0c41", "\u0c17\u0c4b\u0c2a\u0c3e\u0c32\u0c15\u0c43\u0c37\u0c4d\u0c23 \u0c25\u0c3f\u0c2f\u0c47\u0c1f\u0c30\u0c4d \u0c2a\u0c4d\u0c30\u0c15\u0c4d\u0c15 \u0c38\u0c02\u0c26\u0c41", "\u0c38\u0c3f.\u0c15\u0c46. \u0c17\u0c4d\u0c30\u0c4c\u0c02\u0c21\u0c4d", "\u0c17\u0c4b\u0c2a\u0c3e\u0c32\u0c15\u0c43\u0c37\u0c4d\u0c23 \u0c39\u0c3e\u0c32\u0c4d \u0c26\u0c17\u0c4d\u0c17\u0c30", "\u0c17\u0c4b\u0c2a\u0c3e\u0c32\u0c15\u0c43\u0c37\u0c4d\u0c23 \u0c39\u0c3e\u0c32\u0c4d \u0c35\u0c46\u0c28\u0c41\u0c15", "\u0c17\u0c4b\u0c2a\u0c3e\u0c32\u0c15\u0c43\u0c37\u0c4d\u0c23\u0c3e \u0c25\u0c3f\u0c2f\u0c47\u0c1f\u0c30\u0c4d \u0c35\u0c46\u0c28\u0c41\u0c15", "\u0c2e\u0c3e\u0c30\u0c4d\u0c15\u0c02\u0c21\u0c47\u0c2f\u0c2a\u0c47\u0c1f", "\u0c1a\u0c30\u0c4d\u0c1a\u0c3f\u0c30\u0c4b\u0c21\u0c4d", "\u0c15\u0c46\u0c0e\u0c0e\u0c02 \u0c30\u0c46\u0c38\u0c3f\u0c21\u0c46\u0c28\u0c4d\u0c38\u0c40, \u0c2e\u0c3e\u0c30\u0c4d\u0c15\u0c02\u0c21\u0c47\u0c2f \u0c15\u0c3e\u0c32\u0c4b\u0c28\u0c40"] },
  { label: "Old Mangalagiri", aliases: ["\u0c2a\u0c3e\u0c24\u0c2e\u0c02\u0c17\u0c33\u0c17\u0c3f\u0c30\u0c3f", "\u0c2a\u0c4d\u0c30\u0c3e\u0c24\u0c2e\u0c02\u0c17\u0c33\u0c17\u0c3f\u0c30\u0c3f", "\u0c38\u0c40\u0c24\u0c3e\u0c30\u0c3e\u0c2e\u0c15\u0c4b\u0c35\u0c46\u0c32", "\u0c2a\u0c40\u0c30\u0c4d\u0c32\u0c2a\u0c02\u0c1c\u0c3e, \u0c2a\u0c3e\u0c24\u0c2e\u0c02\u0c17\u0c33\u0c17\u0c3f\u0c30\u0c3f", "\u0c26\u0c3f\u0c17\u0c41\u0c21\u0c41 \u0c2c\u0c3e\u0c35\u0c3f \u0c38\u0c46\u0c02\u0c1f\u0c30\u0c4d", "\u0c26\u0c3f\u0c17\u0c41\u0c21\u0c41\u0c2c\u0c3e\u0c35\u0c3f \u0c38\u0c46\u0c02\u0c1f\u0c30\u0c4d", "\u0c38\u0c40\u0c24\u0c3e\u0c30\u0c3e\u0c2e \u0c15\u0c4b\u0c35\u0c46\u0c32 \u0c38\u0c40\u0c1f\u0c4d", "\u0c24\u0c2e\u0c4d\u0c2e\u0c3f\u0c36\u0c46\u0c1f\u0c4d\u0c1f\u0c3f \u0c30\u0c3e\u0c2e\u0c15\u0c43\u0c37\u0c4d\u0c23 \u0c35\u0c40\u0c27\u0c3f", "\u0c2d\u0c26\u0c4d\u0c30\u0c3e\u0c35\u0c24\u0c3f \u0c28\u0c17\u0c30\u0c4d"] },
  { label: "31st Ward", aliases: ["\u0c2a\u0c3e\u0c30\u0c4d\u0c15\u0c41\u0c30\u0c4b\u0c21\u0c4d", "\u0c2a\u0c3e\u0c30\u0c4d\u0c15\u0c4d \u0c30\u0c4b\u0c21\u0c4d", "\u0c2a\u0c3e\u0c30\u0c4d\u0c15\u0c4d \u0c30\u0c4b\u0c21\u0c4d\u0c21\u0c4d\u0c21\u0c41", "\u0c2a\u0c3e\u0c30\u0c4d\u0c15\u0c4d \u0c30\u0c4b\u0c21\u0c4d\u0c32\u0c41", "\u0c2a\u0c3e\u0c30\u0c4d\u0c15\u0c4d \u0c30\u0c4b\u0c21\u0c4d\u0c21\u0c41", "\u0c36\u0c4d\u0c30\u0c40\u0c28\u0c3f\u0c35\u0c3e\u0c38 \u0c2e\u0c39\u0c32\u0c4d", "\u0c2a\u0c3e\u0c30\u0c4d\u0c15\u0c4d\u0c30\u0c4b \u0c21\u0c4d\u0c30\u0c4d", "\u0c2a\u0c3e\u0c24\u0c2c\u0c38\u0c4d\u0c25\u0c3e\u0c02\u0c21\u0c41", "\u0c2a\u0c3e\u0c24\u0c2c\u0c38\u0c4d\u0c1f\u0c3e\u0c02\u0c21\u0c41", "\u0c28\u0c3e\u0c28\u0c3f \u0c38\u0c4d\u0c35\u0c40\u0c1f\u0c4d\u0c38\u0c4d \u0c35\u0c40\u0c27\u0c3f", "\u0c2a\u0c3e\u0c24 \u0c2c\u0c38\u0c4d\u0c1f\u0c3e\u0c02\u0c21\u0c4d, \u0c28\u0c3e\u0c28\u0c3f \u0c38\u0c4d\u0c35\u0c40\u0c1f\u0c4d\u0c38\u0c4d \u0c2c\u0c1c\u0c3e\u0c30\u0c4d"] },
  { label: "Nidamarru Road", aliases: ["\u0c28\u0c3f\u0c21\u0c2e\u0c30\u0c4d\u0c30\u0c41 \u0c30\u0c4b\u0c21\u0c4d", "\u0c2a\u0c3e\u0c24 \u0c2c\u0c4d\u0c35\u0c3e\u0c02\u0c15\u0c4d \u0c15\u0c3e\u0c32\u0c4d\u0c2f\u0c3e\u0c23\u0c3f", "\u0c2c\u0c4d\u0c2f\u0c3e\u0c02\u0c15\u0c4d \u0c15\u0c3e\u0c32\u0c4d\u0c2f\u0c3e\u0c23\u0c3f", "\u0c28\u0c3f\u0c21\u0c2e\u0c30\u0c4d\u0c30 \u0c30\u0c4b\u0c21\u0c4d, \u0c28\u0c3f\u0c2f\u0c30\u0c4d \u0c2c\u0c3f\u0c32\u0c3e\u0c32\u0c4d \u0c2e\u0c38\u0c4d\u0c1f\u0c40\u0c26\u0c4d", "\u0c28\u0c4d\u0c2f\u0c42 \u0c2c\u0c4d\u0c2f\u0c3e\u0c02\u0c15\u0c4d \u0c15\u0c3e\u0c32\u0c4d\u0c2f\u0c3e\u0c23\u0c3f, \u0c28\u0c3f\u0c21\u0c2e\u0c30\u0c4d\u0c30\u0c41 \u0c30\u0c4b\u0c21\u0c4d"] },
  { label: "Bapanaiah Nagar", aliases: ["\u0c2c\u0c3e\u0c2a\u0c28\u0c2f\u0c4d\u0c2f\u0c28\u0c17\u0c30\u0c4d", "\u0c05\u0c1c\u0c2f\u0c4d \u0c28\u0c17\u0c30\u0c4d", "\u0c30\u0c48\u0c32\u0c41 \u0c15\u0c1f\u0c4d\u0c1f"] },
  { label: "Rajiv Gruhakalpa", aliases: ["\u0c30\u0c3e\u0c1c\u0c40\u0c35\u0c4d \u0c17\u0c43\u0c39\u0c15\u0c32\u0c4d\u0c2a", "\u0c06\u0c1f\u0c4b\u0c28\u0c17\u0c30\u0c4d"] },
  { label: "Tidco House", aliases: ["\u0c1f\u0c3f\u0c21\u0c4d\u0c15\u0c4b \u0c39\u0c4c\u0c38\u0c4d", "24\u0c35 \u0c2c\u0c4d\u0c32\u0c3e\u0c15\u0c4d, \u0c1f\u0c3f\u0c21\u0c4d\u0c15\u0c4b", "\u0c0e\u0c28\u0c4d.\u0c06\u0c30\u0c4d.\u0c10. \u0c39\u0c3e\u0c38\u0c4d\u0c2a\u0c3f\u0c1f\u0c32\u0c4d \u0c35\u0c46\u0c28\u0c41\u0c15"] },
  { label: "Ratnalacheruvu", aliases: ["\u0c30\u0c24\u0c4d\u0c28\u0c3e\u0c32 \u0c1a\u0c46\u0c2c\u0c41\u0c35\u0c41", "\u0c30\u0c24\u0c4d\u0c28\u0c3e\u0c32 \u0c1a\u0c46\u0c1c\u0c41\u0c35\u0c41", "\u0c36\u0c4d\u0c30\u0c3e\u0c2e\u0c3f\u0c15 \u0c28\u0c17\u0c30\u0c4d", "\u0c38\u0c42\u0c30\u0c4d\u0c2f\u0c28\u0c3e\u0c30\u0c3e\u0c2f\u0c23 \u0c28\u0c17\u0c30\u0c4d"] },
  { label: "Bhagat Singh Nagar", aliases: ["\u0c2d\u0c17\u0c24\u0c4d\u0c38\u0c3f\u0c02\u0c17\u0c4d \u0c28\u0c17\u0c30\u0c4d"] },
  { label: "Kuppurao Colony", aliases: ["\u0c15\u0c41\u0c2a\u0c4d\u0c2a\u0c41\u0c30\u0c3e\u0c35\u0c41 \u0c15\u0c3e\u0c32\u0c4b\u0c28\u0c40", "\u0c2c\u0c3e\u0c32\u0c3e\u0c1c\u0c40\u0c28\u0c17\u0c30\u0c4d", "\u0c17\u0c3e\u0c02\u0c27\u0c3f \u0c28\u0c17\u0c30\u0c4d"] },
  { label: "Lakshmi Narasimha Colony", aliases: ["\u0c32\u0c15\u0c4d\u0c37\u0c4d\u0c2e\u0c40\u0c28\u0c30\u0c38\u0c3f\u0c02\u0c39\u0c38\u0c4d\u0c35\u0c3e\u0c2e\u0c3f \u0c15\u0c3e\u0c32\u0c4d\u0c2f\u0c3e\u0c23\u0c3f", "\u0c36\u0c4d\u0c30\u0c40\u0c32\u0c15\u0c4d\u0c37\u0c40\u0c28\u0c30\u0c38\u0c3f\u0c02\u0c39\u0c38\u0c4d\u0c35\u0c3e\u0c2e\u0c3f \u0c15\u0c3e\u0c32\u0c4d\u0c2f\u0c3e\u0c23\u0c3f", "\u0c36\u0c4d\u0c30\u0c40\u0c32\u0c15\u0c4d\u0c37\u0c40\u0c28\u0c30\u0c38\u0c3f\u0c02\u0c39\u0c38\u0c4d\u0c35\u0c3e\u0c2e\u0c3f \u0c15\u0c3e\u0c32\u0c4b\u0c28\u0c40", "\u0c36\u0c4d\u0c30\u0c40\u0c32\u0c15\u0c4d\u0c37\u0c4d\u0c2e\u0c40\u0c28\u0c30\u0c38\u0c3f\u0c02\u0c39\u0c38\u0c4d\u0c35\u0c3e\u0c2e\u0c3f \u0c15\u0c3e\u0c32\u0c4d\u0c2f\u0c3e\u0c23\u0c3f"] },
  { label: "Driver Peta", aliases: ["\u0c21\u0c4d\u0c30\u0c48\u0c35\u0c30\u0c4d \u0c2a\u0c47\u0c1f", "\u0c21\u0c4d\u0c30\u0c48\u0c35\u0c30\u0c41 \u0c2a\u0c47\u0c1f"] },
  { label: "Munagala Vari Veedhi", aliases: ["\u0c2e\u0c41\u0c28\u0c17\u0c3e\u0c32 \u0c35\u0c3e\u0c30\u0c3f \u0c35\u0c40\u0c27\u0c3f"] },
  { label: "TTD", aliases: ["\u0c17\u0c02\u0c21\u0c3e\u0c32\u0c2f \u0c2a\u0c47\u0c1f", "\u0c1f\u0c3f\u0c1f\u0c3f\u0c21\u0c3f \u0c15\u0c33\u0c4d\u0c2f\u0c3e\u0c23\u0c2e\u0c02\u0c21\u0c2a\u0c02", "\u0c1f\u0c3f\u0c1f\u0c3f\u0c21\u0c3f \u0c15\u0c32\u0c4d\u0c2f\u0c3e\u0c23 \u0c2e\u0c02\u0c21\u0c2a\u0c02", "\u0c26\u0c4d\u0c35\u0c3e\u0c30\u0c15\u0c3e\u0c28\u0c17\u0c30\u0c4d", "\u0c17\u0c35\u0c30\u0c4d\u0c28\u0c2e\u0c46\u0c02\u0c1f\u0c4d \u0c39\u0c3e\u0c38\u0c4d\u0c2a\u0c3f\u0c1f\u0c32\u0c4d", "\u0c06\u0c02\u0c1c\u0c28\u0c47\u0c2f \u0c15\u0c3e\u0c32\u0c4b\u0c28\u0c40"] },
  { label: "Shahi Masjid", aliases: ["\u0c2a\u0c4b\u0c32\u0c47\u0c30\u0c2e\u0c4d\u0c2e \u0c35\u0c40\u0c27\u0c3f", "\u0c07\u0c02\u0c26\u0c3f\u0c30\u0c3e\u0c28\u0c17\u0c30\u0c4d", "\u0c17\u0c4b\u0c30\u0c40\u0c32 \u0c2c\u0c1c\u0c3e\u0c30\u0c4d"] },
  { label: "Best India", aliases: ["\u0c2f\u0c32\u0c2e\u0c02\u0c26\u0c32 \u0c35\u0c3e\u0c30\u0c3f \u0c35\u0c40\u0c27\u0c3f", "\u0c0e\u0c32\u0c4d.\u0c2c\u0c3f. \u0c28\u0c17\u0c30\u0c4d", "\u0c2d\u0c3e\u0c30\u0c4d\u0c17\u0c35 \u0c2a\u0c47\u0c1f", "\u0c35\u0c21\u0c4d\u0c32\u0c2a\u0c42\u0c21\u0c3f \u0c38\u0c46\u0c02\u0c1f\u0c30\u0c4d"] },
  { label: "APSP", aliases: ["\u0c0e\u0c2a\u0c3f\u0c0e\u0c38\u0c4d\u0c2a\u0c3f \u0c15\u0c4d\u0c2f\u0c3e\u0c02\u0c2a\u0c4d", "\u0c2f\u0c3e\u0c26\u0c35\u0c2a\u0c3e\u0c32\u0c46\u0c02"] },
  { label: "Mangalagiri Mix", aliases: ["\u0c2e\u0c02\u0c17\u0c33\u0c17\u0c3f\u0c30\u0c3f"] },
  { label: "Other Area", aliases: ["\u0c07\u0c24\u0c30 \u0c2a\u0c4d\u0c30\u0c3e\u0c02\u0c24\u0c02"] },
];

// Canonical spellings the backend can store (via /api/areas/merge → canonical_area_te)
// that are missing from AREA_TILE_DEFS. Without these, merged voters land in no tile.
const EXTRA_ALIASES: Record<string, string[]> = {
  "13th Ward": ["ఇసాంపేట"],
  "Tipparla Bazar": ["న్యూ బ్వాంక్ కాలనీ"],
  "Manneam Vari Street": ["మార్కండేయ కాలనీ", "మార్కండేయకాలని"],
  "31st Ward": ["శ్రీనివాస మహల్ సందు", "శ్రీనివాస మహల్ వెనుక", "శ్రీనివాస మహల్ దగ్గర", "శ్రీనివాస మహల్ ప్రక్కన"],
  "Nidamarru Road": ["పాత బ్వాంక్ కాలని", "బ్యాంక్ కాలని"],
  "Kuppurao Colony": ["కుప్పురావు కాలనీ"],
  "Lakshmi Narasimha Colony": ["లక్ష్మీనరసింహస్వామి కాలని", "శ్రీలక్ష్మీనరసింహస్వామి కాలని", "శ్రీలక్షీనరసింహస్వామి కాలని", "శ్రీలక్షీనరసింహస్వామి కాలనీ"],
  "Driver Peta": ["డ్రైవరుపేట", "డైవరుపేట"],
};

const AREA_TILES: AreaTile[] = AREA_TILE_DEFS.map((item) => {
  const aliases = [...item.aliases, ...(EXTRA_ALIASES[item.label] ?? [])];
  return {
    key: item.label.toLowerCase(),
    label: item.label,
    aliases,
    aliasSet: new Set(aliases),
  };
});

const AREA_TILE_ORDER = new Map(AREA_TILES.map((tile, index) => [tile.key, index]));

const MOVE_AREA_OPTIONS: MoveAreaOption[] = AREA_TILES.map((tile) => ({
  value: tile.aliases[0],
  label: tile.label,
}));

function isMissingVoterField(voter: Voter, key: keyof Voter) {
  const value = String(voter[key] || "").trim();
  return !value || value === "/";
}

function voterMissingCount(voter: Voter) {
  return CRITICAL_FIELDS.reduce((acc, key) => acc + (isMissingVoterField(voter, key) ? 1 : 0), 0);
}

// Not in any of the 4 party categories — surfaces voters that still need classifying.
function isUnknownVoter(voter: Voter) {
  return !voter.is_ifp_voter && !voter.is_yt_voter && !voter.is_target && !voter.is_mf_voter;
}

function isMobileDevice() {
  return typeof navigator !== "undefined" && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

function handlePhoneClick(event: React.MouseEvent<HTMLAnchorElement>, mobile: string) {
  if (isMobileDevice()) {
    return; // let the tel: link open the dialer
  }
  event.preventDefault();
  const digits = mobile.replace(/\D/g, "");
  window.open(`https://wa.me/91${digits}`, "_blank", "noopener,noreferrer");
}

function buildVoterHaystack(voter: Voter) {
  return [
    voter.serial_no,
    voter.card_no,
    voter.name_te,
    voter.name_en,
    voter.relation_name_te,
    voter.house_no,
    voter.area_te,
    voter.source_filename,
    voter.mobile,
  ]
    .join(" ")
    .toLowerCase();
}

// haystacks is the precomputed per-voter search string (see searchHaystacks
// below) -- passing it skips rebuilding the same join/toLowerCase on every
// voter on every keystroke-driven filter pass. Falls back to building it
// inline so this stays usable from call sites without the map on hand.
function voterMatchesQuery(voter: Voter, query: string, haystacks?: Map<string, string>) {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return true;
  }
  const haystack = haystacks?.get(voter.id) ?? buildVoterHaystack(voter);
  return haystack.includes(needle);
}

function getAreaTile(voter: Voter) {
  const rawArea = (voter.area_te || "").trim();
  const matched = AREA_TILES.find((tile) => tile.aliasSet.has(rawArea));
  return matched || null;
}

function normalizeHouseNo(value: string) {
  return value.trim().replace(/\s*([/-])\s*/g, "$1").replace(/\s+/g, " ");
}

function isFamilyDoorValue(value: string) {
  const normalized = normalizeHouseNo(value);
  if (!normalized || normalized === "/" || normalized === "-") {
    return false;
  }
  return normalized.includes("-") || normalized.includes("/");
}

function sourceLabel(kind: SourceFilter | "life" | "general", t: (typeof copy)["te"] | (typeof copy)["en"]) {
  if (kind === "life") {
    return t.sourceLife;
  }
  if (kind === "general") {
    return t.sourceGeneral;
  }
  return t.all;
}

function formatPercent(value: number, lang: Lang) {
  const rounded = Math.round(value * 10) / 10;
  return `${new Intl.NumberFormat(lang === "te" ? "te-IN" : "en-IN", {
    minimumFractionDigits: rounded % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1,
  }).format(rounded)}%`;
}

function parseAge(value: string) {
  const normalized = String(value || "")
    .replace(/[౦-౯]/g, (digit) => String("౦౧౨౩౪౫౬౭౮౯".indexOf(digit)))
    .match(/\d+/)?.[0];
  return normalized ? Number.parseInt(normalized, 10) : null;
}

// The stored `age` field is whatever was printed on the voter's card when
// this list was originally collected (2023) -- never overwritten to mean
// "current age" (editing it means correcting an OCR misread, not aging
// someone up). Every place age is *displayed* instead adds how many years
// have passed since 2023, so it stays correct without a yearly manual pass.
const VOTER_LIST_BASE_YEAR = 2023;
function currentAge(value: string) {
  const stored = parseAge(value);
  if (stored === null) return null;
  return stored + (new Date().getFullYear() - VOTER_LIST_BASE_YEAR);
}
function displayAge(value: string) {
  const age = currentAge(value);
  return age === null ? "-" : String(age);
}

// Turns whatever a failed request threw into a message a Telugu-speaking desk
// operator can act on, instead of the raw `{"detail":...}` JSON blob or an
// English fetch-stack string that used to be shown verbatim.
function friendlyError(err: unknown, lang: Lang): string {
  const raw = err instanceof Error ? err.message : String(err ?? "");
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.detail === "string" && parsed.detail.trim()) return parsed.detail;
  } catch { /* not JSON — fall through */ }
  if (/failed to fetch|networkerror|load failed|network request failed/i.test(raw)) {
    return lang === "te" ? "ఇంటర్నెట్ కనెక్షన్ లేదు — మళ్ళీ ప్రయత్నించండి." : "No internet connection — please try again.";
  }
  return lang === "te" ? "ఏదో తప్పు జరిగింది — మళ్ళీ ప్రయత్నించండి." : "Something went wrong — please try again.";
}

// A file-input <label> isn't focusable, so wrapping one in a menu made every
// import keyboard-unreachable. tabIndex + this handler make Enter/Space open
// the native file picker like any other menu item.
function fileMenuItemKeyDown(e: ReactKeyboardEvent<HTMLLabelElement>) {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    (e.currentTarget.querySelector('input[type="file"]') as HTMLInputElement | null)?.click();
  }
}

function voterMatchesAgeFilter(voter: Voter, filter: AgeFilter) {
  if (filter === "all") return true;
  const age = currentAge(voter.age);
  if (age === null) return false;
  if (filter === "youth") return age <= 30;
  if (filter === "middle") return age >= 31 && age <= 50;
  return age >= 51;
}

function ageFilterLabel(filter: Exclude<AgeFilter, "all">, lang: Lang) {
  if (filter === "youth") return lang === "te" ? "యూత్" : "Youth";
  if (filter === "middle") return lang === "te" ? "మిడిల్" : "Middle";
  return lang === "te" ? "సీనియర్" : "Senior";
}

function ageFilterRange(filter: Exclude<AgeFilter, "all">) {
  if (filter === "youth") return "18-30";
  if (filter === "middle") return "31-50";
  return "51+";
}

// Homepage/area-header stat chip — one component for all 8 filterable cards
// (Total is excluded/kept separate since it's not a filter and never drills).
// `onClick` absent renders a static <article> (used for the non-atlas inline
// header, which only ever displays); `drillOnClick` present adds the small
// corner arrow that jumps straight to the flat, all-areas list for this stat.
function StatCard({
  compact,
  colorClass,
  label,
  countLabel,
  share,
  lang,
  active,
  onClick,
  ariaLabel,
  title,
  animKey,
  drillOnClick,
  drillLabel,
}: {
  compact?: boolean;
  colorClass: string;
  label: ReactNode;
  countLabel: string;
  share: number;
  lang: Lang;
  active?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
  title?: string;
  animKey?: string;
  drillOnClick?: () => void;
  drillLabel?: string;
}) {
  const cls = `summaryMetricCard ${colorClass}${compact ? " summaryMetricCompact" : ""}${active ? " isActiveFilter" : ""}`;
  const body = onClick ? (
    <button type="button" className={cls} onClick={onClick} aria-pressed={active} aria-label={ariaLabel} title={title}>
      <span>{label}</span>
      <strong key={animKey} className="popped">{countLabel}</strong>
      <small>{formatPercent(share, lang)}</small>
    </button>
  ) : (
    <article className={cls}>
      <span>{label}</span>
      <strong>{countLabel}</strong>
      <small>{formatPercent(share, lang)}</small>
    </article>
  );
  if (!drillOnClick) {
    return body;
  }
  return (
    <div className="summaryMetricCardWrap">
      {body}
      <button
        type="button"
        className="summaryMetricDrill"
        onClick={(event) => {
          event.stopPropagation();
          drillOnClick();
        }}
        aria-label={drillLabel}
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="m9 6 6 6-6 6" />
        </svg>
      </button>
    </div>
  );
}

function compactFieldFontSize(value: string): string {
  const len = value.trim().length;
  if (len > 14) return "10px";
  if (len > 10) return "11px";
  if (len > 5) return "12px";
  return "13px";
}

// Same floor as compactFieldFontSize's smallest tier (10px) — past this
// length the text can't shrink further, so wrap to a 2nd line instead of
// truncating with an ellipsis (matches isNameAtFontFloor's rationale).
function isFieldAtFontFloor(value: string): boolean {
  return value.trim().length > 14;
}

function nameFontSize(name: string, lang: Lang): string {
  const len = name.trim().length;
  if (lang === "te") {
    // Telugu glyphs are wider — shrink earlier
    if (len > 22) return "10px";
    if (len > 17) return "11.5px";
    if (len > 12) return "13px";
    return "15px";
  }
  // English
  if (len > 26) return "9.5px";
  if (len > 20) return "10.5px";
  if (len > 15) return "12px";
  if (len > 10) return "13.5px";
  return "15px";
}

// Past this length the name is already at its smallest font size and can't
// shrink further — truncating with an ellipsis at that point silently hides
// part of someone's name. Wrapping to a 2nd line keeps it fully visible.
function isNameAtFontFloor(name: string, lang: Lang): boolean {
  const len = name.trim().length;
  return lang === "te" ? len > 22 : len > 26;
}

function displayName(voter: Pick<Voter, "name_te" | "name_en">, lang: Lang, fallback: string) {
  if (lang === "te") {
    return voter.name_te || voter.name_en || fallback;
  }
  return voter.name_en || toEnglishName(voter.name_te || "", fallback) || fallback;
}

function displayRelation(text: string, lang: Lang) {
  if (lang === "te") {
    return text || "-";
  }
  return toEnglishName(text || "", text || "-") || "-";
}

function displayArea(voter: Pick<Voter, "area_te" | "area_en">, lang: Lang) {
  if (lang === "te") {
    return voter.area_te || "-";
  }
  return toEnglishArea(voter.area_te || "", voter.area_en || "Other Area") || voter.area_en || voter.area_te || "-";
}

function waStatusLabel(voter: Pick<Voter, "has_whatsapp">, lang: Lang): string {
  if (voter.has_whatsapp === true) return lang === "te" ? "ఉంది" : "Yes";
  if (voter.has_whatsapp === false) return lang === "te" ? "లేదు" : "No";
  return lang === "te" ? "తెలియదు" : "Unknown";
}

// Hover tooltip for the T/YT/MF/IFP tags — spelled out in full since the
// bare letters mean nothing to a new field worker.
const TAG_TOOLTIPS: Record<"target" | "yt" | "mf" | "ifp" | "unknown", { te: string; en: string }> = {
  target: { te: "లక్ష్యం", en: "Target" },
  yt: { te: "యువ తరం (Yuva Taram)", en: "Yuva Taram" },
  mf: { te: "ముస్లిం ఫ్రంట్ (Muslim Front)", en: "Muslim Front" },
  ifp: { te: "ఇస్లామిక్ ఫ్రంట్ పార్టీ", en: "Islamic Front Party" },
  unknown: { te: "IFP, T, MF, YT ఏదీ కాదు", en: "Not IFP, T, MF, or YT" },
};
function tagTooltip(code: "target" | "yt" | "mf" | "ifp" | "unknown", lang: Lang): string {
  return lang === "te" ? TAG_TOOLTIPS[code].te : TAG_TOOLTIPS[code].en;
}

// Fixed display order + export-filename label for each filter chip, so a
// multiselect like {mf, flagged} always renders/exports as "MF+Marked".
const PARTY_FILTER_EXPORT_LABEL: Record<PartyCategory, string> = {
  ifp: "IFP",
  target: "T",
  yt: "YT",
  mf: "MF",
  unknown: "Unknown",
  flagged: "Marked",
};
const PARTY_FILTER_ORDER: PartyCategory[] = ["ifp", "target", "yt", "mf", "unknown", "flagged"];
// PDF export only: bright tints (readable on the header's dark green
// background) for each category suffix, e.g. "31st Ward T" -> "T" in red.
const PDF_HEADER_SUFFIX_COLOR: Record<PartyCategory, string> = {
  ifp: "#6ee7b7",
  target: "#fca5a5",
  yt: "#c4b5fd",
  mf: "#5eead4",
  unknown: "#d1d5db",
  flagged: "#fde68a",
};
// IFP/Target/YT/MF are mutually-exclusive primary-category tags in practice
// (a voter belongs to at most one), so multiselecting within this group is an
// OR ("show IFP or Target or YT or MF combined"), not an AND that would
// always come back empty. Unknown/Flagged are cross-cutting attributes, so
// they stay AND'd against everything (e.g. IFP+Flag means "IFP voters who
// are also flagged").
const PARTY_GROUP: PartyCategory[] = ["ifp", "target", "yt", "mf"];

// Small reusable icon set — replaces emoji glyphs (★☆📊⚠⏳⬆) that render
// inconsistently across platforms and can't take a color/size from CSS.
function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z" />
    </svg>
  );
}
function ChartIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <path d="M4 20V10M12 20V4M20 20v-6" />
    </svg>
  );
}
function WarningIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M12 9v4M12 17h.01M10.3 3.9 2.8 17a1.8 1.8 0 0 0 1.5 2.7h15.4a1.8 1.8 0 0 0 1.5-2.7L13.7 3.9a1.8 1.8 0 0 0-3.4 0Z" />
    </svg>
  );
}
function SpinnerIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="spinnerIcon">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
function UploadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20V6M6 11l6-6 6 6M5 20h14" />
    </svg>
  );
}
function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 4v14M6 13l6 6 6-6M5 20h14" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
function FlagIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M6 21V4" />
      <path d="M6 4h12.2a1 1 0 0 1 .8 1.6l-3.4 4.4 3.4 4.4a1 1 0 0 1-.8 1.6H6" fill="currentColor" />
    </svg>
  );
}
function NoWhatsappIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M4.5 20.5 6.4 15a8 8 0 1 1 3.4 3.2z" />
      <path d="M3 3l18 18" />
    </svg>
  );
}
function MoreIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  );
}

const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

// Focus management for modal dialogs (WCAG 2.4.3): on open, moves focus into
// the dialog and traps Tab/Shift+Tab inside it; on close, restores focus to
// whatever triggered the open so keyboard/screen-reader users never land in
// the hidden page behind the overlay.
function useModalFocusTrap(containerRef: RefObject<HTMLElement | null>, isOpen: boolean) {
  const triggerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    triggerRef.current = document.activeElement as HTMLElement | null;
    const container = containerRef.current;
    if (!container) return;

    const getFocusable = () =>
      Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)).filter((el) => el.offsetParent !== null);

    const firstFocusable = getFocusable()[0];
    (firstFocusable || container).focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Tab") return;
      const items = getFocusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    container.addEventListener("keydown", onKeyDown);
    return () => {
      container.removeEventListener("keydown", onKeyDown);
      triggerRef.current?.focus?.();
    };
  }, [isOpen, containerRef]);
}

export default function Home() {
  const topbarRef = useRef<HTMLElement | null>(null);
  const stickyZoneRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const voterModalRef = useRef<HTMLElement | null>(null);
  const areaMgrRef = useRef<HTMLElement | null>(null);
  const deceasedRef = useRef<HTMLElement | null>(null);
  const blocklistRef = useRef<HTMLElement | null>(null);
  const cancelledRef = useRef<HTMLElement | null>(null);
  const familyRef = useRef<HTMLElement | null>(null);
  const areaStatsRef = useRef<HTMLElement | null>(null);
  const confirmDialogRef = useRef<HTMLElement | null>(null);
  const moreMenuRef = useRef<HTMLDivElement | null>(null);
  const sheetDragStartY = useRef(0);
  const sheetDragActive = useRef(false);
  const sheetDragDistance = useRef(0);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [lang, setLang] = useState<Lang>("te");

  // layout.tsx hardcodes lang="te"; keep the document's declared language in
  // sync with the toggle so screen readers use correct pronunciation rules
  // for whichever language is actually on screen (WCAG 3.1.1).
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);
  const t = copy[lang];
  const [token, setToken] = useState("");
  const [code, setCode] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedTile, setSelectedTile] = useState("");
  const [source, setSource] = useState<SourceFilter>("all");
  const [ageFilter, setAgeFilter] = useState<AgeFilter>("all");
  const [showDeceasedMgr, setShowDeceasedMgr] = useState(false);
  const [showBlocklistMgr, setShowBlocklistMgr] = useState(false);
  const [showCancelledMgr, setShowCancelledMgr] = useState(false);
  const [showFamilyMgr, setShowFamilyMgr] = useState(false);
  // Multiselect: clicking a chip toggles its membership. IFP/Target/YT/MF
  // combine as OR with each other (mutually-exclusive primary-category tags);
  // Unknown/Flagged AND against the rest — see PARTY_GROUP / scopedVoters below.
  const [partyFilters, setPartyFilters] = useState<Set<PartyCategory>>(new Set());
  const togglePartyFilter = (cat: PartyCategory) => {
    setPartyFilters((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  };
  // Homepage stat-card "drill in" arrow — jumps straight to the flat,
  // all-areas voter list isolated to exactly this one stat (unlike clicking
  // the card body, which stays on the area-wise atlas view).
  const openAllFor = (kind: "life" | "general" | PartyCategory) => {
    if (kind === "life" || kind === "general") {
      setSource(kind);
      setPartyFilters(new Set());
    } else {
      setSource("all");
      setPartyFilters(new Set([kind]));
    }
    setBrowseAll(true);
  };
  const [query, setQuery] = useState("");
  // query updates the input instantly (so typing never feels laggy);
  // debouncedQuery is what the expensive filter passes actually key off,
  // so a full re-filter of up to ~2,876 voters runs once per typing pause
  // instead of once per keystroke.
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 150);
    return () => clearTimeout(timer);
  }, [query]);
  const [exactHouseNoFilter, setExactHouseNoFilter] = useState("");
  const [allVoters, setAllVoters] = useState<Voter[]>([]);
  const [selected, setSelected] = useState<Voter | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [ifpBusyId, setIfpBusyId] = useState("");
  const [ytBusyId, setYtBusyId] = useState("");
  const [targetBusyId, setTargetBusyId] = useState("");
  const [mfBusyId, setMfBusyId] = useState("");
  const [flagBusyId, setFlagBusyId] = useState("");
  const [noWaBusyId, setNoWaBusyId] = useState("");
  const [pdfBusy, setPdfBusy] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [browseAll, setBrowseAll] = useState(false);
  const [votersLoading, setVotersLoading] = useState(false);
  const [voterLoadFailed, setVoterLoadFailed] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");
  const [showAreaMgr, setShowAreaMgr] = useState(false);
  const [showAreaStats, setShowAreaStats] = useState(false);
  // Replaces window.confirm — the OS dialog's buttons render in the device's
  // system language and don't say what they do, which is the wrong UX for
  // the app's most consequential actions (mark deceased, blocklist, cancel).
  const [confirmDialog, setConfirmDialog] = useState<{ message: string; onConfirm: () => void } | null>(null);
  const [showCampaigns, setShowCampaigns] = useState(false);
  const [rawAreas, setRawAreas] = useState<{ area_te: string; count: number; missing_count: number }[]>([]);
  const [knownAreaOptions, setKnownAreaOptions] = useState<AreaOption[]>([]);
  const [mergeTargets, setMergeTargets] = useState<Record<string, string>>({});
  const [visibleCount, setVisibleCount] = useState(120);
  const [nameMode, setNameMode] = useState<"te" | "en">("en");
  const [nameEnDraft, setNameEnDraft] = useState("");
  const originalSelectedRef = useRef<Voter | null>(null);

  useEffect(() => {
    if (selected) {
      setNameEnDraft(selected.name_en || "");
      setNameMode(lang === "te" ? "te" : "en");
      originalSelectedRef.current = selected;
      setError("");
    } else {
      originalSelectedRef.current = null;
    }
  }, [selected?.id]);

  useEffect(() => {
    const saved = localStorage.getItem("voter-token");
    const savedLang = localStorage.getItem("voter-lang") as Lang | null;
    if (saved) {
      setToken(saved);
    }
    if (savedLang === "en" || savedLang === "te") {
      setLang(savedLang);
    }
  }, []);

  // Restore area/filter selection from the URL on load (audit finding: a
  // refresh mid-canvass -- area + source + age + party filters set -- reset
  // straight back to the bare atlas). Runs once; the mirror effect below
  // keeps the URL in sync as these change so a reload lands back here.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const area = params.get("area");
    if (area && AREA_TILES.some((tile) => tile.key === area)) setSelectedTile(area);
    if (params.get("all") === "1") setBrowseAll(true);
    const src = params.get("source");
    if (src === "life" || src === "general") setSource(src);
    const age = params.get("age");
    if (age === "youth" || age === "middle" || age === "senior") setAgeFilter(age);
    const party = params.get("party");
    if (party) {
      const cats = party.split(",").filter((c): c is PartyCategory => PARTY_FILTER_ORDER.includes(c as PartyCategory));
      if (cats.length) setPartyFilters(new Set(cats));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedTile) params.set("area", selectedTile);
    if (browseAll) params.set("all", "1");
    if (source !== "all") params.set("source", source);
    if (ageFilter !== "all") params.set("age", ageFilter);
    if (partyFilters.size) params.set("party", Array.from(partyFilters).join(","));
    const qs = params.toString();
    // replaceState, not pushState -- filter tweaks shouldn't pile up in
    // history (that's what the modal-open trap above uses pushState for);
    // this only needs to survive a refresh, not be Back-button-navigable.
    const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(window.history.state, "", url);
  }, [selectedTile, browseAll, source, ageFilter, partyFilters]);

  useEffect(() => {
    document.documentElement.lang = lang;
    localStorage.setItem("voter-lang", lang);
  }, [lang]);

  useEffect(() => {
    if (!stickyZoneRef.current) {
      return;
    }
    const root = document.documentElement;
    const applyStickyMetrics = () => {
      const zoneH = Math.ceil(stickyZoneRef.current!.getBoundingClientRect().height);
      root.style.setProperty("--sticky-top", `${zoneH}px`);
      if (topbarRef.current) {
        root.style.setProperty("--topbar-height", `${Math.ceil(topbarRef.current.getBoundingClientRect().height)}px`);
      }

    };
    applyStickyMetrics();
    const observer = new ResizeObserver(() => applyStickyMetrics());
    observer.observe(stickyZoneRef.current);
    window.addEventListener("resize", applyStickyMetrics);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", applyStickyMetrics);
    };
  }, [lang, token, selectedTile]);

  useEffect(() => {
    if (!token) {
      return;
    }
    void refreshJobs();
    const timer = setInterval(() => void refreshJobs(), 4000);
    return () => clearInterval(timer);
  }, [token]);

  useEffect(() => {
    if (!token) {
      return;
    }
    void loadAllVoters();
  }, [token]);

  const countFormatter = useMemo(
    () => new Intl.NumberFormat(lang === "te" ? "te-IN" : "en-IN"),
    [lang],
  );

  function formatCount(value: number) {
    return countFormatter.format(value);
  }

  async function login() {
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        setError(lang === "te" ? "ప్రవేశ కోడ్ సరైనది కాదు" : "Access code is invalid");
        return;
      }
      const data = await res.json() as { token: string };
      localStorage.setItem("voter-token", data.token);
      setToken(data.token);
    } catch {
      setError(lang === "te" ? "సర్వర్‌కు కనెక్ట్ అవలేదు" : "Could not connect to server");
    }
  }

  async function refreshJobs() {
    try {
      const res = await fetch(`${API_BASE}/api/jobs`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        // Session expired / token invalidated (e.g. backend restart). Tell the
        // user why they're back at login instead of silently bouncing them.
        localStorage.removeItem("voter-token");
        setError(lang === "te"
          ? "సెషన్ ముగిసింది — దయచేసి మళ్ళీ ప్రవేశించండి."
          : "Session expired — please log in again.");
        setToken("");
        return;
      }
      if (!res.ok) return; // transient server error — keep session alive
      setJobs(await res.json() as Job[]);
    } catch {
      // network error — don't logout
    }
  }

  async function loadAllVoters() {
    setVotersLoading(true);
    setVoterLoadFailed(false);
    try {
      setAllVoters(await api<Voter[]>("/api/voters?include_deceased=1&include_blocklisted=1&include_cancelled=1", token));
    } catch (err) {
      setVoterLoadFailed(true);
      setError(friendlyError(err, lang));
    } finally {
      setVotersLoading(false);
    }
  }

  function syncPatchedVoter(saved: Voter) {
    setAllVoters((prev) => prev.map((item) => (item.id === saved.id ? { ...item, ...saved } : item)));
    setSelected((prev) => (prev?.id === saved.id ? { ...prev, ...saved } : prev));
  }

  async function patchVoter(voter: Pick<Voter, "id" | "job_id">, patch: Record<string, unknown>) {
    const saved = await api<Voter>(`/api/jobs/${voter.job_id}/voters/${voter.id}`, token, {
      method: "PATCH",
      body: JSON.stringify(patch),
    });
    syncPatchedVoter(saved);
    return saved;
  }

  async function upload(file: File | null) {
    if (!file) {
      return;
    }
    setBusy(true);
    setError("");
    setLiveMessage(lang === "te" ? `"${file.name}" అప్‌లోడ్ అవుతోంది…` : `Uploading "${file.name}"…`);
    const form = new FormData();
    form.append("file", file);
    try {
      await api<Job>("/api/jobs", token, { method: "POST", body: form });
      setLiveMessage(lang === "te" ? `"${file.name}" ఎక్కించబడింది, ప్రాసెస్ అవుతోంది` : `"${file.name}" uploaded — processing in the background`);
      await refreshJobs();
      await loadAllVoters();
    } catch (err) {
      setLiveMessage(lang === "te" ? `"${file.name}" అప్‌లోడ్ విఫలమైంది` : `Upload of "${file.name}" failed`);
      setError(friendlyError(err, lang));
    } finally {
      setBusy(false);
    }
  }

  async function importPhones(file: File | null) {
    if (!file) {
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    setLiveMessage(lang === "te" ? `"${file.name}" దిగుమతి అవుతోంది…` : `Importing "${file.name}"…`);
    const form = new FormData();
    form.append("file", file);
    try {
      const result = await api<PhoneImportResult>("/api/voters/import-phones", token, { method: "POST", body: form });
      const msg =
        lang === "te"
          ? `"${file.name}" దిగుమతి పూర్తయింది — ${result.updated} మంది సభ్యులకు ఫోన్ నంబర్లు నవీకరించబడ్డాయి (${result.matched}/${result.phone_rows} సరిపోలాయి, ${result.not_found_count} సరిపోలలేదు)`
          : `"${file.name}" imported — updated phone numbers for ${result.updated} members (${result.matched}/${result.phone_rows} matched, ${result.not_found_count} not found)`;
      setLiveMessage(msg);
      setNotice(msg);
      await loadAllVoters();
    } catch (err) {
      setLiveMessage(lang === "te" ? `"${file.name}" దిగుమతి విఫలమైంది` : `Import of "${file.name}" failed`);
      setError(friendlyError(err, lang));
    } finally {
      setBusy(false);
    }
  }

  async function importFlags(file: File | null) {
    if (!file) {
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    setLiveMessage(lang === "te" ? `"${file.name}" దిగుమతి అవుతోంది…` : `Importing "${file.name}"…`);
    const form = new FormData();
    form.append("file", file);
    try {
      const result = await api<FlagImportResult>("/api/voters/import-flags", token, { method: "POST", body: form });
      const msg =
        lang === "te"
          ? `"${file.name}" దిగుమతి పూర్తయింది — ${result.flagged} మంది సభ్యులు ఫ్లాగ్ చేయబడ్డారు (${result.already_flagged} ఇప్పటికే ఫ్లాగ్ చేయబడ్డారు, ${result.not_found_count} సరిపోలలేదు)`
          : `"${file.name}" imported — flagged ${result.flagged} members (${result.already_flagged} already flagged, ${result.not_found_count} not found)`;
      setLiveMessage(msg);
      setNotice(msg);
      await loadAllVoters();
    } catch (err) {
      setLiveMessage(lang === "te" ? `"${file.name}" దిగుమతి విఫలమైంది` : `Import of "${file.name}" failed`);
      setError(friendlyError(err, lang));
    } finally {
      setBusy(false);
    }
  }

  async function importWhatsappStatus(file: File | null) {
    if (!file) {
      return;
    }
    setBusy(true);
    setError("");
    setNotice("");
    setLiveMessage(lang === "te" ? `"${file.name}" దిగుమతి అవుతోంది…` : `Importing "${file.name}"…`);
    const form = new FormData();
    form.append("file", file);
    try {
      const result = await api<WhatsappImportResult>("/api/voters/import-whatsapp-status", token, { method: "POST", body: form });
      const msg =
        lang === "te"
          ? `"${file.name}" దిగుమతి పూర్తయింది — ${result.updated} మంది సభ్యుల WhatsApp స్థితి నవీకరించబడింది (${result.marked_no} WhatsApp లేదు, ${result.matched}/${result.status_rows} సరిపోలాయి, ${result.not_found_count} సరిపోలలేదు)`
          : `"${file.name}" imported — updated WhatsApp status for ${result.updated} members (${result.marked_no} marked no WhatsApp, ${result.matched}/${result.status_rows} matched, ${result.not_found_count} not found)`;
      setLiveMessage(msg);
      setNotice(msg);
      await loadAllVoters();
    } catch (err) {
      setLiveMessage(lang === "te" ? `"${file.name}" దిగుమతి విఫలమైంది` : `Import of "${file.name}" failed`);
      setError(friendlyError(err, lang));
    } finally {
      setBusy(false);
    }
  }

  async function saveSelected() {
    if (!selected) {
      return;
    }
    const mobileDigits = String(selected.mobile || "").replace(/\D/g, "");
    if (mobileDigits.length !== 0 && mobileDigits.length !== 10) {
      setError(lang === "te" ? "మొబైల్ నంబర్ 10 అంకెలు ఉండాలి" : "Mobile number must be 10 digits");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const intended: Record<string, unknown> = {
        serial_no: selected.serial_no,
        name_te: selected.name_te,
        relation_name_te: selected.relation_name_te,
        age: selected.age,
        occupation_te: selected.occupation_te,
        house_no: selected.house_no,
        area_te: selected.area_te,
        is_deceased: Boolean(selected.is_deceased),
        is_blocklisted: Boolean(selected.is_blocklisted),
        is_cancelled: Boolean(selected.is_cancelled),
        is_ifp_voter: Boolean(selected.is_ifp_voter),
        is_yt_voter: Boolean(selected.is_yt_voter),
        is_target: Boolean(selected.is_target),
        is_mf_voter: Boolean(selected.is_mf_voter),
        notes: selected.notes,
        mobile: mobileDigits,
        wa_optin: Boolean(selected.wa_optin),
      };
      if (nameMode === "en") intended.name_en = nameEnDraft;

      // Send only fields actually changed in this session, not the whole
      // snapshot -- a full-object PATCH would silently revert any field a
      // different desk saved on this same voter after this session's copy
      // was loaded (concurrent-edit overwrite; audit finding).
      const original = originalSelectedRef.current as Record<string, unknown> | null;
      const patch: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(intended)) {
        const prev = original ? original[key] : undefined;
        const changed = typeof value === "boolean" ? Boolean(prev) !== value : (prev ?? "") !== (value ?? "");
        if (changed) patch[key] = value;
      }
      // Stamp consent only when this session is the one turning opt-in on.
      if (patch.wa_optin === true && !selected.consent_ts) {
        patch.consent_ts = new Date().toISOString();
        patch.consent_source = "desk";
      }
      if (Object.keys(patch).length === 0) {
        closeModalInternal();
        return;
      }
      await patchVoter(selected, patch);
      setLiveMessage(lang === "te" ? "మార్పులు సేవ్ అయ్యాయి" : "Changes saved");
      closeModalInternal();
    } catch (err) {
      setError(friendlyError(err, lang));
    } finally {
      setBusy(false);
    }
  }

  // Radio-group tag toggles clear the other 3 flags silently — announce both
  // the new tag and whatever got cleared so screen-reader users aren't left
  // guessing why a voter's classification just changed (WCAG 4.1.3).
  function announceTagToggle(voter: Voter, label: string, next: boolean) {
    if (!next) {
      setLiveMessage(lang === "te" ? `${label} తీసివేయబడింది` : `${label} removed`);
      return;
    }
    const cleared = [
      voter.is_ifp_voter && "IFP",
      voter.is_yt_voter && "YT",
      voter.is_target && "T",
      voter.is_mf_voter && "MF",
    ].filter((l): l is string => Boolean(l) && l !== label);
    setLiveMessage(
      cleared.length
        ? (lang === "te" ? `${cleared.join(", ")} తీసివేసి ${label} గా గుర్తించారు` : `${cleared.join(", ")} removed, marked as ${label}`)
        : (lang === "te" ? `${label} గా గుర్తించారు` : `Marked as ${label}`),
    );
  }

  async function toggleIfpVoter(voter: Voter) {
    const next = !Boolean(voter.is_ifp_voter);
    const patch = next
      ? { is_ifp_voter: true, is_yt_voter: false, is_target: false, is_mf_voter: false }
      : { is_ifp_voter: false };
    announceTagToggle(voter, "IFP", next);
    setAllVoters((prev) => prev.map((v) => (v.id === voter.id ? { ...v, ...patch } : v)));
    setIfpBusyId(voter.id);
    setError("");
    try {
      await patchVoter(voter, patch);
    } catch (err) {
      setAllVoters((prev) => prev.map((v) => (v.id === voter.id ? { ...v, is_ifp_voter: voter.is_ifp_voter, is_yt_voter: voter.is_yt_voter, is_target: voter.is_target, is_mf_voter: voter.is_mf_voter } : v)));
      setError(friendlyError(err, lang));
    } finally {
      setIfpBusyId("");
    }
  }

  async function toggleYtVoter(voter: Voter) {
    const next = !Boolean(voter.is_yt_voter);
    const patch = next
      ? { is_yt_voter: true, is_ifp_voter: false, is_target: false, is_mf_voter: false }
      : { is_yt_voter: false };
    announceTagToggle(voter, "YT", next);
    setAllVoters((prev) => prev.map((v) => (v.id === voter.id ? { ...v, ...patch } : v)));
    setYtBusyId(voter.id);
    setError("");
    try {
      await patchVoter(voter, patch);
    } catch (err) {
      setAllVoters((prev) => prev.map((v) => (v.id === voter.id ? { ...v, is_yt_voter: voter.is_yt_voter, is_ifp_voter: voter.is_ifp_voter, is_target: voter.is_target, is_mf_voter: voter.is_mf_voter } : v)));
      setError(friendlyError(err, lang));
    } finally {
      setYtBusyId("");
    }
  }

  async function toggleTargetVoter(voter: Voter) {
    const next = !Boolean(voter.is_target);
    const patch = next
      ? { is_target: true, is_ifp_voter: false, is_yt_voter: false, is_mf_voter: false }
      : { is_target: false };
    announceTagToggle(voter, "T", next);
    setAllVoters((prev) => prev.map((v) => (v.id === voter.id ? { ...v, ...patch } : v)));
    setTargetBusyId(voter.id);
    setError("");
    try {
      await patchVoter(voter, patch);
    } catch (err) {
      setAllVoters((prev) => prev.map((v) => (v.id === voter.id ? { ...v, is_target: voter.is_target, is_ifp_voter: voter.is_ifp_voter, is_yt_voter: voter.is_yt_voter, is_mf_voter: voter.is_mf_voter } : v)));
      setError(friendlyError(err, lang));
    } finally {
      setTargetBusyId("");
    }
  }

  async function toggleMfVoter(voter: Voter) {
    const next = !Boolean(voter.is_mf_voter);
    const patch = next
      ? { is_mf_voter: true, is_ifp_voter: false, is_yt_voter: false, is_target: false }
      : { is_mf_voter: false };
    announceTagToggle(voter, "MF", next);
    setAllVoters((prev) => prev.map((v) => (v.id === voter.id ? { ...v, ...patch } : v)));
    setMfBusyId(voter.id);
    setError("");
    try {
      await patchVoter(voter, patch);
    } catch (err) {
      setAllVoters((prev) => prev.map((v) => (v.id === voter.id ? { ...v, is_mf_voter: voter.is_mf_voter, is_ifp_voter: voter.is_ifp_voter, is_yt_voter: voter.is_yt_voter, is_target: voter.is_target } : v)));
      setError(friendlyError(err, lang));
    } finally {
      setMfBusyId("");
    }
  }

  // Independent of the T/YT/MF/IFP radio-group — no mutual exclusivity, no
  // descriptive label anywhere (aria-live included), by design.
  async function toggleFlagVoter(voter: Voter) {
    const next = !Boolean(voter.is_flagged);
    const patch = { is_flagged: next };
    setLiveMessage(lang === "te" ? (next ? "గుర్తు పెట్టబడింది" : "గుర్తు తీసివేయబడింది") : (next ? "Marked" : "Unmarked"));
    setAllVoters((prev) => prev.map((v) => (v.id === voter.id ? { ...v, ...patch } : v)));
    setFlagBusyId(voter.id);
    setError("");
    try {
      await patchVoter(voter, patch);
    } catch (err) {
      setAllVoters((prev) => prev.map((v) => (v.id === voter.id ? { ...v, is_flagged: voter.is_flagged } : v)));
      setError(friendlyError(err, lang));
    } finally {
      setFlagBusyId("");
    }
  }

  // Flips a "confirmed no WhatsApp" mark to confirmed-good -- clicked after
  // manually fixing the mobile number, so the desk operator is asserting the
  // corrected number IS on WhatsApp. Same optimistic-update/revert-on-error
  // shape as toggleFlagVoter.
  async function clearNoWhatsapp(voter: Voter) {
    const patch = { has_whatsapp: true };
    setLiveMessage(lang === "te" ? "WhatsApp ఉందని గుర్తించారు" : "Marked as has WhatsApp");
    setAllVoters((prev) => prev.map((v) => (v.id === voter.id ? { ...v, ...patch } : v)));
    setNoWaBusyId(voter.id);
    setError("");
    try {
      await patchVoter(voter, patch);
    } catch (err) {
      setAllVoters((prev) => prev.map((v) => (v.id === voter.id ? { ...v, has_whatsapp: voter.has_whatsapp } : v)));
      setError(friendlyError(err, lang));
    } finally {
      setNoWaBusyId("");
    }
  }

  async function markAndSave(patch: Partial<Voter>) {
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      await patchVoter(selected, patch);
      const msg = patch.is_deceased
        ? (lang === "te" ? "మరణించినవారిగా గుర్తించారు" : "Marked as deceased")
        : patch.is_blocklisted
        ? (lang === "te" ? "బ్లాక్ లిస్ట్‌కు మార్చారు" : "Moved to block list")
        : patch.is_cancelled
        ? (lang === "te" ? "రద్దు జాబితాకు మార్చారు" : "Moved to cancelled")
        : (lang === "te" ? "సక్రియ జాబితాకు పునరుద్ధరించారు" : "Restored to active list");
      setLiveMessage(msg);
      closeModalInternal();
    } catch (err) {
      setError(friendlyError(err, lang));
    } finally {
      setBusy(false);
    }
  }

  function focusFamilyCluster(cluster: FamilyCluster) {
    setSelectedTile(cluster.areaKey);
    setExactHouseNoFilter(cluster.houseNo);
    setShowFamilyMgr(false);
  }

  function closeModalInternal() {
    setSelected(null);
  }

  function isSelectedDirty(): boolean {
    const original = originalSelectedRef.current;
    if (!selected || !original) return false;
    const fields: (keyof Voter)[] = ["serial_no", "name_te", "relation_name_te", "age", "occupation_te", "house_no", "area_te", "mobile"];
    const fieldChanged = fields.some((f) => (selected[f] || "") !== (original[f] || ""));
    const nameEnChanged = nameMode === "en" && nameEnDraft !== (original.name_en || "");
    // mobile is the single most-edited field; wa_optin is a consent record --
    // both were silently lost on backdrop-close before being added here.
    const optinChanged = Boolean(selected.wa_optin) !== Boolean(original.wa_optin);
    return fieldChanged || nameEnChanged || optinChanged;
  }

  function closeModal() {
    if (isSelectedDirty()) {
      const msg = lang === "te"
        ? "మీరు చేసిన మార్పులు సేవ్ కాలేదు. మూసివేయాలా?"
        : "You have unsaved changes. Close without saving?";
      confirmAction(msg, closeModalInternal);
      return;
    }
    closeModalInternal();
  }

  function updateSelectedField<K extends keyof Voter>(key: K, value: Voter[K]) {
    if (!selected) {
      return;
    }
    const next = { ...selected, [key]: value } as Voter;
    if (key === "name_te") {
      next.name_en = toEnglishName(String(value || ""), next.name_en || "");
    }
    if (key === "area_te") {
      next.area_en = toEnglishArea(String(value || ""), next.area_en || "Other Area");
    }
    setSelected(next);
  }

  async function loadRawAreas() {
    const [areas, options] = await Promise.all([
      api<{ area_te: string; count: number; missing_count: number }[]>("/api/areas", token),
      api<AreaOption[]>("/api/area-options", token),
    ]);
    setRawAreas(areas);
    setKnownAreaOptions(options);
  }

  async function mergeArea(fromArea: string) {
    const toArea = mergeTargets[fromArea];
    if (!toArea) return;
    setBusy(true);
    setError("");
    try {
      await api<{ moved_count: number }>("/api/areas/merge", token, {
        method: "POST",
        body: JSON.stringify({ from_area_te: fromArea, to_area_te: toArea }),
      });
      setMergeTargets((prev) => {
        const next = { ...prev };
        delete next[fromArea];
        return next;
      });
      await Promise.all([loadRawAreas(), loadAllVoters()]);
    } catch (err) {
      setError(friendlyError(err, lang));
    } finally {
      setBusy(false);
    }
  }

  // Builds the CSV client-side from filteredVoters — the exact list rendered
  // on screen — so the export always matches area + party filter + source
  // pill + search, instead of the old server round-trip that only knew
  // about area/source and silently dropped the rest.
  function csvField(value: string): string {
    let v = value ?? "";
    // CSV formula-injection guard: a cell opening with = + - @ (or tab/CR) is
    // executed as a formula when the file is opened in Excel/Sheets. Prefix a
    // zero-width-safe apostrophe so it's treated as literal text. Mobile and
    // serial are digit-only server-side, so this effectively only ever fires
    // on hand-entered free text, never mangling a real phone number.
    if (/^[=+\-@\t\r]/.test(v)) v = "'" + v;
    return /[",\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
  }

  function downloadCsv(fileLabel: string) {
    const headers = lang === "te"
      ? ["ప్రాంతం", "క్రమ సంఖ్య", "కార్డ్ సంఖ్య", "పేరు", "తండ్రి/భర్త పేరు", "వయస్సు", "వృత్తి", "ఇంటి నంబర్"]
      : ["Area", "Serial No", "Card No", "Name", "Father/Husband Name", "Age", "Occupation", "House No"];
    const rows = filteredVoters.map((v) => [
      displayArea(v, lang),
      v.serial_no || "",
      v.card_no || "",
      displayName(v, lang, t.missingName),
      displayRelation(v.relation_name_te || "", lang),
      displayAge(v.age),
      v.occupation_te || "",
      v.house_no || "",
    ]);
    const csv = "﻿" + [headers, ...rows].map((row) => row.map(csvField).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = `${fileLabel}.csv`;
    anchor.click();
    URL.revokeObjectURL(href);
  }

  // Every voter with a manual_update_ts -- stamped server-side only when a
  // desk operator hand-edits mobile/has_whatsapp (see routes.py), never by
  // bulk import -- so this is exactly "numbers I touched by hand," across
  // all jobs, ignoring the current area/party/source filters on purpose.
  function downloadUpdatedContactsCsv() {
    const headers = lang === "te"
      ? ["ప్రాంతం", "క్రమ సంఖ్య", "పేరు", "మొబైల్", "WhatsApp స్థితి", "నవీకరించిన సమయం"]
      : ["Area", "Serial No", "Name", "Mobile", "WhatsApp Status", "Updated At"];
    const rows = allVoters
      .filter((v) => v.manual_update_ts)
      .sort((a, b) => String(b.manual_update_ts).localeCompare(String(a.manual_update_ts)))
      .map((v) => [
        displayArea(v, lang),
        v.serial_no || "",
        displayName(v, lang, t.missingName),
        v.mobile || "",
        waStatusLabel(v, lang),
        v.manual_update_ts || "",
      ]);
    const csv = "﻿" + [headers, ...rows].map((row) => row.map(csvField).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = "updated-contacts.csv";
    anchor.click();
    URL.revokeObjectURL(href);
  }

  // Full active roster as serial / name / phone / WhatsApp-status, across all
  // jobs and ignoring the on-screen filters -- the master contact list meant
  // to be pulled fresh each time and synced into an external messaging tool.
  // Archived voters (deceased/blocklisted/cancelled) are excluded so they are
  // never contacted.
  function downloadContactsCsv() {
    const headers = lang === "te"
      ? ["క్రమ సంఖ్య", "పేరు", "ఫోన్", "WhatsApp స్థితి", "ప్రాంతం"]
      : ["Serial No", "Name", "Phone", "WhatsApp Status", "Area"];
    const rows = allVoters
      .filter((v) => !v.is_deceased && !v.is_blocklisted && !v.is_cancelled)
      .slice()
      .sort((a, b) => (Number(a.serial_no) || 0) - (Number(b.serial_no) || 0))
      .map((v) => [
        v.serial_no || "",
        displayName(v, lang, t.missingName),
        v.mobile || "",
        waStatusLabel(v, lang),
        displayArea(v, lang),
      ]);
    const csv = "﻿" + [headers, ...rows].map((row) => row.map(csvField).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = href;
    anchor.download = `ifp-contacts-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(href);
  }

  async function downloadPdf(base: string, categories: PartyCategory[] = []) {
    setPdfBusy(true);
    try {
      // Voter names/relations/house numbers etc. are free-text and get
      // written into a same-origin popup via document.write below, so every
      // interpolated value MUST be HTML-escaped or a value like
      // `<img src=x onerror=...>` executes with the auth token in scope.
      const esc = (s: string) =>
        String(s ?? "").replace(/[&<>"']/g, (c) =>
          ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
      const plainSuffix = categories.map((cat) => PARTY_FILTER_EXPORT_LABEL[cat]).join("+");
      const areaLabel = base + (plainSuffix ? ` ${plainSuffix}` : "");
      const suffixHtml = categories.length
        ? " " + categories
            .map((cat) => `<span style="color:${PDF_HEADER_SUFFIX_COLOR[cat]}">${PARTY_FILTER_EXPORT_LABEL[cat]}</span>`)
            .join('<span style="opacity:.55"> + </span>')
        : "";
      const life = filteredVoters.filter((v) => v.source_kind === "life");
      const general = filteredVoters.filter((v) => v.source_kind === "general");

      async function toDataUrl(photoUrl: string): Promise<string> {
        if (!photoUrl) return "";
        try {
          const res = await fetch(`${API_BASE}${photoUrl}`, { headers: { Authorization: `Bearer ${token}` } });
          if (!res.ok) return "";
          const blob = await res.blob();
          return await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => resolve("");
            reader.readAsDataURL(blob);
          });
        } catch {
          return "";
        }
      }

      const allVoters = [...life, ...general];
      const dataUrls = await Promise.all(allVoters.map((v) => toDataUrl(v.photo_url)));
      const urlMap: Record<string, string> = {};
      allVoters.forEach((v, i) => { urlMap[v.id] = dataUrls[i]; });

      function voterRow(v: Voter): string {
        const img = urlMap[v.id]
          ? `<img src="${urlMap[v.id]}" alt="" />`
          : `<div class="noPhoto"></div>`;
        const badge = v.source_kind === "life" ? "L" : "G";
        const badgeCls = v.source_kind === "life" ? "life" : "gen";
        const name = displayName(v, lang, t.missingName);
        // IFP/Target/YT/MF are mutually exclusive, so a card gets exactly one
        // category -- shown as "(CODE)" after the name, colored to match the
        // card's left-edge stripe -- instead of a separate chip.
        const catCode = v.is_target ? "T" : v.is_yt_voter ? "YT" : v.is_mf_voter ? "MF" : v.is_ifp_voter ? "IFP" : "";
        const catCls = v.is_target ? "card-target" : v.is_yt_voter ? "card-yt" : v.is_mf_voter ? "card-mf" : v.is_ifp_voter ? "card-ifp" : "";
        const catTag = catCode ? `<span class="catTag ${catCls}">(${catCode})</span>` : "";
        const flag = v.is_flagged
          ? `<svg class="flag" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#1a1a1a" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 21V4"/><path d="M6 4h12.2a1 1 0 0 1 .8 1.6l-3.4 4.4 3.4 4.4a1 1 0 0 1-.8 1.6H6" fill="#1a1a1a"/></svg>`
          : "";
        const noWa = v.has_whatsapp === false
          ? `<svg class="noWa" width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#b91c1c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 20.5 6.4 15a8 8 0 1 1 3.4 3.2z"/><path d="M3 3l18 18"/></svg>`
          : "";
        const hasGoodWhatsapp = Boolean(v.mobile) && v.has_whatsapp === true;
        const waBox = hasGoodWhatsapp
          ? ""
          : `<div class="waBox"><span>${lang === "te" ? "నం:" : "No:"}</span></div>`;
        return `<div class="card ${catCls}">
          <div class="cardTop">
            <div class="photo">${img}<span class="badge ${badgeCls}">${badge}</span>${flag}</div>
            <div class="info">
              <div class="name">${esc(name) || esc(t.missingName)}${catTag}</div>
              <div class="row"><span class="lbl">${lang === "te" ? "తండ్రి" : "Father"}</span><span>${esc(displayRelation(v.relation_name_te || "", lang))}</span></div>
              <div class="row"><span class="lbl">${lang === "te" ? "సీరియల్" : "Serial"}</span><span>${esc(v.serial_no) || "-"}</span></div>
              <div class="row"><span class="lbl">${lang === "te" ? "వయస్సు" : "Age"}</span><span>${esc(displayAge(v.age))}</span></div>
              <div class="row"><span class="lbl">D.no</span><span>${esc(v.house_no) || "-"}</span></div>
              ${v.mobile ? `<div class="row"><span class="lbl">${lang === "te" ? "ఫోన్" : "Phone"}</span><span>${esc(v.mobile)}</span>${noWa}</div>` : ""}
            </div>
          </div>
          ${waBox}
        </div>`;
      }

      // Explicit pagination instead of letting the browser auto-flow pages:
      // a plain continuation page is a strict 4x5 grid (20 cards); any page
      // that opens with the banner and/or a section divider only fits 4x4
      // (16) since that header eats a row's worth of vertical space.
      type PdfPage = { showBanner: boolean; sectionLabel: string; sectionTotal: number; cards: Voter[] };
      const pdfPages: PdfPage[] = [];
      let isFirstPageOverall = true;
      function pushSection(voters: Voter[], label: string) {
        if (!voters.length) return;
        let idx = 0;
        let firstPageOfSection = true;
        while (idx < voters.length) {
          const cap = firstPageOfSection || isFirstPageOverall ? 16 : 20;
          pdfPages.push({
            showBanner: isFirstPageOverall,
            sectionLabel: firstPageOfSection ? label : "",
            sectionTotal: voters.length,
            cards: voters.slice(idx, idx + cap),
          });
          idx += cap;
          firstPageOfSection = false;
          isFirstPageOverall = false;
        }
      }
      pushSection(life, lang === "te" ? "లైఫ్ ఓటర్లు" : "Life Voters");
      pushSection(general, lang === "te" ? "జనరల్ ఓటర్లు" : "General Voters");

      const pagesHtml = pdfPages.map((page, i) => {
        const banner = page.showBanner
          ? `<div class="pageHeader">
              <h1>${esc(base)}${suffixHtml}</h1>
              <div class="meta">
                ${lang === "te" ? "మొత్తం" : "Total"} ${filteredVoters.length} · ${lang === "te" ? "లైఫ్" : "Life"} ${life.length} · ${lang === "te" ? "జనరల్" : "General"} ${general.length}<br>
                ${new Date().toLocaleDateString(lang === "te" ? "te-IN" : "en-IN")}
              </div>
            </div>`
          : "";
        const secHeader = page.sectionLabel
          ? `<div class="secHeader">${page.sectionLabel} <span class="cnt">${page.sectionTotal}</span></div>`
          : "";
        const last = i === pdfPages.length - 1 ? " lastPage" : "";
        return `<div class="pdfPage${last}">
          ${banner}
          ${secHeader}
          <div class="grid">${page.cards.map(voterRow).join("")}</div>
        </div>`;
      }).join("");

      const html = `<!DOCTYPE html><html lang="${lang}"><head>
<meta charset="UTF-8">
<title>${esc(areaLabel)} — ${lang === "te" ? "ఓటర్ జాబితా" : "Voter List"}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@400;700&display=swap');
  @page { size: A4 landscape; margin: 0; }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Noto Sans Telugu', 'Segoe UI', sans-serif; font-size: 11px; background: #fff; color: #1a1a1a; }
  /* One physical sheet per block -- padding here is the only page margin
     (extra on the left for binding/hole-punch), so content fits evenly on
     all sides instead of relying on unpredictable browser auto-pagination. */
  .pdfPage { padding: 10mm 8mm 10mm 14mm; break-after: page; }
  .pdfPage.lastPage { break-after: auto; }
  .pageHeader { padding: 12px 16px; margin-bottom: 12px; background: #0e4a35; color: #fff; border-radius: 6px; display: flex; justify-content: space-between; align-items: center; }
  .pageHeader h1 { font-size: 15px; }
  .pageHeader .meta { font-size: 11px; opacity: 0.85; text-align: right; }
  .secHeader { font-size: 13px; font-weight: 700; padding: 6px 10px; background: #f0ebe0; border-bottom: 2px solid #0e4a35; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
  .secHeader .cnt { background: #0e4a35; color: #fff; border-radius: 99px; padding: 1px 8px; font-size: 11px; }
  .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  /* Left edge carries the category color (thicker than the other 3 sides) --
     IFP/Target/YT/MF are mutually exclusive, so each card gets exactly one. */
  .card { display: flex; flex-direction: column; gap: 6px; border: 1px solid #d7cfbe; border-left-width: 4px; border-radius: 6px; padding: 6px; break-inside: avoid; }
  .card-target { border-left-color: #b91c1c; }
  .card-yt     { border-left-color: #6d28d9; }
  .card-mf     { border-left-color: #0d9488; }
  .card-ifp    { border-left-color: #065f46; }
  .cardTop { display: flex; gap: 6px; }
  .photo { position: relative; flex-shrink: 0; width: 56px; }
  .photo img, .photo .noPhoto { width: 56px; height: 72px; object-fit: cover; border-radius: 4px; background: #e8e3d8; }
  .badge { position: absolute; bottom: 2px; left: 2px; font-size: 9px; font-weight: 700; padding: 1px 4px; border-radius: 3px; }
  .flag { position: absolute; bottom: 3px; right: 2px; }
  .life { background: #d1fae5; color: #065f46; }
  .gen { background: #ede9fe; color: #4c1d95; }
  .info { flex: 1; min-width: 0; }
  .name { font-weight: 700; font-size: 12px; margin-bottom: 3px; overflow-wrap: anywhere; display: flex; flex-wrap: wrap; align-items: baseline; gap: 3px; }
  .catTag { font-size: 10px; font-weight: 700; flex-shrink: 0; }
  .catTag.card-target { color: #b91c1c; }
  .catTag.card-yt     { color: #6d28d9; }
  .catTag.card-mf     { color: #0d9488; }
  .catTag.card-ifp    { color: #065f46; }
  .row { display: flex; gap: 4px; font-size: 10px; line-height: 1.5; align-items: center; }
  .lbl { color: #6b7280; flex-shrink: 0; }
  .noWa { flex-shrink: 0; }
  .waBox { display: flex; align-items: flex-start; gap: 4px; padding: 4px 6px; min-height: 30px; border: 1px dashed #9ca3af; border-radius: 4px; font-size: 9px; color: #6b7280; }
  .waBox span { flex-shrink: 0; }
  @media print {
    .pageHeader { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .secHeader { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head><body>
${pagesHtml}
</body></html>`;

      const win = window.open("", "_blank");
      if (!win) {
        setError(lang === "te"
          ? "PDF తెరవలేకపోయాం — బ్రౌజర్ పాప్-అప్‌లను బ్లాక్ చేసింది. పాప్-అప్‌లను అనుమతించి మళ్ళీ ప్రయత్నించండి."
          : "Couldn't open the PDF — your browser blocked the pop-up. Allow pop-ups for this site and try again.");
        return;
      }
      // Set onload BEFORE document.close() — close() fires the load event,
      // so assigning onload afterward means the handler is always missed.
      win.onload = () => { win.focus(); win.print(); };
      win.document.open();
      win.document.write(html);
      win.document.close();
    } finally {
      setPdfBusy(false);
    }
  }

  const categoryJobCounts = useMemo(
    () => ({
      life: jobs.filter((item) => item.source_kind === "life").length,
      general: jobs.filter((item) => item.source_kind === "general").length,
    }),
    [jobs],
  );
  const moveAreaFallback = useMemo(() => {
    if (!selected) {
      return "";
    }
    return getAreaTile(selected)?.aliases[0] || selected.area_te || "";
  }, [selected]);

  const searchHaystacks = useMemo(() => {
    const map = new Map<string, string>();
    for (const voter of allVoters) map.set(voter.id, buildVoterHaystack(voter));
    return map;
  }, [allVoters]);

  const deceasedVoters = useMemo(() => allVoters.filter((item) => Boolean(item.is_deceased)), [allVoters]);
  const blocklistedVoters = useMemo(() => allVoters.filter((item) => Boolean(item.is_blocklisted)), [allVoters]);
  const cancelledVoters = useMemo(() => allVoters.filter((item) => Boolean(item.is_cancelled)), [allVoters]);
  const activeVoters = useMemo(
    () => allVoters.filter((item) => !item.is_deceased && !item.is_blocklisted && !item.is_cancelled),
    [allVoters],
  );
  const ageScopedVoters = useMemo(
    () => activeVoters.filter((item) => voterMatchesAgeFilter(item, ageFilter)),
    [activeVoters, ageFilter],
  );
  // Party/Unknown/Flagged card counts: respects every filter EXCEPT the
  // party/unknown/flagged toggles themselves (area, age, source, search,
  // house) -- so a card's number always matches what you'd actually see if
  // you clicked it next, instead of silently ignoring source/search like
  // before (audit finding: Life card said 12, IFP card beside it still
  // showed the whole area's 340 because it wasn't source/search-scoped).
  // Deliberately excludes the OTHER party filters so every card stays
  // non-zero and comparable -- selecting Target doesn't zero out the YT
  // card, it just shows what switching to YT would give you.
  const areaBaseVoters = useMemo(() => {
    let list = ageScopedVoters;
    if (selectedTile) list = list.filter((item) => getAreaTile(item)?.key === selectedTile);
    if (source !== "all") list = list.filter((item) => item.source_kind === source);
    if (exactHouseNoFilter) list = list.filter((item) => normalizeHouseNo(item.house_no || "") === exactHouseNoFilter);
    return list.filter((item) => voterMatchesQuery(item, debouncedQuery, searchHaystacks));
  }, [ageScopedVoters, selectedTile, source, exactHouseNoFilter, debouncedQuery, searchHaystacks]);
  const areaBaseStats = useMemo(
    () =>
      areaBaseVoters.reduce<ScopeStats>(
        (acc, item) => {
          acc.total += 1;
          acc.ifp += item.is_ifp_voter ? 1 : 0;
          acc.yt += item.is_yt_voter ? 1 : 0;
          acc.target += item.is_target ? 1 : 0;
          acc.mf += item.is_mf_voter ? 1 : 0;
          acc.unknown += isUnknownVoter(item) ? 1 : 0;
          acc.flagged += item.is_flagged ? 1 : 0;
          if (item.source_kind === "life") acc.life += 1;
          else acc.general += 1;
          return acc;
        },
        { total: 0, life: 0, general: 0, missing: 0, ifp: 0, yt: 0, target: 0, mf: 0, unknown: 0, flagged: 0 },
      ),
    [areaBaseVoters],
  );
  const areaIfpShare = useMemo(
    () => (areaBaseStats.total ? (areaBaseStats.ifp / areaBaseStats.total) * 100 : 0),
    [areaBaseStats],
  );
  const areaTargetShare = useMemo(
    () => (areaBaseStats.total ? (areaBaseStats.target / areaBaseStats.total) * 100 : 0),
    [areaBaseStats],
  );
  const areaYtShare = useMemo(
    () => (areaBaseStats.total ? (areaBaseStats.yt / areaBaseStats.total) * 100 : 0),
    [areaBaseStats],
  );
  const areaMfShare = useMemo(
    () => (areaBaseStats.total ? (areaBaseStats.mf / areaBaseStats.total) * 100 : 0),
    [areaBaseStats],
  );
  const areaUnknownShare = useMemo(
    () => (areaBaseStats.total ? (areaBaseStats.unknown / areaBaseStats.total) * 100 : 0),
    [areaBaseStats],
  );
  const areaFlaggedShare = useMemo(
    () => (areaBaseStats.total ? (areaBaseStats.flagged / areaBaseStats.total) * 100 : 0),
    [areaBaseStats],
  );
  const scopedVoters = useMemo(() => {
    if (partyFilters.size === 0) return ageScopedVoters;
    const selectedParties = PARTY_GROUP.filter((cat) => partyFilters.has(cat));
    return ageScopedVoters.filter((voter) => {
      if (selectedParties.length > 0) {
        const matchesAnyParty = selectedParties.some((cat) =>
          cat === "ifp" ? voter.is_ifp_voter : cat === "target" ? voter.is_target : cat === "yt" ? voter.is_yt_voter : voter.is_mf_voter,
        );
        if (!matchesAnyParty) return false;
      }
      if (partyFilters.has("unknown") && !isUnknownVoter(voter)) return false;
      if (partyFilters.has("flagged") && !voter.is_flagged) return false;
      return true;
    });
  }, [partyFilters, ageScopedVoters]);

  const partyFilterSuffix = useMemo(
    () =>
      PARTY_FILTER_ORDER.filter((cat) => partyFilters.has(cat))
        .map((cat) => PARTY_FILTER_EXPORT_LABEL[cat])
        .join("+"),
    [partyFilters],
  );
  const ageFilterSuffix = ageFilter === "all" ? "" : `${ageFilterLabel(ageFilter, "en")} ${ageFilterRange(ageFilter)}`;

  // source-filtered too, so atlas tile counts (incl. IFP share) respect the Life/General pills
  const sourceScopedVoters = useMemo(
    () => (source === "all" ? scopedVoters : scopedVoters.filter((v) => v.source_kind === source)),
    [scopedVoters, source],
  );

  const areaTiles = useMemo<AreaTileSummary[]>(() => {
    const tileMap = new Map<string, AreaTileSummary>(
      AREA_TILES.map((tile) => [
        tile.key,
        { ...tile, total: 0, life: 0, general: 0, missing: 0, ifp: 0, yt: 0, target: 0, mf: 0, unknown: 0, flagged: 0 },
      ]),
    );
    for (const voter of sourceScopedVoters) {
      const tile = getAreaTile(voter);
      if (!tile) {
        continue;
      }
      const current = tileMap.get(tile.key);
      if (!current) {
        continue;
      }
      current.total += 1;
      current.missing += voterMissingCount(voter) > 0 ? 1 : 0;
      current.ifp += voter.is_ifp_voter ? 1 : 0;
      current.yt += voter.is_yt_voter ? 1 : 0;
      current.target += voter.is_target ? 1 : 0;
      current.mf += voter.is_mf_voter ? 1 : 0;
      current.unknown += isUnknownVoter(voter) ? 1 : 0;
      if (voter.source_kind === "life") {
        current.life += 1;
      } else {
        current.general += 1;
      }
      tileMap.set(tile.key, current);
    }
    return Array.from(tileMap.values())
      .sort(
        (a, b) =>
          b.total - a.total ||
          b.ifp - a.ifp ||
          b.life - a.life ||
          (AREA_TILE_ORDER.get(a.key) ?? Number.MAX_SAFE_INTEGER) - (AREA_TILE_ORDER.get(b.key) ?? Number.MAX_SAFE_INTEGER),
      );
  }, [sourceScopedVoters]);

  const sidebarAreaStats = useMemo(
    () => areaTiles.filter((tile) => tile.total > 0).sort((a, b) => b.total - a.total || a.label.localeCompare(b.label)),
    [areaTiles],
  );

  // Denominator for the atlas tiles' % once a party filter (IFP/T/YT/MF) is
  // active. areaTiles itself is built from sourceScopedVoters, which is
  // already narrowed to the active party filter — so tile.total there IS
  // the filtered count per area, but there's no area-total left to divide
  // by. This tracks each area's true total (source-filtered only, never
  // party-filtered) so the % is still "this party's count / area's total".
  const areaTrueTotals = useMemo(() => {
    const bySource = source === "all" ? ageScopedVoters : ageScopedVoters.filter((v) => v.source_kind === source);
    const totals = new Map<string, number>();
    for (const voter of bySource) {
      const tile = getAreaTile(voter);
      if (!tile) continue;
      totals.set(tile.key, (totals.get(tile.key) ?? 0) + 1);
    }
    return totals;
  }, [ageScopedVoters, source]);

  // Denominator for the atlas tiles' % when Life/General alone is selected
  // (no party filter) — unlike areaTrueTotals this is NEVER source-scoped,
  // since "what fraction of this area is Life voters" needs the area's
  // grand total across both sources, not just the Life-filtered total.
  const areaGrandTotals = useMemo(() => {
    const totals = new Map<string, number>();
    for (const voter of ageScopedVoters) {
      const tile = getAreaTile(voter);
      if (!tile) continue;
      totals.set(tile.key, (totals.get(tile.key) ?? 0) + 1);
    }
    return totals;
  }, [ageScopedVoters]);

  const selectedAreaVoters = useMemo(
    () => (selectedTile ? scopedVoters.filter((item) => getAreaTile(item)?.key === selectedTile) : scopedVoters),
    [scopedVoters, selectedTile],
  );

  const familyScopeVoters = useMemo(
    () => selectedAreaVoters.filter((item) => source === "all" || item.source_kind === source),
    [selectedAreaVoters, source],
  );

  const filteredVoters = useMemo(() => {
    return selectedAreaVoters
      .filter((voter) => {
        if (source !== "all" && voter.source_kind !== source) {
          return false;
        }
        if (exactHouseNoFilter && normalizeHouseNo(voter.house_no || "") !== exactHouseNoFilter) {
          return false;
        }
        return voterMatchesQuery(voter, debouncedQuery, searchHaystacks);
      })
      .sort((a, b) => a.serial_no.localeCompare(b.serial_no, "en", { numeric: true }));
  }, [exactHouseNoFilter, debouncedQuery, selectedAreaVoters, source, searchHaystacks]);

  const familyClusters = useMemo(() => {
    const clusters = new Map<string, FamilyCluster>();
    for (const voter of familyScopeVoters) {
      const houseNo = normalizeHouseNo(voter.house_no || "");
      if (!isFamilyDoorValue(houseNo)) {
        continue;
      }
      const tile = getAreaTile(voter);
      const areaKey = tile?.key || (voter.area_te || "").trim().toLowerCase();
      const areaLabel = tile?.label || voter.area_te || "—";
      const key = `${areaKey}::${houseNo}`;
      const current = clusters.get(key) || {
        key,
        areaKey,
        areaLabel,
        houseNo,
        count: 0,
        life: 0,
        general: 0,
        ifp: 0,
        voters: [],
      };
      current.count += 1;
      current.ifp += voter.is_ifp_voter ? 1 : 0;
      if (voter.source_kind === "life") {
        current.life += 1;
      } else {
        current.general += 1;
      }
      current.voters.push(voter);
      clusters.set(key, current);
    }
    return Array.from(clusters.values())
      .filter((cluster) => cluster.count > 1)
      .map((cluster) => ({
        ...cluster,
        voters: [...cluster.voters].sort(
          (a, b) =>
            a.source_kind.localeCompare(b.source_kind) ||
            a.serial_no.localeCompare(b.serial_no, "en", { numeric: true }) ||
            a.name_te.localeCompare(b.name_te, "te"),
        ),
      }))
      .sort(
        (a, b) =>
          b.count - a.count ||
          b.ifp - a.ifp ||
          a.areaLabel.localeCompare(b.areaLabel, "en") ||
          a.houseNo.localeCompare(b.houseNo, "en", { numeric: true }),
      );
  }, [familyScopeVoters]);

  const familyCoveredCount = useMemo(
    () => familyClusters.reduce((acc, cluster) => acc + cluster.count, 0),
    [familyClusters],
  );

  const largestFamilyCluster = familyClusters[0]?.count || 0;

  // Derived from filteredVoters (the exact list rendered below) so the metric
  // cards can never disagree with what's on screen — includes source pill,
  // search text, and exact-house-number scoping, not just area + party.
  const selectedScopeStats = useMemo(
    () =>
      filteredVoters.reduce<ScopeStats>(
        (acc, item) => {
          acc.total += 1;
          acc.missing += voterMissingCount(item) > 0 ? 1 : 0;
          acc.ifp += item.is_ifp_voter ? 1 : 0;
          acc.yt += item.is_yt_voter ? 1 : 0;
          acc.target += item.is_target ? 1 : 0;
          acc.mf += item.is_mf_voter ? 1 : 0;
          acc.unknown += isUnknownVoter(item) ? 1 : 0;
          acc.flagged += item.is_flagged ? 1 : 0;
          if (item.source_kind === "life") acc.life += 1;
          else acc.general += 1;
          return acc;
        },
        { total: 0, life: 0, general: 0, missing: 0, ifp: 0, yt: 0, target: 0, mf: 0, unknown: 0, flagged: 0 },
      ),
    [filteredVoters],
  );

  const selectedLifeShare = useMemo(
    () => (selectedScopeStats.total ? (selectedScopeStats.life / selectedScopeStats.total) * 100 : 0),
    [selectedScopeStats],
  );
  const selectedGeneralShare = useMemo(
    () => (selectedScopeStats.total ? (selectedScopeStats.general / selectedScopeStats.total) * 100 : 0),
    [selectedScopeStats],
  );

  const selectedTileLabel = useMemo(
    () => areaTiles.find((item) => item.key === selectedTile)?.label || "",
    [areaTiles, selectedTile],
  );

  const atlasMode = !selectedTile && !browseAll && !query.trim();

  function goHome() {
    setSelectedTile("");
    setBrowseAll(false);
    setQuery("");
    setExactHouseNoFilter("");
    setPartyFilters(new Set());
    setSource("all");
    setAgeFilter("all");
  }

  useEffect(() => {
    if (selectedTile && !areaTiles.some((item) => item.key === selectedTile)) {
      setSelectedTile("");
    }
  }, [areaTiles, selectedTile]);

  useEffect(() => { setVisibleCount(120); }, [selectedTile, query, source, ageFilter]);

  useEffect(() => {
    document.body.style.overflow = selected || showAreaMgr || showDeceasedMgr || showBlocklistMgr || showCancelledMgr || showFamilyMgr || showAreaStats || showCampaigns ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selected, showAreaMgr, showDeceasedMgr, showBlocklistMgr, showCancelledMgr, showFamilyMgr, showAreaStats, showCampaigns]);

  // Enhancement #2 — Escape key closes any open modal
  useEffect(() => {
    const anyOpen = selected || showAreaMgr || showDeceasedMgr || showBlocklistMgr || showCancelledMgr || showFamilyMgr || showAreaStats || showCampaigns || confirmDialog;
    if (!anyOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (confirmDialog) { setConfirmDialog(null); return; }
      if (selected) { closeModal(); return; }
      setShowAreaMgr(false);
      setShowDeceasedMgr(false);
      setShowBlocklistMgr(false);
      setShowCancelledMgr(false);
      setShowFamilyMgr(false);
      setShowAreaStats(false);
      setShowCampaigns(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected, showAreaMgr, showDeceasedMgr, showBlocklistMgr, showCancelledMgr, showFamilyMgr, showAreaStats, showCampaigns, confirmDialog, nameEnDraft, nameMode]);

  // Android/browser Back closing whatever modal is open instead of leaving
  // the app entirely (audit finding). Pushes one history entry the moment a
  // modal opens in a given open/close cycle; Back then just pops it and we
  // treat that pop as "close everything" rather than letting the browser
  // navigate away. Closing via the X/backdrop leaves one harmless same-URL
  // entry behind (Back needs pressing once more to actually leave after
  // that) -- the same trade-off Gmail/Trello-style modals make.
  const modalHistoryPushedRef = useRef(false);
  useEffect(() => {
    const anyOpen = Boolean(selected || showAreaMgr || showDeceasedMgr || showBlocklistMgr || showCancelledMgr || showFamilyMgr || showAreaStats || showCampaigns || confirmDialog);
    if (anyOpen && !modalHistoryPushedRef.current) {
      window.history.pushState(window.history.state, "");
      modalHistoryPushedRef.current = true;
    } else if (!anyOpen) {
      modalHistoryPushedRef.current = false;
    }
    if (!anyOpen) return;
    function onPopState() {
      if (confirmDialog) { setConfirmDialog(null); return; }
      if (selected) { closeModal(); return; }
      setShowAreaMgr(false);
      setShowDeceasedMgr(false);
      setShowBlocklistMgr(false);
      setShowCancelledMgr(false);
      setShowFamilyMgr(false);
      setShowAreaStats(false);
      setShowCampaigns(false);
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [selected, showAreaMgr, showDeceasedMgr, showBlocklistMgr, showCancelledMgr, showFamilyMgr, showAreaStats, showCampaigns, confirmDialog]);

  useModalFocusTrap(voterModalRef, Boolean(selected));
  useModalFocusTrap(areaMgrRef, showAreaMgr);
  useModalFocusTrap(deceasedRef, showDeceasedMgr);
  useModalFocusTrap(blocklistRef, showBlocklistMgr);
  useModalFocusTrap(cancelledRef, showCancelledMgr);
  useModalFocusTrap(familyRef, showFamilyMgr);
  useModalFocusTrap(areaStatsRef, showAreaStats);
  useModalFocusTrap(confirmDialogRef, Boolean(confirmDialog));

  function confirmAction(message: string, onConfirm: () => void) {
    setConfirmDialog({ message, onConfirm });
  }

  // Overflow "more" menu (upload/manage areas/area stats/family/deceased/
  // block/cancelled) closes on outside click or Escape, same as any menu.
  useEffect(() => {
    if (!showMoreMenu) return;
    function onPointer(e: MouseEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setShowMoreMenu(false);
    }
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [showMoreMenu]);

  // Swipe-down-to-dismiss on the bottom sheet's header/grab-handle (mobile
  // only — these are touch events, so mouse users on desktop never trigger
  // them). Reads the panel via currentTarget.parentElement instead of a ref
  // so the same handlers work for all 7 modal headers uninstrumented.
  function onSheetTouchStart(e: ReactTouchEvent<HTMLElement>) {
    sheetDragStartY.current = e.touches[0].clientY;
    sheetDragActive.current = true;
  }
  function onSheetTouchMove(e: ReactTouchEvent<HTMLElement>) {
    if (!sheetDragActive.current) return;
    const panel = e.currentTarget.parentElement;
    if (!panel) return;
    const dy = e.touches[0].clientY - sheetDragStartY.current;
    sheetDragDistance.current = dy;
    panel.style.transform = dy > 0 ? `translateY(${dy}px)` : "";
  }
  function onSheetTouchEnd(e: ReactTouchEvent<HTMLElement>, onDismiss: () => void) {
    if (!sheetDragActive.current) return;
    sheetDragActive.current = false;
    const panel = e.currentTarget.parentElement;
    const dy = sheetDragDistance.current;
    sheetDragDistance.current = 0;
    if (!panel) return;
    panel.style.transition = "transform 0.2s ease";
    if (dy > 110) {
      onDismiss();
    } else {
      panel.style.transform = "";
    }
    setTimeout(() => { panel.style.transition = ""; }, 220);
  }

  // Error banners used to persist forever until the next unrelated action
  // happened to call setError(""). Auto-clearing keeps the UI from getting
  // stuck showing a stale failure message.
  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(""), 10000);
    return () => clearTimeout(timer);
  }, [error]);

  // Enhancement #8 — infinite scroll: reconnect observer every time the count or list changes
  // so it fires again immediately if the sentinel is already in view after a load batch
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || filteredVoters.length <= visibleCount) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) setVisibleCount((c) => c + 120);
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [filteredVoters.length, visibleCount, atlasMode]);

  const unclassifiedAreas = useMemo(
    () => rawAreas.filter((area) => !AREA_TILES.some((tile) => tile.aliasSet.has(area.area_te))),
    [rawAreas],
  );

  const areaManagerRows = useMemo(
    () => {
      const liveCounts = new Map(rawAreas.map((area) => [area.area_te, area]));
      const allAreaNames = Array.from(
        new Set([
          ...knownAreaOptions.map((item) => item.area_te),
          ...rawAreas.map((item) => item.area_te),
        ]),
      );
      return allAreaNames.map((areaTe) => {
        const current = liveCounts.get(areaTe);
        const matchedTile = AREA_TILES.find((tile) => tile.aliasSet.has(areaTe));
        return {
          area_te: areaTe,
          count: current?.count || 0,
          missing_count: current?.missing_count || 0,
          matchedTile,
          matchedLabel: matchedTile?.label || "",
          matchedAlias: matchedTile?.aliases[0] || "",
        };
      }).sort((a, b) => b.count - a.count || a.area_te.localeCompare(b.area_te, "te"));
    },
    [knownAreaOptions, rawAreas],
  );

  if (!token) {
    return (
      <main className="loginShell">
        <section className="loginPanel">
          <div className="langRow">
            <button type="button" onClick={() => setLang(lang === "te" ? "en" : "te")}>
              {lang === "te" ? "English" : "తెలుగు"}
            </button>
          </div>
          <div className="brandBlock">
            <img src="/if-logo-full.png" alt="Islamic Front" className="brandLogo" />
            <div>
              <strong>{t.brand}</strong>
              <span>{t.premium}</span>
            </div>
          </div>
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
          <form onSubmit={(e) => { e.preventDefault(); void login(); }}>
            <input
              type="text"
              autoComplete="username"
              defaultValue="ifp-member"
              tabIndex={-1}
              aria-hidden="true"
              style={{ display: "none" }}
              readOnly
            />
            <label>
              {t.code}
              <input
                value={code}
                onChange={(event) => setCode(event.target.value)}
                type="password"
                autoComplete="current-password"
                autoFocus
              />
            </label>
            <button type="submit" className="primary">
              {t.login}
            </button>
          </form>
          {error && <p className="error" role="alert">{error}</p>}
        </section>
        <p className="loginFooter">{lang === "te" ? "ఇస్లామిక్ ఫ్రంట్ · మంగళగిరి" : "Islamic Front · Mangalagiri"}</p>
      </main>
    );
  }

  // Inside a drilled-into area this renders inline in the header's first row
  // (next to the logo) instead of as its own strip below — so it stays
  // pinned with the sticky header instead of scrolling away with the list.
  const summaryMetricsBlock = (
    <div className={`summaryMetricsWrap${!atlasMode ? " summaryMetricsWrapCompact summaryMetricsHeaderInline" : ""}`}>
      <div className="summaryMetrics">
        {atlasMode ? (
          <button type="button" className="summaryMetricCard metricTotal" onClick={() => setBrowseAll(true)}>
            <span>{t.total}</span>
            <strong>{formatCount(selectedScopeStats.total)}</strong>
            <small>{selectedTileLabel || t.all}</small>
          </button>
        ) : (
          <article className="summaryMetricCard metricTotal">
            <span>{t.total}</span>
            <strong>{formatCount(selectedScopeStats.total)}</strong>
            <small>{selectedTileLabel || t.all}</small>
          </article>
        )}
        <StatCard
          colorClass="metricLife"
          label={t.lifeCount}
          countLabel={formatCount(selectedScopeStats.life)}
          share={selectedLifeShare}
          lang={lang}
          active={source === "life"}
          onClick={() => setSource((prev) => (prev === "life" ? "all" : "life"))}
          drillOnClick={atlasMode ? () => openAllFor("life") : undefined}
          drillLabel={lang === "te" ? "అన్ని లైఫ్ ఓటర్లు చూడండి" : "View all Life voters"}
        />
        <StatCard
          colorClass="metricGeneral"
          label={t.generalCount}
          countLabel={formatCount(selectedScopeStats.general)}
          share={selectedGeneralShare}
          lang={lang}
          active={source === "general"}
          onClick={() => setSource((prev) => (prev === "general" ? "all" : "general"))}
          drillOnClick={atlasMode ? () => openAllFor("general") : undefined}
          drillLabel={lang === "te" ? "అన్ని జనరల్ ఓటర్లు చూడండి" : "View all General voters"}
        />
        <StatCard
          colorClass="metricIfp"
          label={t.ifpCount}
          countLabel={formatCount(areaBaseStats.ifp)}
          share={areaIfpShare}
          lang={lang}
          active={partyFilters.has("ifp")}
          onClick={() => togglePartyFilter("ifp")}
          title={tagTooltip("ifp", lang)}
          animKey={`m-ifp-${areaBaseStats.ifp}`}
          drillOnClick={atlasMode ? () => openAllFor("ifp") : undefined}
          drillLabel={lang === "te" ? "అన్ని IFP ఓటర్లు చూడండి" : "View all IFP voters"}
        />
        <StatCard
          compact
          colorClass="metricTarget"
          label="T"
          countLabel={formatCount(areaBaseStats.target)}
          share={areaTargetShare}
          lang={lang}
          active={partyFilters.has("target")}
          onClick={() => togglePartyFilter("target")}
          title={tagTooltip("target", lang)}
          animKey={`m-t-${areaBaseStats.target}`}
          drillOnClick={atlasMode ? () => openAllFor("target") : undefined}
          drillLabel={lang === "te" ? "అన్ని లక్ష్య ఓటర్లు చూడండి" : "View all Target voters"}
        />
        <StatCard
          compact
          colorClass="metricYt"
          label="YT"
          countLabel={formatCount(areaBaseStats.yt)}
          share={areaYtShare}
          lang={lang}
          active={partyFilters.has("yt")}
          onClick={() => togglePartyFilter("yt")}
          title={tagTooltip("yt", lang)}
          animKey={`m-y-${areaBaseStats.yt}`}
          drillOnClick={atlasMode ? () => openAllFor("yt") : undefined}
          drillLabel={lang === "te" ? "అన్ని YT ఓటర్లు చూడండి" : "View all YT voters"}
        />
        <StatCard
          compact
          colorClass="metricMf"
          label="MF"
          countLabel={formatCount(areaBaseStats.mf)}
          share={areaMfShare}
          lang={lang}
          active={partyFilters.has("mf")}
          onClick={() => togglePartyFilter("mf")}
          title={tagTooltip("mf", lang)}
          animKey={`m-m-${areaBaseStats.mf}`}
          drillOnClick={atlasMode ? () => openAllFor("mf") : undefined}
          drillLabel={lang === "te" ? "అన్ని MF ఓటర్లు చూడండి" : "View all MF voters"}
        />
        {(areaBaseStats.unknown > 0 || partyFilters.has("unknown")) && (
          <StatCard
            compact
            colorClass="metricUnknown"
            label={t.unknownCore}
            countLabel={formatCount(areaBaseStats.unknown)}
            share={areaUnknownShare}
            lang={lang}
            active={partyFilters.has("unknown")}
            onClick={() => togglePartyFilter("unknown")}
            title={tagTooltip("unknown", lang)}
            animKey={`m-u-${areaBaseStats.unknown}`}
            drillOnClick={atlasMode ? () => openAllFor("unknown") : undefined}
            drillLabel={lang === "te" ? "అన్ని తెలియని ఓటర్లు చూడండి" : "View all Unknown voters"}
          />
        )}
        {(areaBaseStats.flagged > 0 || partyFilters.has("flagged")) && (
          <StatCard
            compact
            colorClass="metricFlagged"
            label={<FlagIcon />}
            countLabel={formatCount(areaBaseStats.flagged)}
            share={areaFlaggedShare}
            lang={lang}
            active={partyFilters.has("flagged")}
            onClick={() => togglePartyFilter("flagged")}
            ariaLabel={`${lang === "te" ? "గుర్తు పెట్టినవారు" : "Marked"}: ${areaBaseStats.flagged}`}
            animKey={`m-fl-${areaBaseStats.flagged}`}
            drillOnClick={atlasMode ? () => openAllFor("flagged") : undefined}
            drillLabel={lang === "te" ? "అన్ని గుర్తు పెట్టిన ఓటర్లు చూడండి" : "View all Flagged voters"}
          />
        )}
      </div>
    </div>
  );

  return (
    <main className="appShell">
      {/* First card is otherwise ~21 tab stops deep (header chips + filter
          bar controls) — with 120+ cards on screen that's ~300 Tab presses
          to reach the middle of the list. This jumps straight past all of it. */}
      <a href="#voterListRegion" className="skipLink">
        {lang === "te" ? "ఓటర్ల జాబితాకు వెళ్లండి" : "Skip to voter list"}
      </a>
      <h1 className="srOnly">{t.premium}</h1>
      <div className="srOnly" role="status" aria-live="polite">{liveMessage}</div>
      {/* A refetch (after upload/merge/token refresh) previously showed no
          signal while the stale list stayed on screen — this thin bar is
          the only indicator that a reload with existing data is in flight. */}
      {votersLoading && allVoters.length > 0 && <div className="refetchBar" aria-hidden="true" />}
      <div className="stickyZone" ref={stickyZoneRef}>
      <header className={`topbar${atlasMode ? " topbarAtlas" : ""}`} ref={topbarRef}>
        <div className="topbarRow topbarRowTop">
        <div className="brandBlock brandInline">
          <img src="/if-logo-full.png" alt="Islamic Front" className="brandLogo" />
          <div className="heroCopy">
            <strong>{t.brand}</strong>
            <p>{t.premium}</p>
          </div>
        </div>
        {!atlasMode && summaryMetricsBlock}
        <div className="actions">
          <div className="moreMenuWrap" ref={moreMenuRef}>
            <button
              type="button"
              className="ghostBtn moreMenuBtn"
              onClick={() => setShowMoreMenu((v) => !v)}
              aria-haspopup="true"
              aria-expanded={showMoreMenu}
              aria-label={lang === "te" ? "మరిన్ని ఎంపికలు" : "More options"}
            >
              <MoreIcon />
            </button>
            {showMoreMenu && (
              <div className="moreMenu" role="menu">
                {/* Grouped by risk/frequency (audit finding: routine views
                    used to sit flush against bulk-mutating imports with no
                    visual separation). Views first (safe, frequent), then
                    read-only exports, then imports (clearly marked as
                    instant-mutating), then admin/high-risk last. */}
                <div className="moreMenuGroup" role="group" aria-label={lang === "te" ? "వీక్షణలు" : "Views"}>
                  <div className="moreMenuGroupLabel" aria-hidden="true">{lang === "te" ? "వీక్షణలు" : "Views"}</div>
                  <button type="button" role="menuitem" className="moreMenuItem" onClick={() => { setShowFamilyMgr(true); setShowMoreMenu(false); }}>
                    {t.familyVoting} <span className="moreMenuCount">{formatCount(familyClusters.length)}</span>
                  </button>
                  <button type="button" role="menuitem" className="moreMenuItem" onClick={() => { setShowDeceasedMgr(true); setShowMoreMenu(false); }}>
                    {lang === "te" ? "మరణించినవారు" : "Deceased"} <span className="moreMenuCount">{formatCount(deceasedVoters.length)}</span>
                  </button>
                  <button type="button" role="menuitem" className="moreMenuItem" onClick={() => { setShowBlocklistMgr(true); setShowMoreMenu(false); }}>
                    {lang === "te" ? "బ్లాక్ లిస్ట్" : "Block List"} <span className="moreMenuCount">{formatCount(blocklistedVoters.length)}</span>
                  </button>
                  <button type="button" role="menuitem" className="moreMenuItem" onClick={() => { setShowCancelledMgr(true); setShowMoreMenu(false); }}>
                    {lang === "te" ? "రద్దు జాబితా" : "Cancelled"} <span className="moreMenuCount">{formatCount(cancelledVoters.length)}</span>
                  </button>
                  <button type="button" role="menuitem" className="moreMenuItem" onClick={() => { setShowAreaStats(true); setShowMoreMenu(false); }}>
                    <ChartIcon /> {lang === "te" ? "ప్రాంత లెక్కలు" : "Area Stats"}
                  </button>
                </div>
                <div className="moreMenuDivider" role="separator" />
                <div className="moreMenuGroup" role="group" aria-label={lang === "te" ? "ఎగుమతి" : "Export"}>
                  <div className="moreMenuGroupLabel" aria-hidden="true">{lang === "te" ? "ఎగుమతి" : "Export"}</div>
                  <button type="button" role="menuitem" className="moreMenuItem" onClick={() => { downloadUpdatedContactsCsv(); setShowMoreMenu(false); }}>
                    <DownloadIcon /> {t.exportUpdated}
                  </button>
                  <button type="button" role="menuitem" className="moreMenuItem" onClick={() => { downloadContactsCsv(); setShowMoreMenu(false); }}>
                    <DownloadIcon /> {t.exportContacts}
                  </button>
                </div>
                <div className="moreMenuDivider" role="separator" />
                <div className="moreMenuGroup" role="group" aria-label={lang === "te" ? "దిగుమతి — వెంటనే మారుస్తుంది" : "Import — changes data instantly"}>
                  <div className="moreMenuGroupLabel" aria-hidden="true">{lang === "te" ? "దిగుమతి — వెంటనే మారుస్తుంది" : "Import — changes data instantly"}</div>
                  <label className="moreMenuItem" role="menuitem" tabIndex={0} onKeyDown={fileMenuItemKeyDown}>
                    {busy ? <SpinnerIcon /> : <UploadIcon />} {t.upload}
                    <input
                      type="file"
                      accept="application/pdf"
                      style={{ display: "none" }}
                      onChange={(event) => { upload(event.target.files?.[0] || null); setShowMoreMenu(false); }}
                    />
                  </label>
                  <label className="moreMenuItem" role="menuitem" tabIndex={0} onKeyDown={fileMenuItemKeyDown}>
                    {busy ? <SpinnerIcon /> : <UploadIcon />} {t.importPhones}
                    <input
                      type="file"
                      accept=".xlsx,.xlsm"
                      style={{ display: "none" }}
                      onChange={(event) => { importPhones(event.target.files?.[0] || null); setShowMoreMenu(false); }}
                    />
                  </label>
                  <label className="moreMenuItem" role="menuitem" tabIndex={0} onKeyDown={fileMenuItemKeyDown}>
                    {busy ? <SpinnerIcon /> : <UploadIcon />} {t.importFlags}
                    <input
                      type="file"
                      accept=".xlsx,.xlsm"
                      style={{ display: "none" }}
                      onChange={(event) => { importFlags(event.target.files?.[0] || null); setShowMoreMenu(false); }}
                    />
                  </label>
                  <label className="moreMenuItem" role="menuitem" tabIndex={0} onKeyDown={fileMenuItemKeyDown}>
                    {busy ? <SpinnerIcon /> : <UploadIcon />} {t.importWhatsapp}
                    <input
                      type="file"
                      accept=".xlsx,.xlsm"
                      style={{ display: "none" }}
                      onChange={(event) => { importWhatsappStatus(event.target.files?.[0] || null); setShowMoreMenu(false); }}
                    />
                  </label>
                </div>
                <div className="moreMenuDivider" role="separator" />
                <div className="moreMenuGroup" role="group" aria-label={lang === "te" ? "అడ్మిన్" : "Admin"}>
                  <div className="moreMenuGroupLabel" aria-hidden="true">{lang === "te" ? "అడ్మిన్" : "Admin"}</div>
                  <button type="button" role="menuitem" className="moreMenuItem" onClick={() => { setShowAreaMgr(true); void loadRawAreas(); setShowMoreMenu(false); }}>
                    {t.manageAreas}
                  </button>
                  <button type="button" role="menuitem" className="moreMenuItem moreMenuItemDanger" onClick={() => { setShowCampaigns(true); setShowMoreMenu(false); }}>
                    {lang === "te" ? "వాట్సాప్ ప్రచారం" : "WhatsApp Campaigns"}
                  </button>
                </div>
              </div>
            )}
          </div>
          <button type="button" onClick={() => setLang(lang === "te" ? "en" : "te")}>
            {lang === "te" ? "English" : "తెలుగు"}
          </button>
          <button
            type="button"
            onClick={() => {
              localStorage.removeItem("voter-token");
              setToken("");
            }}
          >
            {t.logout}
          </button>
        </div>
        </div>{/* /topbarRowTop */}
        <div className="topbarRow topbarRowBottom">
        <div className="filterBarView">
          {!atlasMode && (
            <button type="button" className="summaryBackBtn" onClick={goHome}>
              ← {lang === "te" ? "అన్ని ప్రాంతాలు" : "All areas"}
            </button>
          )}
          <span className="summaryViewLabel">{t.currentView}</span>
          <strong className="summaryViewVal">{atlasMode ? (lang === "te" ? "ప్రాంతాల పటం" : "Area atlas") : selectedTileLabel || t.all}</strong>
          {exactHouseNoFilter && (
            <button type="button" className="summaryModeChip" onClick={() => setExactHouseNoFilter("")}>
              {lang === "te" ? `ఇల్లు ${exactHouseNoFilter}` : `Door ${exactHouseNoFilter}`}
              <span aria-hidden="true"> ✕</span>
            </button>
          )}
        </div>
        <div className="filterBarDivider filterBarDividerA" aria-hidden="true" />
        <div className="filterCatGroup ageFilterGroup" role="group" aria-label={lang === "te" ? "వయస్సు వడపోతలు" : "Age filters"}>
          {AGE_FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              className={ageFilter === item ? "filterPill ageFilterPill active" : "filterPill ageFilterPill"}
              onClick={() => {
                setAgeFilter((prev) => (prev === item ? "all" : item));
                setExactHouseNoFilter("");
              }}
              aria-pressed={ageFilter === item}
              title={`${ageFilterLabel(item, lang)} ${ageFilterRange(item)}`}
            >
              <span className="ageFilterLabel">{ageFilterLabel(item, lang)}</span>
              <span className="ageFilterRange">{ageFilterRange(item)}</span>
            </button>
          ))}
        </div>
        <div className="filterBarDivider filterBarDividerB" aria-hidden="true" />
        <div className={`filterBarSearchWrap${atlasMode ? "" : " filterBarSearchWrapCompact"}`}>
          <SearchIcon />
          <input
            ref={searchRef}
            className="filterBarSearch"
            value={query}
            onChange={(event) => {
              if (exactHouseNoFilter) setExactHouseNoFilter("");
              setQuery(event.target.value);
            }}
            placeholder={t.search}
            aria-label={t.search}
          />
        </div>
        <div className="exportBtnGroup">
          <button
            type="button"
            className="exportCompactBtn"
            title={selectedTile ? t.exportArea : t.exportAll}
            disabled={filteredVoters.length === 0}
            onClick={() => {
              const tile = AREA_TILES.find((tile) => tile.key === selectedTile);
              const base = tile?.label || query.trim() || t.all;
              const suffix = [partyFilterSuffix, ageFilterSuffix].filter(Boolean).join(" ");
              downloadCsv(base + (suffix ? ` ${suffix}` : ""));
            }}
          >
            ↓ CSV
          </button>
          <button
            type="button"
            className="exportCompactBtn"
            title={t.exportPdf}
            disabled={pdfBusy || filteredVoters.length === 0}
            onClick={() => {
              const tile = AREA_TILES.find((tile) => tile.key === selectedTile);
              const base = tile?.label || query.trim() || t.all;
              const suffix = ageFilterSuffix ? ` ${ageFilterSuffix}` : "";
              const categories = PARTY_FILTER_ORDER.filter((cat) => partyFilters.has(cat));
              void downloadPdf(base + suffix, categories);
            }}
          >
            {pdfBusy ? <SpinnerIcon /> : "↓ PDF"}
          </button>
        </div>
        </div>{/* /topbarRowBottom */}
      </header>{/* /topbar — 2 rows on the atlas/home screen, 1 continuous line inside an area */}
      {atlasMode && summaryMetricsBlock}
      </div>{/* /stickyZone — inside an area, summaryMetricsBlock instead renders inline in topbarRowTop so it stays pinned with the header */}
      {error && (
        <div className="errorToast" role="alert">
          <span className="errorToastMsg">{error}</span>
          <button type="button" className="errorToastClose" aria-label={t.close} onClick={() => setError("")}>✕</button>
        </div>
      )}
      {notice && <p className="notice" style={{ width: "100%", margin: "0 0 12px", padding: "0 var(--page-gutter)" }}>{notice}</p>}

      <section className="layout">
        <section className="content" id="voterListRegion" tabIndex={-1}>

          {votersLoading && allVoters.length === 0 && (
            <div className="skeletonGrid">
              {Array.from({ length: 12 }).map((_, i) => (
                <div className="skeletonCard" key={i}>
                  <div className="skeletonBlock skeletonPhoto" style={{ animationDelay: `${i * 0.06}s` }} />
                  <div className="skeletonLines">
                    {[80, 60, 45, 55, 40].map((w, j) => (
                      <div key={j} className="skeletonBlock" style={{ height: 11, width: `${w}%`, animationDelay: `${(i * 0.06) + (j * 0.04)}s` }} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          {!votersLoading && allVoters.length === 0 && voterLoadFailed && (
            <p className="noSelectionHint" role="alert">
              {lang === "te" ? "ఓటర్ల జాబితా లోడ్ కాలేదు." : "Couldn't load the voter list."}
              <br />
              <button type="button" className="ghostBtn" style={{ marginTop: "10px" }} onClick={() => void loadAllVoters()}>
                {lang === "te" ? "మళ్ళీ ప్రయత్నించండి" : "Retry"}
              </button>
            </p>
          )}
          {atlasMode && !(votersLoading && allVoters.length === 0) && (
            <div className="atlasWrap">
              <div className="atlasGrid">
                {areaTiles
                  .filter((tile) => tile.total > 0)
                  .map((tile) => {
                    const ifpShare = tile.total ? Math.round((tile.ifp / tile.total) * 100) : 0;
                    // Once a party filter (IFP/T/YT/MF/Unknown/Marked) is active, tile.total
                    // already equals that filter's count for the area (areaTiles is built
                    // from sourceScopedVoters, which is pre-filtered by partyFilters) — so
                    // the % here is that count divided by the area's TRUE total (tracked
                    // separately in areaTrueTotals, unaffected by partyFilters).
                    const areaTrueTotal = areaTrueTotals.get(tile.key) ?? 0;
                    const filterShare = areaTrueTotal ? Math.round((tile.total / areaTrueTotal) * 100) : 0;
                    // Life/General alone (no party filter) needs a different lens: % of
                    // the area's GRAND total (both sources), not the source-scoped total —
                    // "what fraction of this area is Life voters", not "100% of Life is Life".
                    const hasPartyFilter = partyFilters.size > 0;
                    const hasSourceOnly = !hasPartyFilter && source !== "all";
                    const areaGrandTotal = areaGrandTotals.get(tile.key) ?? 0;
                    const sourceShare = areaGrandTotal ? Math.round((tile.total / areaGrandTotal) * 100) : 0;
                    const share = hasPartyFilter ? filterShare : hasSourceOnly ? sourceShare : ifpShare;
                    return (
                      <button key={tile.key} type="button" className="atlasTile" onClick={() => { setSelectedTile(tile.key); setExactHouseNoFilter(""); }}>
                        <span className="atlasName">{tile.label}</span>
                        <strong className="atlasTotal">{formatCount(tile.total)}</strong>
                        {hasPartyFilter || hasSourceOnly ? (
                          <span className="atlasIfp">{share}%</span>
                        ) : (
                          <span className="atlasIfp">IFP {formatCount(tile.ifp)} · {share}%</span>
                        )}
                        <span className="atlasBarTrack"><span className="atlasBarFill" style={{ width: `${share}%` }} /></span>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
          {!atlasMode && !votersLoading && filteredVoters.length === 0 && (
            <div className="noSelectionHint">
              <p>{t.noVoters}</p>
              {(partyFilters.size > 0 || source !== "all" || ageFilter !== "all" || query.trim() || exactHouseNoFilter) && (
                <>
                  <p className="activeFilterList">
                    {lang === "te" ? "యాక్టివ్ ఫిల్టర్లు: " : "Active filters: "}
                    {[
                      partyFilters.size > 0
                        ? PARTY_FILTER_ORDER.filter((cat) => partyFilters.has(cat))
                            .map((cat) =>
                              cat === "ifp" ? t.ifpOnly : cat === "target" ? t.targetCore : cat === "yt" ? t.ytCore : cat === "mf" ? t.mfCore : cat === "unknown" ? t.unknownCore : t.markedCore,
                            )
                            .join(" + ")
                        : null,
                      source !== "all" ? sourceLabel(source, t) : null,
                      ageFilter !== "all" ? `${ageFilterLabel(ageFilter, lang)} ${ageFilterRange(ageFilter)}` : null,
                      query.trim() ? `“${query.trim()}”` : null,
                      exactHouseNoFilter ? `D.no ${exactHouseNoFilter}` : null,
                    ].filter(Boolean).join(" · ")}
                  </p>
                  <button
                    type="button"
                    className="ghostBtn"
                    onClick={() => {
                      setPartyFilters(new Set());
                      setSource("all");
                      setAgeFilter("all");
                      setQuery("");
                      setExactHouseNoFilter("");
                    }}
                  >
                    {lang === "te" ? "అన్ని ఫిల్టర్లు తీసివేయండి" : "Clear all filters"}
                  </button>
                </>
              )}
            </div>
          )}
          {!atlasMode && (
          <div className="voterGrid">
            {filteredVoters.slice(0, visibleCount).map((voter, index) => (
              <article
                className={`voterCard${voter.is_ifp_voter ? " ifpMarked" : ""}${voter.is_yt_voter ? " ytMarked" : ""}${voter.is_target ? " targetMarked" : ""}${voter.is_mf_voter ? " mfMarked" : ""}`}
                key={voter.id}
                style={index < 40 && !debouncedQuery.trim() ? { animationDelay: `${index * 0.03}s` } : { animation: "none" }}
              >
                <div className="photoCol">
                  <SecureImage path={voter.photo_url} token={token} alt={displayName(voter, lang, t.missingName)} />
                  <div className="photoBadges">
                    <span
                      className={voter.source_kind === "life" ? "sourceBadge sourceLife" : "sourceBadge sourceGeneral"}
                      title={voter.source_kind === "life" ? t.lifeCount : t.generalCount}
                      aria-label={voter.source_kind === "life" ? t.lifeCount : t.generalCount}
                    >
                      {voter.source_badge}
                    </span>
                    <button
                      type="button"
                      className={`flagBadge${voter.is_flagged ? " flagBadge--on" : ""}`}
                      onClick={() => toggleFlagVoter(voter)}
                      disabled={flagBusyId === voter.id}
                      aria-pressed={Boolean(voter.is_flagged)}
                      aria-label={voter.is_flagged ? (lang === "te" ? "గుర్తు తీసివేయండి" : "Unmark") : (lang === "te" ? "గుర్తు పెట్టండి" : "Mark")}
                    >
                      {voter.is_flagged && <span className="iconPopIn"><FlagIcon /></span>}
                    </button>
                  </div>
                </div>
                <div>
                  <div className="voterTitleRow">
                    <h3 className={isNameAtFontFloor(displayName(voter, lang, t.missingName), lang) ? "ddWrap" : "ddCompact"} style={{ fontSize: nameFontSize(displayName(voter, lang, t.missingName), lang) }}>{displayName(voter, lang, t.missingName)}</h3>
                    <button type="button" className="cardOpenBtn" onClick={() => setSelected(voter)} aria-label={`${t.open} — ${displayName(voter, lang, t.missingName)}`}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m9 6 6 6-6 6" />
                      </svg>
                    </button>
                  </div>
                  <p className="relationRow">
                    <strong>{t.relation}: </strong>
                    <span className={isFieldAtFontFloor(displayRelation(voter.relation_name_te || "", lang)) ? "ddWrap" : "ddCompact"} style={{ fontSize: compactFieldFontSize(displayRelation(voter.relation_name_te || "", lang)) }}>
                      {displayRelation(voter.relation_name_te || "", lang)}
                    </span>
                  </p>
                  <dl>
                    <dt>{t.serial}</dt>
                    <dd>{voter.serial_no || "-"}</dd>
                    <dt>{t.age}</dt>
                    <dd>{displayAge(voter.age)}</dd>
                    <dt className="dtHouse">{t.house}</dt>
                    <dd className="ddCompact" style={{ fontSize: compactFieldFontSize(voter.house_no || "-") }}>{voter.house_no || "-"}</dd>
                    <dt>{t.area}</dt>
                    <dd className="ddCompact" style={{ fontSize: compactFieldFontSize(displayArea(voter, lang)) }}>{displayArea(voter, lang)}</dd>
                  </dl>
                  {voter.mobile && (
                    <p className="cardPhone">
                      <a
                        className="phoneLink"
                        href={`tel:${voter.mobile}`}
                        onClick={(event) => handlePhoneClick(event, voter.mobile as string)}
                      >
                        {voter.mobile}
                      </a>
                      {voter.has_whatsapp === false && (
                        <button
                          type="button"
                          className="noWhatsappBadge iconPopIn"
                          title={t.clearNoWhatsapp}
                          aria-label={t.clearNoWhatsapp}
                          disabled={noWaBusyId === voter.id}
                          onClick={() => void clearNoWhatsapp(voter)}
                        >
                          <NoWhatsappIcon />
                        </button>
                      )}
                    </p>
                  )}
                  {voter.notes && <p className="note">{voter.notes}</p>}
                </div>
                <div className="cardActions">
                  {voter.is_target ? (
                    <button
                      type="button"
                      className="partyBtn targetBtn active partyBtnSolo"
                      aria-pressed="true"
                      aria-label={`${t.targetCore} — ${displayName(voter, lang, t.missingName)}`}
                      title={tagTooltip("target", lang)}
                      disabled={targetBusyId === voter.id}
                      onClick={() => void toggleTargetVoter(voter)}
                    >
                      {targetBusyId === voter.id ? <SpinnerIcon /> : <><StarIcon filled /> T</>}
                    </button>
                  ) : voter.is_yt_voter ? (
                    <button
                      type="button"
                      className="partyBtn ytBtn active partyBtnSolo"
                      aria-pressed="true"
                      aria-label={`${t.ytCore} — ${displayName(voter, lang, t.missingName)}`}
                      title={tagTooltip("yt", lang)}
                      disabled={ytBusyId === voter.id}
                      onClick={() => void toggleYtVoter(voter)}
                    >
                      {ytBusyId === voter.id ? <SpinnerIcon /> : <><StarIcon filled /> YT</>}
                    </button>
                  ) : voter.is_mf_voter ? (
                    <button
                      type="button"
                      className="partyBtn mfBtn active partyBtnSolo"
                      aria-pressed="true"
                      aria-label={`MF — ${displayName(voter, lang, t.missingName)}`}
                      title={tagTooltip("mf", lang)}
                      disabled={mfBusyId === voter.id}
                      onClick={() => void toggleMfVoter(voter)}
                    >
                      {mfBusyId === voter.id ? <SpinnerIcon /> : <><StarIcon filled /> MF</>}
                    </button>
                  ) : voter.is_ifp_voter ? (
                    <button
                      type="button"
                      className="partyBtn ifpBtn active partyBtnSolo"
                      aria-pressed="true"
                      aria-label={`IFP — ${displayName(voter, lang, t.missingName)}`}
                      title={tagTooltip("ifp", lang)}
                      disabled={ifpBusyId === voter.id}
                      onClick={() => void toggleIfpVoter(voter)}
                    >
                      {ifpBusyId === voter.id ? <SpinnerIcon /> : <><StarIcon filled /> IFP</>}
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        className="partyBtn targetBtn"
                        aria-pressed="false"
                        aria-label={`${t.targetCore} — ${displayName(voter, lang, t.missingName)}`}
                        title={tagTooltip("target", lang)}
                        disabled={targetBusyId === voter.id}
                        onClick={() => void toggleTargetVoter(voter)}
                      >
                        {targetBusyId === voter.id ? <SpinnerIcon /> : <><StarIcon filled={false} /> T</>}
                      </button>
                      <button
                        type="button"
                        className="partyBtn ytBtn"
                        aria-pressed="false"
                        aria-label={`${t.ytCore} — ${displayName(voter, lang, t.missingName)}`}
                        title={tagTooltip("yt", lang)}
                        disabled={ytBusyId === voter.id}
                        onClick={() => void toggleYtVoter(voter)}
                      >
                        {ytBusyId === voter.id ? <SpinnerIcon /> : <><StarIcon filled={false} /> YT</>}
                      </button>
                      <button
                        type="button"
                        className="partyBtn mfBtn"
                        aria-pressed="false"
                        aria-label={`MF — ${displayName(voter, lang, t.missingName)}`}
                        title={tagTooltip("mf", lang)}
                        disabled={mfBusyId === voter.id}
                        onClick={() => void toggleMfVoter(voter)}
                      >
                        {mfBusyId === voter.id ? <SpinnerIcon /> : <><StarIcon filled={false} /> MF</>}
                      </button>
                      <button
                        type="button"
                        className="partyBtn ifpBtn"
                        aria-pressed="false"
                        aria-label={`IFP — ${displayName(voter, lang, t.missingName)}`}
                        title={tagTooltip("ifp", lang)}
                        disabled={ifpBusyId === voter.id}
                        onClick={() => void toggleIfpVoter(voter)}
                      >
                        {ifpBusyId === voter.id ? <SpinnerIcon /> : <><StarIcon filled={false} /> IFP</>}
                      </button>
                    </>
                  )}
                </div>
              </article>
            ))}
          </div>
          )}
          {/* Enhancement #8 — infinite scroll sentinel */}
          {!atlasMode && <div ref={sentinelRef} className="scrollSentinel" aria-hidden="true" />}
        </section>
      </section>

      {/* Mobile-only persistent bottom nav — the sticky header is static on
          phones (so it doesn't block taps on content underneath), which
          means it scrolls away. This keeps the 4 most-used actions within
          thumb reach at all times instead of a single floating search FAB
          that used to sit directly over the card's IFP button. */}
      <nav className="mobileBottomNav" aria-label={lang === "te" ? "త్వరిత నావిగేషన్" : "Quick navigation"}>
        <button type="button" onClick={goHome}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m3 11 9-8 9 8" /><path d="M5 10v10h14V10" />
          </svg>
          <span>{lang === "te" ? "పటం" : "Atlas"}</span>
        </button>
        <button type="button" onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); searchRef.current?.focus({ preventScroll: true }); }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
          </svg>
          <span>{lang === "te" ? "వెతుకు" : "Search"}</span>
        </button>
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 6h16M7 12h10M10 18h4" />
          </svg>
          <span>{lang === "te" ? "ఫిల్టర్లు" : "Filters"}</span>
        </button>
        <button type="button" onClick={() => setShowAreaStats(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 20V10M12 20V4M20 20v-6" />
          </svg>
          <span>{lang === "te" ? "గణాంకాలు" : "Stats"}</span>
        </button>
      </nav>

      {selected && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="voter-title" onClick={closeModal}>
          <section className="reviewPanel" ref={voterModalRef} tabIndex={-1} onClick={(event) => event.stopPropagation()}>
            <div className="modalHeader" onTouchStart={onSheetTouchStart} onTouchMove={onSheetTouchMove} onTouchEnd={(e) => onSheetTouchEnd(e, closeModal)}>
              <div>
                <h2 id="voter-title">{displayName(selected, lang, t.missingName)}</h2>
                <p>{displayArea(selected, lang)}</p>
              </div>
              <button type="button" className="close" onClick={closeModal} aria-label={t.close}>
                ×
              </button>
            </div>
            <div className={`reviewGrid${!selected.card_url && !selected.photo_url ? " reviewGridNoImage" : ""}`}>
              {(selected.card_url || selected.photo_url) && (
                <div>
                  <SecureImage path={selected.card_url || selected.photo_url} token={token} alt={selected.card_url ? t.card : t.photo} />
                </div>
              )}
              <form
                onSubmit={(event) => {
                  event.preventDefault();
                  void saveSelected();
                }}
              >
                <label key="serial_no">
                  {t.serial}
                  <input
                    value={String(selected.serial_no || "")}
                    onChange={(event) => updateSelectedField("serial_no", event.target.value as Voter["serial_no"])}
                  />
                </label>
                <label key="name_te">
                  <div className="nameLabelRow">
                    <span>{t.name}</span>
                    <div className="nameModeToggle">
                      <button type="button" className={nameMode === "en" ? "active" : ""} onClick={() => setNameMode("en")}>English</button>
                      <button type="button" className={nameMode === "te" ? "active" : ""} onClick={() => setNameMode("te")}>తెలుగు</button>
                    </div>
                  </div>
                  {nameMode === "en" ? (
                    <>
                      <input
                        placeholder="e.g. Chand Basha"
                        value={nameEnDraft}
                        onChange={(e) => {
                          const en = e.target.value;
                          setNameEnDraft(en);
                          updateSelectedField("name_te", englishToTeluguName(en) as Voter["name_te"]);
                        }}
                      />
                      <small className="fieldPreview">Telugu: {selected.name_te || "—"}</small>
                    </>
                  ) : (
                    <>
                      <input
                        value={selected.name_te || ""}
                        onChange={(e) => updateSelectedField("name_te", e.target.value as Voter["name_te"])}
                      />
                      <small className="fieldPreview">{t.englishPreview}: {displayName(selected, "en", t.missingName)}</small>
                    </>
                  )}
                </label>

                <label>
                  {t.moveArea}
                  <select
                    value={moveAreaFallback}
                    onChange={(event) => {
                      updateSelectedField("area_te", event.target.value);
                    }}
                  >
                    {!MOVE_AREA_OPTIONS.some((item) => item.value === moveAreaFallback) && moveAreaFallback ? (
                      <option value={moveAreaFallback}>{selected.area_te}</option>
                    ) : null}
                    {MOVE_AREA_OPTIONS.map((item) => (
                      <option key={item.label} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  {lang === "te" ? "మొబైల్ నంబర్ (10 అంకెలు)" : "Mobile number (10 digits)"}
                  <input
                    value={String(selected.mobile || "")}
                    onChange={(event) => updateSelectedField("mobile", event.target.value)}
                    placeholder="9876543210"
                    inputMode="tel"
                    maxLength={10}
                  />
                </label>

                {selected.is_deceased || selected.is_blocklisted || selected.is_cancelled ? (
                  <button
                    type="button"
                    className="secondary dangerGhost"
                    disabled={busy}
                    onClick={() => void markAndSave({ is_deceased: false, is_blocklisted: false, is_cancelled: false })}
                  >
                    {t.restoreActive}
                  </button>
                ) : (
                  <details className="dangerDetails">
                    <summary><WarningIcon /> {lang === "te" ? "ఇతర చర్యలు" : "Other actions"}</summary>
                    <button type="button" className="secondary dangerGhost" style={{ marginTop: "8px" }} disabled={busy}
                      onClick={() => {
                        const msg = lang === "te" ? "ఈ ఓటరును మరణించినవారిగా గుర్తించాలా?" : "Mark this voter as deceased?";
                        confirmAction(msg, () => void markAndSave({ is_deceased: true, is_blocklisted: false, is_cancelled: false, is_ifp_voter: false, is_yt_voter: false, is_target: false, is_mf_voter: false }));
                      }}>
                      {t.markDeceased}
                    </button>
                    <button type="button" className="secondary dangerGhost" style={{ marginTop: "8px" }} disabled={busy}
                      onClick={() => {
                        const msg = lang === "te" ? "ఈ ఓటరును బ్లాక్ లిస్ట్‌కు మార్చాలా?" : "Move this voter to the block list?";
                        confirmAction(msg, () => void markAndSave({ is_deceased: false, is_blocklisted: true, is_cancelled: false, is_ifp_voter: false, is_yt_voter: false, is_target: false, is_mf_voter: false }));
                      }}>
                      {t.markBlocklist}
                    </button>
                    <button type="button" className="secondary dangerGhost" style={{ marginTop: "8px" }} disabled={busy}
                      onClick={() => {
                        const msg = lang === "te" ? "ఈ ఓటరును రద్దు జాబితాకు మార్చాలా?" : "Move this voter to the cancelled list?";
                        confirmAction(msg, () => void markAndSave({ is_deceased: false, is_blocklisted: false, is_cancelled: true, is_ifp_voter: false, is_yt_voter: false, is_target: false, is_mf_voter: false }));
                      }}>
                      {t.markCancelled}
                    </button>
                  </details>
                )}

                <details className="modalMoreDetails">
                  <summary>{lang === "te" ? "మరిన్ని వివరాలు" : "More details"}</summary>
                  {([
                    ["relation_name_te", t.relation],
                    ["age", t.age],
                    ["occupation_te", t.occupation],
                    ["house_no", t.house],
                  ] as [keyof Voter, string][]).map(([key, label]) => (
                    <label key={key}>
                      {label}
                      <input
                        value={String(selected[key] || "")}
                        onChange={(event) => updateSelectedField(key, event.target.value as Voter[typeof key])}
                      />
                      {key === "age" && (
                        <small className="fieldPreview">
                          {lang === "te"
                            ? `కార్డుపై ఉన్నది నమోదు చేయండి (${VOTER_LIST_BASE_YEAR} నాటి వయస్సు) — ప్రస్తుత వయస్సు: ${displayAge(selected.age)}`
                            : `Enter what's printed on the card (age as of ${VOTER_LIST_BASE_YEAR}) — current age: ${displayAge(selected.age)}`}
                        </small>
                      )}
                    </label>
                  ))}
                </details>

                <details className="modalMoreDetails" open={Boolean(selected.wa_optin || selected.opted_out)}>
                  <summary>{lang === "te" ? "వాట్సాప్ ఒప్పందం" : "WhatsApp opt-in"}</summary>
                  <label className="optinRow">
                    <input
                      type="checkbox"
                      checked={Boolean(selected.wa_optin)}
                      onChange={(event) => updateSelectedField("wa_optin", event.target.checked)}
                    />
                    <span>{lang === "te" ? "వాట్సాప్ సందేశాలకు ఒప్పుకున్నారు" : "Opted in to WhatsApp messages"}</span>
                  </label>
                  {selected.opted_out && (
                    <p className="optoutFlag">{lang === "te" ? "ఈ సభ్యుడు STOP పంపి వద్దన్నారు" : "This member sent STOP (opted out)"}</p>
                  )}
                </details>

                {selected.notes && <p className="note">{selected.notes}</p>}
                {error && <p className="error" role="alert">{error}</p>}
                <div className="modalFooter">
                  <button type="submit" className="primary" disabled={busy}>{t.save}</button>
                  <button type="button" className="secondary" onClick={closeModal}>{t.close}</button>
                </div>
              </form>
            </div>
          </section>
        </div>
      )}

      {showAreaMgr && (
        <div className="modal" role="dialog" aria-modal="true" aria-label={t.manageAreas} onClick={() => setShowAreaMgr(false)}>
          <section className="areaMgrPanel" ref={areaMgrRef} tabIndex={-1} onClick={(event) => event.stopPropagation()}>
            <div className="modalHeader" onTouchStart={onSheetTouchStart} onTouchMove={onSheetTouchMove} onTouchEnd={(e) => onSheetTouchEnd(e, () => setShowAreaMgr(false))}>
              <div>
                <h2>{t.manageAreas}</h2>
                <p>
                  {areaManagerRows.length} {t.rawAreaCount} · {unclassifiedAreas.length} {t.unclassifiedCount}
                </p>
              </div>
              <button type="button" className="close" onClick={() => setShowAreaMgr(false)} aria-label={t.close}>×</button>
            </div>
            <div className="areaMgrBody">
              {rawAreas.length === 0 ? (
                <p className="noSelectionHint">...</p>
              ) : (
                <>
                  <p className="areaMgrIntro">
                    {unclassifiedAreas.length === 0 ? t.allAreasClassified : `${unclassifiedAreas.length} ${t.unclassifiedCount}`}
                  </p>
                  <table className="areaTable">
                    <thead>
                      <tr>
                        <th>{t.area}</th>
                        <th>{t.total}</th>
                        <th>{t.selectedArea}</th>
                        <th>{t.mergeArea}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {areaManagerRows.map((area) => (
                        <tr key={area.area_te} className={area.count === 0 ? "isEmptyAreaRow" : ""}>
                          <td>{area.area_te}</td>
                          <td>{area.count}</td>
                          <td>
                            {area.matchedLabel ? (
                              <span className="areaTag ok">{area.matchedLabel}</span>
                            ) : (
                              <span className="areaTag warn">{t.unclassifiedCount}</span>
                            )}
                          </td>
                          <td>
                            <div className="mergeRow">
                              <select
                                value={mergeTargets[area.area_te] || ""}
                                onChange={(event) =>
                                  setMergeTargets((prev) => ({ ...prev, [area.area_te]: event.target.value }))
                                }
                              >
                                <option value="">— {t.mergeTarget} —</option>
                                {MOVE_AREA_OPTIONS.map((opt) => (
                                  <option key={opt.label} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                              <button
                                type="button"
                                disabled={area.count === 0 || !mergeTargets[area.area_te] || mergeTargets[area.area_te] === area.area_te || busy}
                                onClick={() => void mergeArea(area.area_te)}
                              >
                                {t.mergeAction}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}
              {error && <p className="error" style={{ marginTop: "12px" }} role="alert">{error}</p>}
            </div>
          </section>
        </div>
      )}

      {showDeceasedMgr && (
        <div className="modal" role="dialog" aria-modal="true" aria-label={lang === "te" ? "మరణించిన ఓటర్లు" : "Deceased Voters"} onClick={() => setShowDeceasedMgr(false)}>
          <section className="areaMgrPanel" ref={deceasedRef} tabIndex={-1} onClick={(event) => event.stopPropagation()}>
            <div className="modalHeader" onTouchStart={onSheetTouchStart} onTouchMove={onSheetTouchMove} onTouchEnd={(e) => onSheetTouchEnd(e, () => setShowDeceasedMgr(false))}>
              <div>
                <h2>{lang === "te" ? "మరణించిన ఓటర్లు" : "Deceased Voters"}</h2>
                <p>{lang === "te" ? `ప్రత్యేకంగా ఉంచిన జాబితా • మొత్తం ${deceasedVoters.length}` : `Separated archive • Total ${deceasedVoters.length}`}</p>
              </div>
              <button type="button" className="close" onClick={() => setShowDeceasedMgr(false)} aria-label={t.close}>×</button>
            </div>
            <div className="areaMgrBody">
              {deceasedVoters.length === 0 ? (
                <p className="noSelectionHint">{lang === "te" ? "మరణించిన ఓటర్లు లేరు" : "No deceased voters on record"}</p>
              ) : (
                <div className="archiveVoterGrid">
                  {deceasedVoters.map((voter) => (
                    <div key={voter.id} className="archiveVoterCard">
                      <div className="archiveVoterPhoto">
                        <SecureImage path={voter.photo_url} token={token} alt={t.photo} />
                      </div>
                      <div className="archiveVoterInfo">
                        <span className="archiveVoterName">{displayName(voter, lang, t.missingName)}</span>
                        <span className="archiveVoterMeta">#{voter.serial_no} · {displayArea(voter, lang)}</span>
                        <button
                          type="button"
                          className="ghostBtn archiveRestoreBtn"
                          disabled={busy}
                          onClick={async () => {
                            setBusy(true);
                            try {
                              await patchVoter(voter, { is_deceased: false, is_blocklisted: false, is_cancelled: false });
                            } catch (err) {
                              setError(friendlyError(err, lang));
                            } finally {
                              setBusy(false);
                            }
                          }}
                        >
                          {t.restoreActive}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {showBlocklistMgr && (
        <div className="modal" role="dialog" aria-modal="true" aria-label={lang === "te" ? "బ్లాక్ లిస్ట్" : "Block List"} onClick={() => setShowBlocklistMgr(false)}>
          <section className="areaMgrPanel" ref={blocklistRef} tabIndex={-1} onClick={(event) => event.stopPropagation()}>
            <div className="modalHeader" onTouchStart={onSheetTouchStart} onTouchMove={onSheetTouchMove} onTouchEnd={(e) => onSheetTouchEnd(e, () => setShowBlocklistMgr(false))}>
              <div>
                <h2>{lang === "te" ? "బ్లాక్ లిస్ట్" : "Block List"}</h2>
                <p>{lang === "te" ? `ప్రత్యేకంగా ఉంచిన ప్రత్యర్థి జాబితా • మొత్తం ${blocklistedVoters.length}` : `Separated opponent archive • Total ${blocklistedVoters.length}`}</p>
              </div>
              <button type="button" className="close" onClick={() => setShowBlocklistMgr(false)} aria-label={t.close}>×</button>
            </div>
            <div className="areaMgrBody">
              {blocklistedVoters.length === 0 ? (
                <p className="noSelectionHint">{lang === "te" ? "బ్లాక్ లిస్ట్‌లో ఓటర్లు లేరు" : "No block-listed voters"}</p>
              ) : (
                <div className="archiveVoterGrid">
                  {blocklistedVoters.map((voter) => (
                    <div key={voter.id} className="archiveVoterCard">
                      <div className="archiveVoterPhoto">
                        <SecureImage path={voter.photo_url} token={token} alt={t.photo} />
                      </div>
                      <div className="archiveVoterInfo">
                        <span className="archiveVoterName">{displayName(voter, lang, t.missingName)}</span>
                        <span className="archiveVoterMeta">#{voter.serial_no} · {displayArea(voter, lang)}</span>
                        <button
                          type="button"
                          className="ghostBtn archiveRestoreBtn"
                          disabled={busy}
                          onClick={async () => {
                            setBusy(true);
                            try {
                              await patchVoter(voter, { is_deceased: false, is_blocklisted: false, is_cancelled: false });
                            } catch (err) {
                              setError(friendlyError(err, lang));
                            } finally {
                              setBusy(false);
                            }
                          }}
                        >
                          {t.restoreActive}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {showCancelledMgr && (
        <div className="modal" role="dialog" aria-modal="true" aria-label={lang === "te" ? "రద్దు ఓటర్లు" : "Cancelled Voters"} onClick={() => setShowCancelledMgr(false)}>
          <section className="areaMgrPanel" ref={cancelledRef} tabIndex={-1} onClick={(event) => event.stopPropagation()}>
            <div className="modalHeader" onTouchStart={onSheetTouchStart} onTouchMove={onSheetTouchMove} onTouchEnd={(e) => onSheetTouchEnd(e, () => setShowCancelledMgr(false))}>
              <div>
                <h2>{lang === "te" ? "రద్దు ఓటర్లు" : "Cancelled Voters"}</h2>
                <p>{lang === "te" ? `దాచిన రద్దు జాబితా • మొత్తం ${cancelledVoters.length}` : `Hidden cancelled archive • Total ${cancelledVoters.length}`}</p>
              </div>
              <button type="button" className="close" onClick={() => setShowCancelledMgr(false)} aria-label={t.close}>×</button>
            </div>
            <div className="areaMgrBody">
              {cancelledVoters.length === 0 ? (
                <p className="noSelectionHint">{lang === "te" ? "రద్దు ఓటర్లు లేరు" : "No cancelled voters"}</p>
              ) : (
                <div className="archiveVoterGrid">
                  {cancelledVoters.map((voter) => (
                    <div key={voter.id} className="archiveVoterCard">
                      <div className="archiveVoterPhoto">
                        <SecureImage path={voter.photo_url} token={token} alt={t.photo} />
                      </div>
                      <div className="archiveVoterInfo">
                        <span className="archiveVoterName">{displayName(voter, lang, t.missingName)}</span>
                        <span className="archiveVoterMeta">#{voter.serial_no} · {displayArea(voter, lang)}</span>
                        <button
                          type="button"
                          className="ghostBtn archiveRestoreBtn"
                          disabled={busy}
                          onClick={async () => {
                            setBusy(true);
                            try {
                              await patchVoter(voter, { is_deceased: false, is_blocklisted: false, is_cancelled: false });
                            } catch (err) {
                              setError(friendlyError(err, lang));
                            } finally {
                              setBusy(false);
                            }
                          }}
                        >
                          {t.restoreActive}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {showFamilyMgr && (
        <div className="modal" role="dialog" aria-modal="true" aria-label={t.familyVoting} onClick={() => setShowFamilyMgr(false)}>
          <section className="areaMgrPanel familyPanel" ref={familyRef} tabIndex={-1} onClick={(event) => event.stopPropagation()}>
            <div className="modalHeader" onTouchStart={onSheetTouchStart} onTouchMove={onSheetTouchMove} onTouchEnd={(e) => onSheetTouchEnd(e, () => setShowFamilyMgr(false))}>
              <div>
                <h2>{t.familyVoting}</h2>
                <p>{selectedTileLabel || t.all} · {sourceLabel(source, t)} · {t.familyGroups} {formatCount(familyClusters.length)}</p>
              </div>
              <button type="button" className="close" onClick={() => setShowFamilyMgr(false)} aria-label={t.close}>×</button>
            </div>
            <div className="areaMgrBody familyPanelBody">
              <p className="areaMgrIntro">{t.familyScope}</p>
              <p className="familyRule">{t.familyRule}</p>
              <div className="familySummaryGrid">
                <article className="familySummaryCard">
                  <span>{t.familyGroups}</span>
                  <strong>{formatCount(familyClusters.length)}</strong>
                </article>
                <article className="familySummaryCard">
                  <span>{t.familyCovered}</span>
                  <strong>{formatCount(familyCoveredCount)}</strong>
                </article>
                <article className="familySummaryCard">
                  <span>{t.familyMax}</span>
                  <strong>{formatCount(largestFamilyCluster)}</strong>
                </article>
              </div>
              {familyClusters.length === 0 ? (
                <p className="noSelectionHint">{t.familyNoGroups}</p>
              ) : (
                <div className="familyTableWrap">
                  <table className="familyTable">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>{t.familyDoor}</th>
                        <th>{t.area}</th>
                        <th>{t.familyCount}</th>
                        <th>{t.lifeCount}</th>
                        <th>{t.generalCount}</th>
                        <th>{t.ifpCount}</th>
                        <th>{t.familyMembers}</th>
                        <th>{t.open}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {familyClusters.map((cluster, index) => (
                        <tr key={cluster.key}>
                          <td>{formatCount(index + 1)}</td>
                          <td>
                            <span className="familyDoorBadge">{cluster.houseNo}</span>
                          </td>
                          <td>{cluster.areaLabel}</td>
                          <td><strong>{formatCount(cluster.count)}</strong></td>
                          <td>{formatCount(cluster.life)}</td>
                          <td>{formatCount(cluster.general)}</td>
                          <td>{formatCount(cluster.ifp)}</td>
                          <td>
                            <div className="familyMemberList">
                              {cluster.voters.map((voter) => (
                                <span key={voter.id} className={`familyMemberChip ${voter.source_kind === "life" ? "life" : "general"}`}>
                                  {displayName(voter, lang, t.missingName)}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td>
                            <button type="button" className="ghostBtn familyFocusBtn" onClick={() => focusFamilyCluster(cluster)}>
                              {t.familyViewMembers}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      {showAreaStats && (
        <div className="modal" role="dialog" aria-modal="true" aria-label={t.areaStats} onClick={() => setShowAreaStats(false)}>
          <section className="areaMgrPanel areaStatsPanel" ref={areaStatsRef} tabIndex={-1} onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader" onTouchStart={onSheetTouchStart} onTouchMove={onSheetTouchMove} onTouchEnd={(e) => onSheetTouchEnd(e, () => setShowAreaStats(false))}>
              <strong>{t.areaStats}</strong>
              <span className="modalCount">{sidebarAreaStats.length}</span>
              <button type="button" className="ghostBtn" aria-label={t.close} onClick={() => setShowAreaStats(false)}>✕</button>
            </div>
            <div className="sidebarStatsTableWrap">
              <table className="sidebarStatsTable">
                <thead>
                  <tr>
                    <th>{t.area}</th>
                    <th>{t.sourceLife}</th>
                    <th>{t.sourceGeneral}</th>
                    <th>{t.total}</th>
                  </tr>
                </thead>
                <tbody>
                  {sidebarAreaStats.map((tile) => (
                    <tr key={`stats-${tile.key}`} className={tile.key === selectedTile ? "isSelected" : ""}>
                      <td>{tile.label}</td>
                      <td>{tile.life}</td>
                      <td>{tile.general}</td>
                      <td>{tile.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}

      {showCampaigns && (
        <CampaignConsole
          token={token}
          lang={lang}
          areaOptions={MOVE_AREA_OPTIONS}
          onClose={() => setShowCampaigns(false)}
        />
      )}
      {confirmDialog && (
        <div className="modal confirmModal" role="alertdialog" aria-modal="true" aria-label={confirmDialog.message} onClick={() => setConfirmDialog(null)}>
          <section className="confirmPanel" ref={confirmDialogRef} tabIndex={-1} onClick={(event) => event.stopPropagation()}>
            <p className="confirmMessage">{confirmDialog.message}</p>
            <div className="confirmActions">
              <button type="button" className="secondary" onClick={() => setConfirmDialog(null)}>{t.confirmNo}</button>
              <button
                type="button"
                className="confirmYesBtn"
                onClick={() => {
                  const action = confirmDialog.onConfirm;
                  setConfirmDialog(null);
                  action();
                }}
              >
                {t.confirmYes}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
