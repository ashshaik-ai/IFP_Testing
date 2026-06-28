"use client";

import { useEffect, useMemo, useState } from "react";
import { API_BASE, Area, AreaOption, Job, Lang, SourceFilter, Voter, api, copy } from "@/lib/api";
import { SecureImage } from "@/components/SecureImage";

type MergeResult = {
  from_area_te: string;
  to_area_te: string;
  moved_count: number;
  areas: Area[];
};

type ScopeStats = {
  total: number;
  life: number;
  general: number;
};

const SOURCE_ORDER: SourceFilter[] = ["all", "life", "general"];

export default function Home() {
  const [lang, setLang] = useState<Lang>("te");
  const t = copy[lang];
  const [token, setToken] = useState("");
  const [code, setCode] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [jobId, setJobId] = useState<string>("all");
  const [areas, setAreas] = useState<Area[]>([]);
  const [areaOptions, setAreaOptions] = useState<AreaOption[]>([]);
  const [area, setArea] = useState("");
  const [areaQuery, setAreaQuery] = useState("");
  const [mergeTarget, setMergeTarget] = useState("");
  const [source, setSource] = useState<SourceFilter>("all");
  const [query, setQuery] = useState("");
  const [voters, setVoters] = useState<Voter[]>([]);
  const [statsVoters, setStatsVoters] = useState<Voter[]>([]);
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
    refreshJobs();
    loadAreaOptions();
    const timer = setInterval(refreshJobs, 4000);
    return () => clearInterval(timer);
  }, [token]);

  useEffect(() => {
    if (!token) {
      return;
    }
    loadAreas();
    loadVoters();
  }, [token, jobId, area, query, source]);

  useEffect(() => {
    if (!token) {
      return;
    }
    loadStatsVoters();
  }, [token, jobId]);

  useEffect(() => {
    setMergeTarget("");
  }, [area]);

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

  function sourceParams(includeArea = true) {
    const params = new URLSearchParams();
    if (query) {
      params.set("q", query);
    }
    if (includeArea && area) {
      params.set("area", area);
    }
    if (source !== "all") {
      params.set("source", source);
    }
    return params.toString();
  }

  async function loadAreas() {
    setAreas(await api<Area[]>(`${currentBasePath()}/areas`, token));
  }

  async function loadVoters() {
    const qs = sourceParams();
    setVoters(await api<Voter[]>(`${currentBasePath()}/voters${qs ? `?${qs}` : ""}`, token));
  }

  async function loadStatsVoters() {
    setStatsVoters(await api<Voter[]>(`${currentBasePath()}/voters`, token));
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
      await loadStatsVoters();
      await loadAreas();
      await loadVoters();
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
      await loadStatsVoters();
      await loadVoters();
      await loadAreas();
    } catch (err) {
      setError(String(err));
    } finally {
      setBusy(false);
    }
  }

  async function mergeArea() {
    if (jobId === "all" || !area || !mergeTarget || area === mergeTarget) {
      return;
    }
    setBusy(true);
    setError("");
    try {
      const result = await api<MergeResult>(`/api/jobs/${jobId}/areas/merge`, token, {
        method: "POST",
        body: JSON.stringify({ from_area_te: area, to_area_te: mergeTarget }),
      });
      setAreas(result.areas);
      setArea(mergeTarget);
      setMergeTarget("");
      await loadStatsVoters();
      await loadVoters();
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

  function sourceLabel(kind: SourceFilter | "life" | "general") {
    if (kind === "life") {
      return t.sourceLife;
    }
    if (kind === "general") {
      return t.sourceGeneral;
    }
    return t.all;
  }

  const currentJob = useMemo(() => jobs.find((item) => item.id === jobId) || null, [jobs, jobId]);
  const mergeChoices = areaOptions.filter((item) => item.area_te !== area);

  const filteredAreas = useMemo(() => {
    const needle = areaQuery.trim().toLowerCase();
    if (!needle) {
      return areas;
    }
    return areas.filter((item) => item.area_te.toLowerCase().includes(needle));
  }, [areaQuery, areas]);

  const areaStatMap = useMemo(() => {
    const map = new Map<string, ScopeStats>();
    for (const voter of statsVoters) {
      const key = voter.area_te || "ఇతర ప్రాంతం";
      const current = map.get(key) || { total: 0, life: 0, general: 0 };
      current.total += 1;
      if (voter.source_kind === "life") {
        current.life += 1;
      } else {
        current.general += 1;
      }
      map.set(key, current);
    }
    return map;
  }, [statsVoters]);

  const selectedScopeStats = useMemo(() => {
    const pool = area ? statsVoters.filter((item) => item.area_te === area) : statsVoters;
    return pool.reduce<ScopeStats>(
      (acc, item) => {
        acc.total += 1;
        if (item.source_kind === "life") {
          acc.life += 1;
        } else {
          acc.general += 1;
        }
        return acc;
      },
      { total: 0, life: 0, general: 0 },
    );
  }, [area, statsVoters]);

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
              <small>{area ? t.selectedArea : t.overview}</small>
              <strong>{area || t.all}</strong>
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
              setArea("");
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
                setArea("");
              }}
            >
              <span>{item.filename}</span>
              <small>{sourceLabel(item.source_kind)}</small>
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
                {sourceLabel(item)}
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
          <button type="button" className={!area ? "area active" : "area"} onClick={() => setArea("")}>
            <span>{t.all}</span>
            <small>
              {statsVoters.length} · {selectedScopeStats.life}/{selectedScopeStats.general}
            </small>
          </button>
          {filteredAreas.map((item) => {
            const stat = areaStatMap.get(item.area_te) || { total: item.count, life: 0, general: 0 };
            return (
              <button
                type="button"
                key={item.area_te}
                className={item.area_te === area ? "area active" : "area"}
                onClick={() => setArea(item.area_te)}
              >
                <span>{item.area_te}</span>
                <small>
                  {stat.total} · {t.sourceLife} {stat.life} · {t.sourceGeneral} {stat.general}
                </small>
              </button>
            );
          })}
        </aside>

        <section className="content">
          <div className="toolbar">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.search} />
            <button type="button" onClick={() => downloadCsv()}>
              {t.exportAll}
            </button>
            {area && (
              <button type="button" onClick={() => downloadCsv(area)}>
                {t.exportArea}
              </button>
            )}
          </div>

          {area && jobId !== "all" && (
            <div className="mergeBar">
              <div>
                <strong>{area}</strong>
                <span>
                  {t.areaBreakdown}: {selectedScopeStats.life} / {selectedScopeStats.general}
                </span>
              </div>
              <select value={mergeTarget} onChange={(event) => setMergeTarget(event.target.value)}>
                <option value="">{t.mergeTarget}</option>
                {mergeChoices.map((item) => (
                  <option key={item.area_te} value={item.area_te}>
                    {item.area_te}
                  </option>
                ))}
              </select>
              <button type="button" onClick={mergeArea} disabled={!mergeTarget || busy}>
                {t.mergeAction}
              </button>
            </div>
          )}

          <div className="voterGrid">
            {voters.map((voter) => (
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
        <div
          className="modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="voter-title"
          onClick={() => setSelected(null)}
        >
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
                  saveSelected();
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
                      const nextArea = event.target.value;
                      setSelected({
                        ...selected,
                        area_te: nextArea,
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
