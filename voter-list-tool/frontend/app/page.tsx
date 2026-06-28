"use client";

import { useEffect, useMemo, useState } from "react";
import { API_BASE, AreaOption, Job, Lang, SourceFilter, Voter, api, copy } from "@/lib/api";
import { SecureImage } from "@/components/SecureImage";

type ScopeStats = {
  total: number;
  life: number;
  general: number;
  missing: number;
};

type AreaTile = {
  key: string;
  label: string;
  aliases: string[];
  aliasSet: Set<string>;
};

const SOURCE_ORDER: SourceFilter[] = ["all", "life", "general"];
const CRITICAL_FIELDS: Array<keyof Voter> = ["serial_no", "name_te", "relation_name_te", "age", "occupation_te", "house_no", "area_te"];

const AREA_TILE_DEFS: Array<{ label: string; aliases: string[] }> = [
  { label: "13th Ward", aliases: ["ఇస్రాంపేట", "ఇస్లాంపేట", "చినపంజా వీధి", "తెనాలిరోడ్", "మసీదు వీధి", "చిన్న పంజా వీధి", "పెదకోనేరు వీధి", "కోనేరు వీధి", "గోపాలకృష్ణ హాల్ దగ్గర"] },
  { label: "Kothapeta", aliases: ["కొత్త పేట", "కొత్తపేట", "కీ త్త పేట", "కో త్ర పేట"] },
  { label: "Tipparla Bazar", aliases: ["టిప్పర్ల బజార్", "టిప్పర్లబజార్", "టీప్పర్లబజార్", "సీతారామాంజనేయ పేట", "సీతారామాంజనేయపేట", "న్యూ బ్వాంక్ కాలనీ", "టి, బజారు", "టి.బజారు"] },
  { label: "Manneam Vari Street", aliases: ["మార్కండేయ కాలనీ", "మార్కండేయకాలని", "మన్నెం వారి వీధి", "జెండా చెట్టు"] },
  { label: "Old Mangalagiri", aliases: ["పాతమంగళగిరి", "ప్రాతమంగళగిరి", "సీతారామకోవెల", "పీర్లపంజా, పాతమంగళగిరి", "దిగుడు బావి సెంటర్", "దిగుడుబావి సెంటర్", "సీతారామ కోవెల సీట్"] },
  { label: "31st Ward", aliases: ["పార్కురోడ్", "శ్రీనివాస మహల్", "పార్క్రో డ్ర్", "పాతబస్థాండు", "పాత బ్వాంక్ కాలని", "పాతబస్టాండు", "బ్యాంక్ కాలని"] },
  { label: "Bapanaiah Nagar", aliases: ["బాపనయ్యనగర్", "అజయ్ నగర్"] },
  { label: "Rajiv Gruhakalpa", aliases: ["రాజీవ్ గృహకల్ప"] },
  { label: "Tidco House", aliases: ["టిడ్కో హౌస్"] },
  { label: "Ratnalacheruvu", aliases: ["రత్నాల చెబువు", "రత్నాల చెజువు", "శ్రామిక నగర్", "సూర్యనారాయణ నగర్"] },
  { label: "Bhagat Singh Nagar", aliases: ["భగత్సింగ్ నగర్"] },
  { label: "Kuppurao Colony", aliases: ["కుప్పురావు కాలనీ"] },
  { label: "Lakshmi Narasimha Colony", aliases: ["లక్ష్మీనరసింహస్వామి కాలని", "శ్రీలక్షీనరసింహస్వామి కాలని", "శ్రీలక్షీనరసింహస్వామి కాలనీ", "శ్రీలక్ష్మీనరసింహస్వామి కాలని"] },
  { label: "Driver Peta", aliases: ["డ్రైవర్ పేట", "డ్రైవరు పేట"] },
  { label: "Munagala Vari Veedhi", aliases: ["మునగాల వారి వీధి"] },
  { label: "TTD", aliases: ["గండాలయ పేట", "టిటిడి కళ్యాణమండపం", "టిటిడి కల్యాణ మండపం", "ద్వారకానగర్"] },
  { label: "Shahi Masjid", aliases: ["పోలేరమ్మ వీధి", "ఇందిరానగర్"] },
  { label: "Best India", aliases: ["యలమందల వారి వీధి", "ఎల్.బి. నగర్", "భార్గవ పేట"] },
  { label: "Mangalagiri Mix", aliases: ["మంగళగిరి"] },
];

