"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { API_BASE, AreaOption, Job, Lang, SourceFilter, Voter, api, copy } from "@/lib/api";
import { englishToTeluguName, toEnglishArea, toEnglishName, toEnglishText } from "@/lib/transliterate";
import { SecureImage } from "@/components/SecureImage";

type ScopeStats = {
  total: number;
  life: number;
  general: number;
  missing: number;
  yt: number;
  target: number;
  mf: number;
  ifp: number;
};

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

const SOURCE_ORDER: SourceFilter[] = ["all", "life", "general"];
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

function voterMatchesQuery(voter: Voter, query: string) {
  const needle = query.trim().toLowerCase();
  if (!needle) {
    return true;
  }
  return [
    voter.serial_no,
    voter.card_no,
    voter.name_te,
    voter.name_en,
    voter.relation_name_te,
    voter.house_no,
    voter.area_te,
    voter.source_filename,
  ]
    .join(" ")
    .toLowerCase()
    .includes(needle);
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

function renderFilterMeta(parts: Array<string | number>) {
  return (
    <small className="filterMeta">
      {parts.map((part, index) => (
        <span key={`${part}-${index}`}>{part}</span>
      ))}
    </small>
  );
}

function formatPercent(value: number, lang: Lang) {
  const rounded = Math.round(value * 10) / 10;
  return `${new Intl.NumberFormat(lang === "te" ? "te-IN" : "en-IN", {
    minimumFractionDigits: rounded % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1,
  }).format(rounded)}%`;
}

function compactFieldFontSize(value: string): string {
  const len = value.trim().length;
  if (len > 14) return "10px";
  if (len > 10) return "11px";
  if (len > 5) return "12px";
  return "13px";
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

function displayOccupation(text: string, lang: Lang) {
  if (lang === "te") {
    return text || "-";
  }
  return toEnglishText(text || "", text || "-") || "-";
}

function displayArea(voter: Pick<Voter, "area_te" | "area_en">, lang: Lang) {
  if (lang === "te") {
    return voter.area_te || "-";
  }
  return toEnglishArea(voter.area_te || "", voter.area_en || "Other Area") || voter.area_en || voter.area_te || "-";
}

export default function Home() {
  const topbarRef = useRef<HTMLElement | null>(null);
  const stickyZoneRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const [lang, setLang] = useState<Lang>("te");
  const t = copy[lang];
  const [token, setToken] = useState("");
  const [code, setCode] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobId, setJobId] = useState<string>("all");
  const [selectedTile, setSelectedTile] = useState("");
  const [source, setSource] = useState<SourceFilter>("all");
  const [showDeceasedMgr, setShowDeceasedMgr] = useState(false);
  const [showBlocklistMgr, setShowBlocklistMgr] = useState(false);
  const [showCancelledMgr, setShowCancelledMgr] = useState(false);
  const [showFamilyMgr, setShowFamilyMgr] = useState(false);
  const [partyFilter, setPartyFilter] = useState<"ifp" | "yt" | "target" | "mf" | null>(null);
  const [query, setQuery] = useState("");
  const [exactHouseNoFilter, setExactHouseNoFilter] = useState("");
  const [allVoters, setAllVoters] = useState<Voter[]>([]);
  const [selected, setSelected] = useState<Voter | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [ifpBusyId, setIfpBusyId] = useState("");
  const [ytBusyId, setYtBusyId] = useState("");
  const [targetBusyId, setTargetBusyId] = useState("");
  const [mfBusyId, setMfBusyId] = useState("");
  const [pdfBusy, setPdfBusy] = useState(false);
  const [browseAll, setBrowseAll] = useState(false);
  const [showJumpSearch, setShowJumpSearch] = useState(false);
  const [votersLoading, setVotersLoading] = useState(false);
  const [showAreaMgr, setShowAreaMgr] = useState(false);
  const [showAreaStats, setShowAreaStats] = useState(false);
  const [rawAreas, setRawAreas] = useState<{ area_te: string; count: number; missing_count: number }[]>([]);
  const [knownAreaOptions, setKnownAreaOptions] = useState<AreaOption[]>([]);
  const [mergeTargets, setMergeTargets] = useState<Record<string, string>>({});
  const [visibleCount, setVisibleCount] = useState(120);
  const [nameMode, setNameMode] = useState<"te" | "en">("en");
  const [nameEnDraft, setNameEnDraft] = useState("");

  useEffect(() => {
    if (selected) {
      setNameEnDraft(selected.name_en || "");
      setNameMode("en");
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
  }, [token, jobId]);

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
        localStorage.removeItem("voter-token");
        setToken("");
        return;
      }
      if (!res.ok) return; // transient server error — keep session alive
      setJobs(await res.json() as Job[]);
    } catch {
      // network error — don't logout
    }
  }

  function currentBasePath() {
    return jobId === "all" ? "/api" : `/api/jobs/${jobId}`;
  }

  async function loadAllVoters() {
    setVotersLoading(true);
    try {
      setAllVoters(await api<Voter[]>(`${currentBasePath()}/voters?include_deceased=1&include_blocklisted=1&include_cancelled=1`, token));
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
    const form = new FormData();
    form.append("file", file);
    try {
      await api<Job>("/api/jobs", token, { method: "POST", body: form });
      await refreshJobs();
      await loadAllVoters();
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  }

  async function saveSelected() {
    if (!selected) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      await patchVoter(selected, {
        serial_no: selected.serial_no,
        name_te: selected.name_te,
        name_en: nameMode === "en" ? nameEnDraft : selected.name_en,
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
      });
      closeModal();
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  }

  async function toggleIfpVoter(voter: Voter) {
    const next = !Boolean(voter.is_ifp_voter);
    const patch = next
      ? { is_ifp_voter: true, is_yt_voter: false, is_target: false, is_mf_voter: false }
      : { is_ifp_voter: false };
    setAllVoters((prev) => prev.map((v) => (v.id === voter.id ? { ...v, ...patch } : v)));
    setIfpBusyId(voter.id);
    setError("");
    try {
      await patchVoter(voter, patch);
    } catch (err) {
      setAllVoters((prev) => prev.map((v) => (v.id === voter.id ? { ...v, is_ifp_voter: voter.is_ifp_voter, is_yt_voter: voter.is_yt_voter, is_target: voter.is_target, is_mf_voter: voter.is_mf_voter } : v)));
      setError(String(err));
    } finally {
      setIfpBusyId("");
    }
  }

  async function toggleYtVoter(voter: Voter) {
    const next = !Boolean(voter.is_yt_voter);
    const patch = next
      ? { is_yt_voter: true, is_ifp_voter: false, is_target: false, is_mf_voter: false }
      : { is_yt_voter: false };
    setAllVoters((prev) => prev.map((v) => (v.id === voter.id ? { ...v, ...patch } : v)));
    setYtBusyId(voter.id);
    setError("");
    try {
      await patchVoter(voter, patch);
    } catch (err) {
      setAllVoters((prev) => prev.map((v) => (v.id === voter.id ? { ...v, is_yt_voter: voter.is_yt_voter, is_ifp_voter: voter.is_ifp_voter, is_target: voter.is_target, is_mf_voter: voter.is_mf_voter } : v)));
      setError(String(err));
    } finally {
      setYtBusyId("");
    }
  }

  async function toggleTargetVoter(voter: Voter) {
    const next = !Boolean(voter.is_target);
    const patch = next
      ? { is_target: true, is_ifp_voter: false, is_yt_voter: false, is_mf_voter: false }
      : { is_target: false };
    setAllVoters((prev) => prev.map((v) => (v.id === voter.id ? { ...v, ...patch } : v)));
    setTargetBusyId(voter.id);
    setError("");
    try {
      await patchVoter(voter, patch);
    } catch (err) {
      setAllVoters((prev) => prev.map((v) => (v.id === voter.id ? { ...v, is_target: voter.is_target, is_ifp_voter: voter.is_ifp_voter, is_yt_voter: voter.is_yt_voter, is_mf_voter: voter.is_mf_voter } : v)));
      setError(String(err));
    } finally {
      setTargetBusyId("");
    }
  }

  async function toggleMfVoter(voter: Voter) {
    const next = !Boolean(voter.is_mf_voter);
    const patch = next
      ? { is_mf_voter: true, is_ifp_voter: false, is_yt_voter: false, is_target: false }
      : { is_mf_voter: false };
    setAllVoters((prev) => prev.map((v) => (v.id === voter.id ? { ...v, ...patch } : v)));
    setMfBusyId(voter.id);
    setError("");
    try {
      await patchVoter(voter, patch);
    } catch (err) {
      setAllVoters((prev) => prev.map((v) => (v.id === voter.id ? { ...v, is_mf_voter: voter.is_mf_voter, is_ifp_voter: voter.is_ifp_voter, is_yt_voter: voter.is_yt_voter, is_target: voter.is_target } : v)));
      setError(String(err));
    } finally {
      setMfBusyId("");
    }
  }

  async function markAndSave(patch: Partial<Voter>) {
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      await patchVoter(selected, patch);
      closeModal();
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  }

  function focusFamilyCluster(cluster: FamilyCluster) {
    setSelectedTile(cluster.areaKey);
    setQuery(cluster.houseNo);
    setExactHouseNoFilter(cluster.houseNo);
    setShowFamilyMgr(false);
  }

  function closeModal() {
    setSelected(null);
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
      setError(String(err));
    } finally {
      setBusy(false);
    }
  }

  function downloadCsv(selectedArea?: string) {
    const url = new URL(`${API_BASE}${currentBasePath()}/export.csv`);
    if (selectedArea) {
      url.searchParams.set("area", selectedArea);
    }
    if (source !== "all") {
      url.searchParams.set("source", source);
    }
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.blob())
      .then((blob) => {
        const href = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = href;
        anchor.download = selectedArea ? `${selectedArea}.csv` : "all-voters.csv";
        anchor.click();
        URL.revokeObjectURL(href);
      });
  }

  async function downloadPdf(areaLabel: string) {
    setPdfBusy(true);
    try {
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
        const name = displayName(v, lang, "[పేరు తెలియదు]");
        const tags = [
          v.is_target    ? `<span class="tag tag-t">T</span>`   : "",
          v.is_yt_voter  ? `<span class="tag tag-yt">YT</span>` : "",
          v.is_mf_voter  ? `<span class="tag tag-mf">MF</span>` : "",
          v.is_ifp_voter ? `<span class="tag tag-ifp">IFP</span>` : "",
        ].filter(Boolean).join("");
        return `<div class="card">
          <div class="photo">${img}<span class="badge ${badgeCls}">${badge}</span></div>
          <div class="info">
            <div class="name">${name || "[పేరు తెలియదు]"}${tags ? `<span class="tags">${tags}</span>` : ""}</div>
            <div class="row"><span class="lbl">${lang === "te" ? "తండ్రి" : "Father"}</span><span>${displayRelation(v.relation_name_te || "", lang)}</span></div>
            <div class="row"><span class="lbl">సీరియల్</span><span>${v.serial_no || "-"}</span></div>
            <div class="row"><span class="lbl">వయస్సు</span><span>${v.age || "-"}</span></div>
            <div class="row"><span class="lbl">D.no</span><span>${v.house_no || "-"}</span></div>
          </div>
        </div>`;
      }

      function section(title: string, voters: Voter[]): string {
        if (!voters.length) return "";
        return `<div class="section">
          <div class="secHeader">${title} <span class="cnt">${voters.length}</span></div>
          <div class="grid">${voters.map(voterRow).join("")}</div>
        </div>`;
      }

      const html = `<!DOCTYPE html><html lang="te"><head>
<meta charset="UTF-8">
<title>${areaLabel} — ఓటర్ జాబితా</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@400;700&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Noto Sans Telugu', 'Segoe UI', sans-serif; font-size: 11px; background: #fff; color: #1a1a1a; }
  .pageHeader { padding: 12px 16px; background: #0e4a35; color: #fff; display: flex; justify-content: space-between; align-items: center; }
  .pageHeader h1 { font-size: 15px; }
  .pageHeader .meta { font-size: 11px; opacity: 0.85; text-align: right; }
  .section { padding: 12px 16px; }
  .secHeader { font-size: 13px; font-weight: 700; padding: 6px 10px; background: #f0ebe0; border-bottom: 2px solid #0e4a35; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; }
  .secHeader .cnt { background: #0e4a35; color: #fff; border-radius: 99px; padding: 1px 8px; font-size: 11px; }
  .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
  .card { display: flex; gap: 6px; border: 1px solid #d7cfbe; border-radius: 6px; padding: 6px; break-inside: avoid; }
  .photo { position: relative; flex-shrink: 0; width: 56px; }
  .photo img, .photo .noPhoto { width: 56px; height: 72px; object-fit: cover; border-radius: 4px; background: #e8e3d8; }
  .badge { position: absolute; bottom: 2px; right: 2px; font-size: 9px; font-weight: 700; padding: 1px 4px; border-radius: 3px; }
  .life { background: #d1fae5; color: #065f46; }
  .gen { background: #ede9fe; color: #4c1d95; }
  .info { flex: 1; min-width: 0; }
  .name { font-weight: 700; font-size: 12px; margin-bottom: 3px; overflow-wrap: anywhere; display: flex; flex-wrap: wrap; align-items: center; gap: 3px; }
  .tags { display: inline-flex; gap: 2px; flex-shrink: 0; }
  .tag { font-size: 8px; font-weight: 700; padding: 1px 4px; border-radius: 3px; line-height: 1.4; }
  .tag-t   { background: #fef2f2; color: #b91c1c; }
  .tag-yt  { background: #f3f0ff; color: #6d28d9; }
  .tag-mf  { background: #f0fdfa; color: #0d9488; }
  .tag-ifp { background: #d1fae5; color: #065f46; }
  .row { display: flex; gap: 4px; font-size: 10px; line-height: 1.5; }
  .lbl { color: #6b7280; flex-shrink: 0; }
  @media print {
    .pageHeader { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .secHeader { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .badge { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head><body>
<div class="pageHeader">
  <h1>${areaLabel}</h1>
  <div class="meta">
    మొత్తం ${filteredVoters.length} · లైఫ్ ${life.length} · జనరల్ ${general.length}<br>
    ${new Date().toLocaleDateString("te-IN")}
  </div>
</div>
${section("లైఫ్ ఓటర్లు", life)}
${section("జనరల్ ఓటర్లు", general)}
</body></html>`;

      const win = window.open("", "_blank");
      if (!win) return;
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

  const deceasedVoters = useMemo(() => allVoters.filter((item) => Boolean(item.is_deceased)), [allVoters]);
  const blocklistedVoters = useMemo(() => allVoters.filter((item) => Boolean(item.is_blocklisted)), [allVoters]);
  const cancelledVoters = useMemo(() => allVoters.filter((item) => Boolean(item.is_cancelled)), [allVoters]);
  const activeVoters = useMemo(
    () => allVoters.filter((item) => !item.is_deceased && !item.is_blocklisted && !item.is_cancelled),
    [allVoters],
  );
  const ifpVoters = useMemo(() => activeVoters.filter((item) => Boolean(item.is_ifp_voter)), [activeVoters]);
  const ytVoters = useMemo(() => activeVoters.filter((item) => Boolean(item.is_yt_voter)), [activeVoters]);
  const targetVoters = useMemo(() => activeVoters.filter((item) => Boolean(item.is_target)), [activeVoters]);
  const mfVoters = useMemo(() => activeVoters.filter((item) => Boolean(item.is_mf_voter)), [activeVoters]);

  // area-scoped counts NOT filtered by partyFilter — used for chip labels so all 4 stay non-zero
  const areaBaseVoters = useMemo(
    () => (selectedTile ? activeVoters.filter((item) => getAreaTile(item)?.key === selectedTile) : activeVoters),
    [activeVoters, selectedTile],
  );
  const areaBaseStats = useMemo(
    () =>
      areaBaseVoters.reduce<ScopeStats>(
        (acc, item) => {
          acc.total += 1;
          acc.ifp += item.is_ifp_voter ? 1 : 0;
          acc.yt += item.is_yt_voter ? 1 : 0;
          acc.target += item.is_target ? 1 : 0;
          acc.mf += item.is_mf_voter ? 1 : 0;
          if (item.source_kind === "life") acc.life += 1;
          else acc.general += 1;
          return acc;
        },
        { total: 0, life: 0, general: 0, missing: 0, ifp: 0, yt: 0, target: 0, mf: 0 },
      ),
    [areaBaseVoters],
  );

  const scopedVoters = useMemo(() => {
    if (partyFilter === "ifp") return ifpVoters;
    if (partyFilter === "yt") return ytVoters;
    if (partyFilter === "target") return targetVoters;
    if (partyFilter === "mf") return mfVoters;
    return activeVoters;
  }, [partyFilter, activeVoters, ifpVoters, ytVoters, targetVoters, mfVoters]);

  // source-filtered too, so atlas tile counts (incl. IFP share) respect the Life/General pills
  const sourceScopedVoters = useMemo(
    () => (source === "all" ? scopedVoters : scopedVoters.filter((v) => v.source_kind === source)),
    [scopedVoters, source],
  );

  const areaTiles = useMemo<AreaTileSummary[]>(() => {
    const tileMap = new Map<string, AreaTileSummary>(
      AREA_TILES.map((tile) => [
        tile.key,
        { ...tile, total: 0, life: 0, general: 0, missing: 0, ifp: 0, yt: 0, target: 0, mf: 0 },
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

  const selectedAreaVoters = useMemo(
    () => (selectedTile ? scopedVoters.filter((item) => getAreaTile(item)?.key === selectedTile) : scopedVoters),
    [scopedVoters, selectedTile],
  );

  const familyScopeVoters = useMemo(
    () => selectedAreaVoters.filter((item) => source === "all" || item.source_kind === source),
    [selectedAreaVoters, source],
  );

  const filteredVoters = useMemo(() => {
    return selectedAreaVoters.filter((voter) => {
      if (source !== "all" && voter.source_kind !== source) {
        return false;
      }
      if (exactHouseNoFilter && normalizeHouseNo(voter.house_no || "") !== exactHouseNoFilter) {
        return false;
      }
      return voterMatchesQuery(voter, query);
    });
  }, [exactHouseNoFilter, query, selectedAreaVoters, source]);

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

  const selectedScopeStats = useMemo(
    () =>
      selectedAreaVoters.reduce<ScopeStats>(
        (acc, item) => {
          acc.total += 1;
          acc.missing += voterMissingCount(item) > 0 ? 1 : 0;
          acc.ifp += item.is_ifp_voter ? 1 : 0;
          acc.yt += item.is_yt_voter ? 1 : 0;
          acc.target += item.is_target ? 1 : 0;
          acc.mf += item.is_mf_voter ? 1 : 0;
          if (item.source_kind === "life") acc.life += 1;
          else acc.general += 1;
          return acc;
        },
        { total: 0, life: 0, general: 0, missing: 0, ifp: 0, yt: 0, target: 0, mf: 0 },
      ),
    [selectedAreaVoters],
  );

  const selectedIfpShare = useMemo(
    () => (selectedScopeStats.total ? (selectedScopeStats.ifp / selectedScopeStats.total) * 100 : 0),
    [selectedScopeStats],
  );
  const selectedLifeShare = useMemo(
    () => (selectedScopeStats.total ? (selectedScopeStats.life / selectedScopeStats.total) * 100 : 0),
    [selectedScopeStats],
  );
  const selectedGeneralShare = useMemo(
    () => (selectedScopeStats.total ? (selectedScopeStats.general / selectedScopeStats.total) * 100 : 0),
    [selectedScopeStats],
  );
  const selectedTargetShare = useMemo(
    () => (selectedScopeStats.total ? (selectedScopeStats.target / selectedScopeStats.total) * 100 : 0),
    [selectedScopeStats],
  );
  const selectedYtShare = useMemo(
    () => (selectedScopeStats.total ? (selectedScopeStats.yt / selectedScopeStats.total) * 100 : 0),
    [selectedScopeStats],
  );
  const selectedMfShare = useMemo(
    () => (selectedScopeStats.total ? (selectedScopeStats.mf / selectedScopeStats.total) * 100 : 0),
    [selectedScopeStats],
  );

  const selectedTileLabel = useMemo(
    () => areaTiles.find((item) => item.key === selectedTile)?.label || "",
    [areaTiles, selectedTile],
  );

  const atlasMode = !selectedTile && !browseAll && !query.trim();

  const atlasGrandTotal = sourceScopedVoters.length;

  function goHome() {
    setSelectedTile("");
    setBrowseAll(false);
    setQuery("");
    setExactHouseNoFilter("");
  }

  useEffect(() => {
    if (selectedTile && !areaTiles.some((item) => item.key === selectedTile)) {
      setSelectedTile("");
    }
  }, [areaTiles, selectedTile]);

  useEffect(() => { setVisibleCount(120); }, [selectedTile, query, source]);

  useEffect(() => {
    const onScroll = () => setShowJumpSearch(window.scrollY > 320);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = selected || showAreaMgr || showDeceasedMgr || showBlocklistMgr || showCancelledMgr || showFamilyMgr || showAreaStats ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [selected, showAreaMgr, showDeceasedMgr, showBlocklistMgr, showCancelledMgr, showFamilyMgr, showAreaStats]);

  // Enhancement #2 — Escape key closes any open modal
  useEffect(() => {
    if (!selected) return;
    function onKey(e: KeyboardEvent) { if (e.key === "Escape") closeModal(); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [selected]);

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
  }, [filteredVoters.length, visibleCount]);

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
          {error && <p className="error">{error}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="appShell">
      <div className="stickyZone" ref={stickyZoneRef}>
      <header className="topbar" ref={topbarRef}>
        <div className="brandBlock brandInline">
          <img src="/if-logo-full.png" alt="Islamic Front" className="brandLogo" />
          <div className="heroCopy">
            <strong>{t.brand}</strong>
            <p>{t.premium}</p>
          </div>
        </div>
        <div className="topbarStats">
          <button
            type="button"
            className={`statChip statChipIfp${partyFilter === "ifp" ? " isActiveFilter" : ""}`}
            onClick={() => setPartyFilter(prev => prev === "ifp" ? null : "ifp")}
            aria-pressed={partyFilter === "ifp"}
            title={t.ifpOnly}
          >
            <span>IFP</span>
            <strong key={`i-${areaBaseStats.ifp}`} className="popped">{formatCount(areaBaseStats.ifp)}</strong>
          </button>
          <button
            type="button"
            className={`statChip statChipTarget${partyFilter === "target" ? " isActiveFilter" : ""}`}
            onClick={() => setPartyFilter(prev => prev === "target" ? null : "target")}
            aria-pressed={partyFilter === "target"}
            title={t.targetCore}
          >
            <span>T</span>
            <strong key={`t-${areaBaseStats.target}`} className="popped">{formatCount(areaBaseStats.target)}</strong>
          </button>
          <button
            type="button"
            className={`statChip statChipYt${partyFilter === "yt" ? " isActiveFilter" : ""}`}
            onClick={() => setPartyFilter(prev => prev === "yt" ? null : "yt")}
            aria-pressed={partyFilter === "yt"}
            title={t.ytCore}
          >
            <span>YT</span>
            <strong key={`y-${areaBaseStats.yt}`} className="popped">{formatCount(areaBaseStats.yt)}</strong>
          </button>
          <button
            type="button"
            className={`statChip statChipMf${partyFilter === "mf" ? " isActiveFilter" : ""}`}
            onClick={() => setPartyFilter(prev => prev === "mf" ? null : "mf")}
            aria-pressed={partyFilter === "mf"}
            title={t.mfCore}
          >
            <span>MF</span>
            <strong key={`m-${areaBaseStats.mf}`} className="popped">{formatCount(areaBaseStats.mf)}</strong>
          </button>
          <span className="topbarDivider" aria-hidden="true" />
          <button type="button" className="statChip statChipFamily" onClick={() => setShowFamilyMgr(true)} title={t.familyOpen}>
            <span>{t.familyVoting}</span>
            <strong key={`f-${familyClusters.length}`} className="popped">{formatCount(familyClusters.length)}</strong>
          </button>
          <button type="button" className="statChip statChipDeceased" onClick={() => setShowDeceasedMgr(true)}>
            <span>{lang === "te" ? "మరణించినవారు" : "Deceased"}</span>
            <strong key={"d-" + deceasedVoters.length} className="popped">{formatCount(deceasedVoters.length)}</strong>
          </button>
          <button type="button" className="statChip statChipBlock" onClick={() => setShowBlocklistMgr(true)}>
            <span>{lang === "te" ? "బ్లాక్ లిస్ట్" : "Block List"}</span>
            <strong key={"b-" + blocklistedVoters.length} className="popped">{formatCount(blocklistedVoters.length)}</strong>
          </button>
          <button type="button" className="statChip statChipCancelled" onClick={() => setShowCancelledMgr(true)}>
            <span>{lang === "te" ? "రద్దు జాబితా" : "Cancelled"}</span>
            <strong key={"c-" + cancelledVoters.length} className="popped">{formatCount(cancelledVoters.length)}</strong>
          </button>
        </div>
        <div className="actions">
          <label className="ghostBtn uploadIconBtn" title={t.upload} aria-label={t.upload}>
            {busy ? "⏳" : "⬆"}
            <input type="file" accept="application/pdf" style={{ display: "none" }} onChange={(event) => upload(event.target.files?.[0] || null)} />
          </label>
          <button type="button" className="ghostBtn" onClick={() => { setShowAreaMgr(true); void loadRawAreas(); }}>
            {t.manageAreas}
          </button>
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
      </header>

      <div className="filterBar">
        <div className="filterCatGroup">
          <button type="button" className={source === "all" ? "filterPill active" : "filterPill"} onClick={() => { setSource("all"); setSelectedTile(""); setExactHouseNoFilter(""); }}>
            {t.allPdfs}
          </button>
          {SOURCE_ORDER.filter((s) => s !== "all").map((item) => (
            <button key={item} type="button" className={source === item ? "filterPill active" : "filterPill"} onClick={() => { setSource(source === item ? "all" : item); setSelectedTile(""); setExactHouseNoFilter(""); }}>
              {sourceLabel(item, t)}
            </button>
          ))}
        </div>
        <div className="filterBarDivider" aria-hidden="true" />
        <input
          ref={searchRef}
          className="filterBarSearch"
          value={query}
          onChange={(event) => {
            const nextValue = event.target.value;
            if (exactHouseNoFilter && normalizeHouseNo(nextValue) !== exactHouseNoFilter) {
              setExactHouseNoFilter("");
            }
            setQuery(nextValue);
          }}
          placeholder={t.search}
        />
        <div className="exportBtnGroup">
          <button
            type="button"
            className="exportCompactBtn"
            title={selectedTile ? t.exportArea : t.exportAll}
            onClick={() => {
              const tile = AREA_TILES.find((tile) => tile.key === selectedTile);
              downloadCsv(tile?.aliases[0]);
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
              const suffix = partyFilter === "target" ? " T" : partyFilter === "yt" ? " YT" : partyFilter === "mf" ? " MF" : partyFilter === "ifp" ? " IFP" : "";
              void downloadPdf(base + suffix);
            }}
          >
            {pdfBusy ? "⏳" : "↓ PDF"}
          </button>
        </div>
        <button type="button" className="ghostBtn filterStatsBtn" onClick={() => setShowAreaStats(true)}>
          {lang === "te" ? "📊 ప్రాంత లెక్కలు" : "📊 Area Stats"}
        </button>
      </div>{/* /filterBar */}
      <div className="summaryMetricsWrap">
        <div className="summaryMetricsViewRow">
          {!atlasMode && (
            <button type="button" className="summaryBackBtn" onClick={goHome}>
              ← {lang === "te" ? "అన్ని ప్రాంతాలు" : "All areas"}
            </button>
          )}
          <span className="summaryViewLabel">{t.currentView}</span>
          <strong className="summaryViewVal">{atlasMode ? (lang === "te" ? "ప్రాంతాల పటం" : "Area atlas") : selectedTileLabel || t.all}</strong>
          {partyFilter === "ifp" ? <span className="summaryModeChip">{t.ifpOnly}</span> : null}
          {partyFilter === "target" ? <span className="summaryModeChip">{t.targetCore}</span> : null}
          {partyFilter === "yt" ? <span className="summaryModeChip">{t.ytCore}</span> : null}
          {partyFilter === "mf" ? <span className="summaryModeChip">{t.mfCore}</span> : null}
          {atlasMode && (
            <button type="button" className="atlasAllBtn" onClick={() => setBrowseAll(true)}>
              {t.all} · {formatCount(atlasGrandTotal)} →
            </button>
          )}
        </div>
        <div className="summaryMetrics">
          <article className="summaryMetricCard metricTotal">
            <span>{t.total}</span>
            <strong>{formatCount(selectedScopeStats.total)}</strong>
            <small>{selectedTileLabel || t.all}</small>
          </article>
          <article className="summaryMetricCard metricLife">
            <span>{t.lifeCount}</span>
            <strong>{formatCount(selectedScopeStats.life)}</strong>
            <small>{formatPercent(selectedLifeShare, lang)}</small>
          </article>
          <article className="summaryMetricCard metricGeneral">
            <span>{t.generalCount}</span>
            <strong>{formatCount(selectedScopeStats.general)}</strong>
            <small>{formatPercent(selectedGeneralShare, lang)}</small>
          </article>
          <article className="summaryMetricCard metricIfp">
            <span>{t.ifpCount}</span>
            <strong>{formatCount(selectedScopeStats.ifp)}</strong>
            <small>{formatPercent(selectedIfpShare, lang)}</small>
          </article>
          <article className="summaryMetricCard metricTarget summaryMetricCompact">
            <span>T</span>
            <strong>{formatCount(selectedScopeStats.target)}</strong>
            <small>{formatPercent(selectedTargetShare, lang)}</small>
          </article>
          <article className="summaryMetricCard metricYt summaryMetricCompact">
            <span>YT</span>
            <strong>{formatCount(selectedScopeStats.yt)}</strong>
            <small>{formatPercent(selectedYtShare, lang)}</small>
          </article>
          <article className="summaryMetricCard metricMf summaryMetricCompact">
            <span>MF</span>
            <strong>{formatCount(selectedScopeStats.mf)}</strong>
            <small>{formatPercent(selectedMfShare, lang)}</small>
          </article>
        </div>
      </div>
      </div>{/* /stickyZone */}
      {error && <p className="error" style={{ width: "100%", margin: "0 0 12px", padding: "0 var(--page-gutter)" }}>{error}</p>}

      <section className="layout">
        <section className="content">

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
          {atlasMode && !(votersLoading && allVoters.length === 0) && (
            <div className="atlasWrap">
              <div className="atlasGrid">
                {areaTiles
                  .filter((tile) => tile.total > 0)
                  .map((tile) => {
                    const share = tile.total ? Math.round((tile.ifp / tile.total) * 100) : 0;
                    return (
                      <button key={tile.key} type="button" className="atlasTile" onClick={() => { setSelectedTile(tile.key); setExactHouseNoFilter(""); }}>
                        <span className="atlasName">{tile.label}</span>
                        <strong className="atlasTotal">{formatCount(tile.total)}</strong>
                        <span className="atlasIfp">IFP {formatCount(tile.ifp)} · {share}%</span>
                        <span className="atlasBarTrack"><span className="atlasBarFill" style={{ width: `${share}%` }} /></span>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
          {!atlasMode && !votersLoading && filteredVoters.length === 0 && (
            <p className="noSelectionHint">{t.noVoters}</p>
          )}
          {!atlasMode && (
          <div className="voterGrid">
            {filteredVoters.slice(0, visibleCount).map((voter, index) => (
              <article
                className={`voterCard${voter.is_ifp_voter ? " ifpMarked" : ""}${voter.is_yt_voter ? " ytMarked" : ""}${voter.is_target ? " targetMarked" : ""}${voter.is_mf_voter ? " mfMarked" : ""}`}
                key={voter.id}
                style={index < 40 ? { animationDelay: `${index * 0.03}s` } : { animation: "none" }}
              >
                <div className="photoCol">
                  <SecureImage path={voter.photo_url} token={token} alt={t.photo} />
                  <div className="photoBadges">
                    <span className={voter.source_kind === "life" ? "sourceBadge sourceLife" : "sourceBadge sourceGeneral"}>
                      {voter.source_badge}
                    </span>
                    {voter.is_target ? <span className="miniTag miniTagTarget">T</span> : null}
                    {voter.is_yt_voter ? <span className="miniTag miniTagYt">YT</span> : null}
                    {voter.is_mf_voter ? <span className="miniTag miniTagMf">MF</span> : null}
                    {voter.is_ifp_voter ? <span className="miniTag miniTagIfp">IFP</span> : null}
                  </div>
                </div>
                <div>
                  <div className="voterTitleRow">
                    <h3 className="ddCompact" style={{ fontSize: nameFontSize(displayName(voter, lang, t.missingName), lang) }}>{displayName(voter, lang, t.missingName)}</h3>
                  </div>
                  <p className="relationRow">
                    <strong>{t.relation}: </strong>
                    <span className="ddCompact" style={{ fontSize: compactFieldFontSize(displayRelation(voter.relation_name_te || "", lang)) }}>
                      {displayRelation(voter.relation_name_te || "", lang)}
                    </span>
                  </p>
                  <dl>
                    <dt>{t.serial}</dt>
                    <dd>{voter.serial_no || "-"}</dd>
                    <dt>{t.age}</dt>
                    <dd>{voter.age || "-"}</dd>
                    <dt className="dtHouse">{t.house}</dt>
                    <dd className="ddCompact" style={{ fontSize: compactFieldFontSize(voter.house_no || "-") }}>{voter.house_no || "-"}</dd>
                    <dt>{t.area}</dt>
                    <dd className="ddCompact" style={{ fontSize: compactFieldFontSize(displayArea(voter, lang)) }}>{displayArea(voter, lang)}</dd>
                  </dl>
                  {voter.notes && <p className="note">{voter.notes}</p>}
                </div>
                <div className="cardActions">
                    <button
                      type="button"
                      className={`targetBtn${voter.is_target ? " active" : ""}`}
                      aria-pressed={Boolean(voter.is_target)}
                      disabled={targetBusyId === voter.id}
                      onClick={() => void toggleTargetVoter(voter)}
                    >
                      {targetBusyId === voter.id ? "..." : voter.is_target ? "★ T" : "☆ T"}
                    </button>
                    <button
                      type="button"
                      className={`ytBtn${voter.is_yt_voter ? " active" : ""}`}
                      aria-pressed={Boolean(voter.is_yt_voter)}
                      disabled={ytBusyId === voter.id}
                      onClick={() => void toggleYtVoter(voter)}
                    >
                      {ytBusyId === voter.id ? "..." : voter.is_yt_voter ? "★ YT" : "☆ YT"}
                    </button>
                    <button
                      type="button"
                      className={`mfBtn${voter.is_mf_voter ? " active" : ""}`}
                      aria-pressed={Boolean(voter.is_mf_voter)}
                      disabled={mfBusyId === voter.id}
                      onClick={() => void toggleMfVoter(voter)}
                    >
                      {mfBusyId === voter.id ? "..." : voter.is_mf_voter ? "★ MF" : "☆ MF"}
                    </button>
                    <button type="button" onClick={() => setSelected(voter)}>
                      {t.open}
                    </button>
                    <button
                      type="button"
                      className={`ifpBtn${voter.is_ifp_voter ? " active" : ""}`}
                      aria-pressed={Boolean(voter.is_ifp_voter)}
                      disabled={ifpBusyId === voter.id}
                      onClick={() => void toggleIfpVoter(voter)}
                    >
                      {ifpBusyId === voter.id ? "..." : voter.is_ifp_voter ? t.ifpAction : "☆ IFP"}
                    </button>
                </div>
              </article>
            ))}
          </div>
          )}
          {/* Enhancement #8 — infinite scroll sentinel */}
          {!atlasMode && <div ref={sentinelRef} className="scrollSentinel" aria-hidden="true" />}

          {showJumpSearch && (
            <button
              type="button"
              className="jumpSearchBtn"
              aria-label={lang === "te" ? "వెతుకుడు పైన ఉంది — పైకి వెళ్లండి" : "Jump to search"}
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
                searchRef.current?.focus({ preventScroll: true });
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" />
              </svg>
            </button>
          )}

        </section>
      </section>

      {selected && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="voter-title" onClick={closeModal}>
          <section className="reviewPanel" onClick={(event) => event.stopPropagation()}>
            <div className="modalHeader">
              <div>
                <h2 id="voter-title">{displayName(selected, lang, t.missingName)}</h2>
                <p>{displayArea(selected, lang)}</p>
              </div>
              <button type="button" className="close" onClick={closeModal} aria-label={t.close}>
                ×
              </button>
            </div>
            <div className="reviewGrid">
              <div>
                <SecureImage path={selected.card_url} token={token} alt={t.card} />
              </div>
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
                      {lang === "en" && key === "relation_name_te" && selected.relation_name_te ? <small className="fieldPreview">{t.englishPreview}: {displayRelation(selected.relation_name_te, "en")}</small> : null}
                      {lang === "en" && key === "occupation_te" && selected.occupation_te ? <small className="fieldPreview">{t.englishPreview}: {displayOccupation(selected.occupation_te, "en")}</small> : null}
                    </label>
                  ))}
                </details>

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
                  {lang === "en" && selected.area_te ? <small className="fieldPreview">{t.englishPreview}: {displayArea(selected, "en")}</small> : null}
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
                    <summary>{lang === "te" ? "⚠ ఇతర చర్యలు" : "⚠ Other actions"}</summary>
                    <button type="button" className="secondary dangerGhost" style={{ marginTop: "8px" }} disabled={busy}
                      onClick={() => void markAndSave({ is_deceased: true, is_blocklisted: false, is_cancelled: false, is_ifp_voter: false, is_yt_voter: false, is_target: false, is_mf_voter: false })}>
                      {t.markDeceased}
                    </button>
                    <button type="button" className="secondary dangerGhost" style={{ marginTop: "8px" }} disabled={busy}
                      onClick={() => void markAndSave({ is_deceased: false, is_blocklisted: true, is_cancelled: false, is_ifp_voter: false, is_yt_voter: false, is_target: false, is_mf_voter: false })}>
                      {t.markBlocklist}
                    </button>
                    <button type="button" className="secondary dangerGhost" style={{ marginTop: "8px" }} disabled={busy}
                      onClick={() => void markAndSave({ is_deceased: false, is_blocklisted: false, is_cancelled: true, is_ifp_voter: false, is_yt_voter: false, is_target: false, is_mf_voter: false })}>
                      {t.markCancelled}
                    </button>
                  </details>
                )}

                {selected.notes && <p className="note">{selected.notes}</p>}
                <div className="modalFooter">
                  <button type="submit" className="primary">{t.save}</button>
                  <button type="button" className="secondary" onClick={closeModal}>{t.close}</button>
                </div>
              </form>
            </div>
          </section>
        </div>
      )}

      {showAreaMgr && (
        <div className="modal" role="dialog" aria-modal="true" aria-label={t.manageAreas} onClick={() => setShowAreaMgr(false)}>
          <section className="areaMgrPanel" onClick={(event) => event.stopPropagation()}>
            <div className="modalHeader">
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
              {error && <p className="error" style={{ marginTop: "12px" }}>{error}</p>}
            </div>
          </section>
        </div>
      )}

      {showDeceasedMgr && (
        <div className="modal" role="dialog" aria-modal="true" aria-label={lang === "te" ? "మరణించిన ఓటర్లు" : "Deceased Voters"} onClick={() => setShowDeceasedMgr(false)}>
          <section className="areaMgrPanel" onClick={(event) => event.stopPropagation()}>
            <div className="modalHeader">
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
                              setError(String(err));
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
          <section className="areaMgrPanel" onClick={(event) => event.stopPropagation()}>
            <div className="modalHeader">
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
                              setError(String(err));
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
          <section className="areaMgrPanel" onClick={(event) => event.stopPropagation()}>
            <div className="modalHeader">
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
                              setError(String(err));
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
          <section className="areaMgrPanel familyPanel" onClick={(event) => event.stopPropagation()}>
            <div className="modalHeader">
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
          <section className="areaMgrPanel areaStatsPanel" onClick={(e) => e.stopPropagation()}>
            <div className="modalHeader">
              <strong>{t.areaStats}</strong>
              <span className="modalCount">{sidebarAreaStats.length}</span>
              <button type="button" className="ghostBtn" onClick={() => setShowAreaStats(false)}>✕</button>
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
    </main>
  );
}