const AREA_TILES: AreaTile[] = AREA_TILE_DEFS.map((item) => ({
  key: item.label.toLowerCase(),
  label: item.label,
  aliases: item.aliases,
  aliasSet: new Set(item.aliases),
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

function sourceLabel(kind: SourceFilter | "life" | "general", t: (typeof copy)["te"] | (typeof copy)["en"]) {
  if (kind === "life") {
    return t.sourceLife;
  }
  if (kind === "general") {
    return t.sourceGeneral;
  }
  return t.all;
}

export default function Home() {
  const [lang, setLang] = useState<Lang>("te");
  const t = copy[lang];
  const [token, setToken] = useState("");
  const [code, setCode] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobId, setJobId] = useState<string>("all");
  const [areaOptions, setAreaOptions] = useState<AreaOption[]>([]);
  const [selectedTile, setSelectedTile] = useState("");
  const [areaQuery, setAreaQuery] = useState("");
  const [source, setSource] = useState<SourceFilter>("all");
  const [query, setQuery] = useState("");
  const [allVoters, setAllVoters] = useState<Voter[]>([]);
  const [selected, setSelected] = useState<Voter | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

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
    if (!token) {
      return;
    }
    void refreshJobs();
    void loadAreaOptions();
    const timer = setInterval(() => void refreshJobs(), 4000);
    return () => clearInterval(timer);
  }, [token]);

  useEffect(() => {
    if (!token) {
      return;
    }
    void loadAllVoters();
  }, [token, jobId]);

  async function login() {
    setError("");
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (!res.ok) {
      setError(lang === "te" ? "ప్రవేశ కోడ్ సరైనది కాదు" : "Access code is invalid");
      return;
    }
    const data = await res.json();
    localStorage.setItem("voter-token", data.token);
    setToken(data.token);
  }

  async function refreshJobs() {
    try {
      const data = await api<Job[]>("/api/jobs", token);
      setJobs(data);
    } catch {
      localStorage.removeItem("voter-token");
      setToken("");
    }
  }

  async function loadAreaOptions() {
    setAreaOptions(await api<AreaOption[]>("/api/area-options", token));
  }

  function currentBasePath() {
    return jobId === "all" ? "/api" : `/api/jobs/${jobId}`;
  }

  async function loadAllVoters() {
    setAllVoters(await api<Voter[]>(`${currentBasePath()}/voters`, token));
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
      const saved = await api<Voter>(`/api/jobs/${selected.job_id}/voters/${selected.id}`, token, {
        method: "PATCH",
        body: JSON.stringify({
          serial_no: selected.serial_no,
          name_te: selected.name_te,
          name_en: selected.name_en,
          relation_name_te: selected.relation_name_te,
          age: selected.age,
          occupation_te: selected.occupation_te,
          house_no: selected.house_no,
          area_te: selected.area_te,
          notes: selected.notes,
        }),
      });
      setSelected(saved);
      await loadAllVoters();
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

  const currentJob = useMemo(() => jobs.find((item) => item.id === jobId) || null, [jobs, jobId]);

  const areaTiles = useMemo(() => {
    const tileMap = new Map<string, ScopeStats & { label: string; aliases: string[] }>(
      AREA_TILES.map((tile) => [
        tile.key,
        { label: tile.label, aliases: tile.aliases, total: 0, life: 0, general: 0, missing: 0 },
      ]),
    );
    for (const voter of allVoters) {
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
      if (voter.source_kind === "life") {
        current.life += 1;
      } else {
        current.general += 1;
      }
      tileMap.set(tile.key, current);
    }
    return Array.from(tileMap.entries())
      .map(([key, value]) => ({ key, ...value }))
      .sort((a, b) => AREA_TILES.findIndex((tile) => tile.key === a.key) - AREA_TILES.findIndex((tile) => tile.key === b.key));
  }, [allVoters]);

  const visibleAreaTiles = useMemo(() => {
    const needle = areaQuery.trim().toLowerCase();
    if (!needle) {
      return areaTiles;
    }
    return areaTiles.filter((tile) =>
      [tile.label, ...tile.aliases]
        .join(" ")
        .toLowerCase()
        .includes(needle),
    );
  }, [areaQuery, areaTiles]);

  const filteredVoters = useMemo(() => {
    return allVoters.filter((voter) => {
      const tile = getAreaTile(voter);
      if (selectedTile && tile?.key !== selectedTile) {
        return false;
      }
      if (source !== "all" && voter.source_kind !== source) {
        return false;
      }
      return voterMatchesQuery(voter, query);
    });
  }, [allVoters, query, selectedTile, source]);

  const selectedScopeStats = useMemo(() => {
    const pool = selectedTile ? allVoters.filter((item) => getAreaTile(item)?.key === selectedTile) : allVoters;
    return pool.reduce<ScopeStats>(
      (acc, item) => {
        acc.total += 1;
        acc.missing += voterMissingCount(item) > 0 ? 1 : 0;
        if (item.source_kind === "life") {
          acc.life += 1;
        } else {
          acc.general += 1;
        }
        return acc;
      },
      { total: 0, life: 0, general: 0, missing: 0 },
    );
  }, [allVoters, selectedTile]);

  const selectedTileLabel = useMemo(
    () => areaTiles.find((item) => item.key === selectedTile)?.label || "",
    [areaTiles, selectedTile],
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
          <label>
            {t.code}
            <input value={code} onChange={(event) => setCode(event.target.value)} type="password" />
          </label>
          <button type="button" className="primary" onClick={login}>
            {t.login}
          </button>
          {error && <p className="error">{error}</p>}
        </section>
      </main>
    );
  }

  return (
    <main className="appShell">
      <header className="topbar">
        <div className="brandBlock brandInline">
          <img src="/if-logo-full.png" alt="Islamic Front" className="brandLogo" />
          <div>
            <strong>{t.brand}</strong>
            <p>{t.premium}</p>
          </div>
        </div>
        <div className="heroCopy">
          <h1>{t.title}</h1>
          <p>{t.subtitle}</p>
        </div>
        <div className="actions">
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

      <section className="uploadBand">
        <label className="uploadBox">
          <span>{busy ? "అప్లోడ్..." : t.upload}</span>
          <input type="file" accept="application/pdf" onChange={(event) => upload(event.target.files?.[0] || null)} />
        </label>
        <div className="statusCard">
          <strong>{jobId === "all" ? t.allPdfs : currentJob?.filename || t.allPdfs}</strong>
          <span>{jobId === "all" ? `${jobs.length} ${t.jobs}` : currentJob?.message_te || ""}</span>
          <div className="statusStats" aria-label={t.overview}>
            <div className="statPill">
              <small>{selectedTile ? t.selectedArea : t.overview}</small>
              <strong>{selectedTileLabel || t.all}</strong>
            </div>
            <div className="statPill">
              <small>{t.total}</small>
              <strong>{selectedScopeStats.total}</strong>
            </div>
            <div className="statPill life">
              <small>{t.lifeCount}</small>
              <strong>{selectedScopeStats.life}</strong>
            </div>
            <div className="statPill general">
              <small>{t.generalCount}</small>
              <strong>{selectedScopeStats.general}</strong>
            </div>
          </div>
        </div>
        {error && <p className="error">{error}</p>}
      </section>

      <section className="layout">
        <aside className="sidebar">
          <h2>{t.jobs}</h2>
          <button
            type="button"
            className={jobId === "all" ? "job active" : "job"}
            onClick={() => {
              setJobId("all");
              setSelectedTile("");
            }}
          >
            <span>{t.allPdfs}</span>
            <small>{jobs.length}</small>
          </button>
          {jobs.map((item) => (
            <button
              type="button"
              className={item.id === jobId ? "job active" : "job"}
              key={item.id}
              onClick={() => {
                setJobId(item.id);
                setSelectedTile("");
              }}
            >
              <span>{item.filename}</span>
              <small>{sourceLabel(item.source_kind, t)}</small>
            </button>
          ))}

          <h2>{t.source}</h2>
          <div className="sourceFilterStack">
            {SOURCE_ORDER.map((item) => (
              <button
                type="button"
                key={item}
                className={source === item ? "sourceChip active" : "sourceChip"}
                onClick={() => setSource(item)}
              >
                {sourceLabel(item, t)}
              </button>
            ))}
          </div>

          <h2>{t.areas}</h2>
          <input
            className="areaSearchInput"
            value={areaQuery}
            onChange={(event) => setAreaQuery(event.target.value)}
            placeholder={t.areaSearch}
          />
          <div className="areaList">
            <button type="button" className={!selectedTile ? "area active" : "area"} onClick={() => setSelectedTile("")}>
              <span>{t.all}</span>
              <small>
                {allVoters.length} · {t.sourceLife} {selectedScopeStats.life} · {t.sourceGeneral} {selectedScopeStats.general}
              </small>
            </button>
            {visibleAreaTiles.map((tile) => (
              <button
                type="button"
                key={tile.key}
                className={tile.key === selectedTile ? "area active" : "area"}
                onClick={() => setSelectedTile(tile.key)}
              >
                <span>{tile.label}</span>
                <small>
                  {tile.total} · {t.sourceLife} {tile.life} · {t.sourceGeneral} {tile.general}
                </small>
              </button>
            ))}
          </div>
        </aside>

        <section className="content">
          <div className="toolbar">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} />
            <button type="button" onClick={() => downloadCsv()}>
              {t.exportAll}
            </button>
          </div>

          <div className="selectionBand">
            <strong>{selectedTileLabel || t.all}</strong>
            <span>
              {t.total}: {filteredVoters.length} · {t.sourceLife} {filteredVoters.filter((item) => item.source_kind === "life").length} · {t.sourceGeneral} {filteredVoters.filter((item) => item.source_kind === "general").length}
            </span>
          </div>

          <div className="voterGrid">
            {filteredVoters.map((voter) => (
              <article className="voterCard" key={voter.id}>
                <div className="photoCol">
                  <SecureImage path={voter.photo_url} token={token} alt={t.photo} />
                  <span className={voter.source_kind === "life" ? "sourceBadge sourceLife" : "sourceBadge sourceGeneral"}>
                    {voter.source_badge}
                  </span>
                </div>
                <div>
                  <h3>{lang === "te" ? voter.name_te : voter.name_en || voter.name_te}</h3>
                  <p>
                    <strong>{t.relation}: </strong>
                    {voter.relation_name_te || "-"}
                  </p>
                  <dl>
                    <dt>{t.serial}</dt>
                    <dd>{voter.serial_no || "-"}</dd>
                    <dt>{t.age}</dt>
                    <dd>{voter.age || "-"}</dd>
                    <dt>{t.house}</dt>
                    <dd>{voter.house_no || "-"}</dd>
                    <dt>{t.area}</dt>
                    <dd>{voter.area_te || "-"}</dd>
                    <dt>{t.source}</dt>
                    <dd>{lang === "te" ? voter.source_label_te : voter.source_label_en}</dd>
                  </dl>
                  {voter.notes && <p className="note">{voter.notes}</p>}
                  <button type="button" onClick={() => setSelected(voter)}>
                    {t.open}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>

      {selected && (
        <div className="modal" role="dialog" aria-modal="true" aria-labelledby="voter-title" onClick={() => setSelected(null)}>
          <section className="reviewPanel" onClick={(event) => event.stopPropagation()}>
            <div className="modalHeader">
              <div>
                <h2 id="voter-title">{lang === "te" ? selected.name_te : selected.name_en || selected.name_te}</h2>
                <p>{selected.area_te || "-"}</p>
              </div>
              <button type="button" className="close" onClick={() => setSelected(null)} aria-label={t.close}>
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
                {[
                  ["serial_no", t.serial],
                  ["name_te", t.name],
                  ["name_en", t.englishName],
                  ["relation_name_te", t.relation],
                  ["age", t.age],
                  ["occupation_te", t.occupation],
                  ["house_no", t.house],
                ].map(([key, label]) => (
                  <label key={key}>
                    {label}
                    <input
                      value={String(selected[key as keyof Voter] || "")}
                      onChange={(event) => setSelected({ ...selected, [key]: event.target.value })}
                    />
                  </label>
                ))}

                <label>
                  {t.moveArea}
                  <select
                    value={selected.area_te}
                    onChange={(event) => {
                      setSelected({
                        ...selected,
                        area_te: event.target.value,
                      });
                    }}
                  >
                    {areaOptions.map((item) => (
                      <option key={item.area_te} value={item.area_te}>
                        {item.area_te}
                      </option>
                    ))}
                  </select>
                </label>

                {selected.notes && <p className="note">{selected.notes}</p>}
                <button type="submit" className="primary">
                  {t.save}
                </button>
              </form>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
