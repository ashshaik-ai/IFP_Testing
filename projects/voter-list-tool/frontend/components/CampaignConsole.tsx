"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, Campaign, CampaignMessage, Lang, Media, MessagingNumber } from "@/lib/api";
import { SecureImage } from "@/components/SecureImage";

type AreaOpt = { value: string; label: string };
type Props = { token: string; lang: Lang; areaOptions: AreaOpt[]; onClose: () => void };
type Tab = "compose" | "numbers" | "history";

function t(lang: Lang, te: string, en: string) {
  return lang === "te" ? te : en;
}

export function CampaignConsole({ token, lang, areaOptions, onClose }: Props) {
  const [tab, setTab] = useState<Tab>("compose");
  const [numbers, setNumbers] = useState<MessagingNumber[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [error, setError] = useState("");

  // compose form
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [mediaPath, setMediaPath] = useState("");
  const [mediaKind, setMediaKind] = useState<string>("");
  const [mediaId, setMediaId] = useState("");
  const [media, setMedia] = useState<Media[]>([]);
  const [scheduleAt, setScheduleAt] = useState("");
  const [segArea, setSegArea] = useState("");
  const [segSource, setSegSource] = useState("");
  const [segTag, setSegTag] = useState("");
  const [preview, setPreview] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  // add-number form
  const [nLabel, setNLabel] = useState("");
  const [nPhone, setNPhone] = useState("");
  const [nCap, setNCap] = useState(400);
  const [nWarm, setNWarm] = useState(30);

  // history drill-in
  const [openId, setOpenId] = useState("");
  const [messages, setMessages] = useState<CampaignMessage[]>([]);

  const loadNumbers = useCallback(async () => {
    try { setNumbers(await api<MessagingNumber[]>("/api/numbers", token)); }
    catch (e) { setError(String(e)); }
  }, [token]);

  const loadCampaigns = useCallback(async () => {
    try { setCampaigns(await api<Campaign[]>("/api/campaigns", token)); }
    catch (e) { setError(String(e)); }
  }, [token]);

  const loadMedia = useCallback(async () => {
    try { setMedia(await api<Media[]>("/api/media", token)); }
    catch (e) { setError(String(e)); }
  }, [token]);

  useEffect(() => { void loadNumbers(); void loadCampaigns(); void loadMedia(); }, [loadNumbers, loadCampaigns, loadMedia]);

  function selectMedia(m: Media) { setMediaId(m.id); setMediaPath(m.url); setMediaKind(m.kind); }
  function clearMedia() { setMediaId(""); setMediaPath(""); setMediaKind(""); }

  async function uploadMedia(file: File) {
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const up = await api<Media>("/api/media", token, { method: "POST", body: fd });
      await loadMedia();
      selectMedia(up);
    } catch (e) { setError(String(e)); }
  }

  // Poll while anything is still draining, so sent/delivered counts move live.
  const draining = campaigns.some((c) => (c.stats.queued || 0) + (c.stats.sending || 0) > 0);
  useEffect(() => {
    if (!draining) return;
    const id = setInterval(() => { void loadCampaigns(); if (openId) void loadMessages(openId); }, 5000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draining, openId]);

  // Debounced audience preview.
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (previewTimer.current) clearTimeout(previewTimer.current);
    setPreview(null);
    previewTimer.current = setTimeout(async () => {
      try {
        const q = new URLSearchParams({ area_te: segArea, source: segSource, tag: segTag }).toString();
        const r = await api<{ messageable_count: number }>(`/api/segments/preview?${q}`, token);
        setPreview(r.messageable_count);
      } catch { setPreview(null); }
    }, 350);
    return () => { if (previewTimer.current) clearTimeout(previewTimer.current); };
  }, [segArea, segSource, segTag, token]);

  async function loadMessages(id: string) {
    try { setMessages(await api<CampaignMessage[]>(`/api/campaigns/${id}/messages?limit=500`, token)); }
    catch (e) { setError(String(e)); }
  }

  async function addNumber() {
    if (!nLabel.trim() || !nPhone.trim()) return;
    setError("");
    try {
      await api<MessagingNumber>("/api/numbers", token, {
        method: "POST",
        body: JSON.stringify({ label: nLabel.trim(), phone: nPhone.trim(), daily_cap: nCap, warmup_start: nWarm }),
      });
      setNLabel(""); setNPhone("");
      await loadNumbers();
    } catch (e) { setError(String(e)); }
  }

  async function toggleNumber(n: MessagingNumber) {
    try {
      await api<MessagingNumber>(`/api/numbers/${n.id}`, token, {
        method: "PATCH",
        body: JSON.stringify({ status: n.status === "active" ? "paused" : "active" }),
      });
      await loadNumbers();
    } catch (e) { setError(String(e)); }
  }

  async function createCampaign() {
    if (!name.trim()) return;
    setBusy(true); setError("");
    try {
      const payload = {
        name: name.trim(),
        body,
        media_path: mediaPath.trim(),
        media_kind: mediaKind,
        segment: { area_te: segArea, source: segSource, tag: segTag },
        schedule_at: scheduleAt ? new Date(scheduleAt).toISOString() : "",
      };
      await api<Campaign>("/api/campaigns", token, { method: "POST", body: JSON.stringify(payload) });
      setName(""); setBody(""); clearMedia(); setScheduleAt("");
      setTab("history");
      await loadCampaigns();
    } catch (e) { setError(String(e)); }
    finally { setBusy(false); }
  }

  const activeCount = numbers.filter((n) => n.status === "active").length;
  const statusLabel = (s: string) => ({
    queued: t(lang, "క్యూలో", "Queued"), sending: t(lang, "పంపుతోంది", "Sending"),
    sent: t(lang, "పంపారు", "Sent"), delivered: t(lang, "అందింది", "Delivered"),
    read: t(lang, "చదివారు", "Read"), failed: t(lang, "విఫలం", "Failed"),
    blocked: t(lang, "బ్లాక్", "Blocked"), opted_out: t(lang, "వద్దన్నారు", "Opted out"),
  } as Record<string, string>)[s] || s;

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label={t(lang, "ప్రచార కేంద్రం", "Campaign console")} onClick={onClose}>
      <section className="areaMgrPanel campaignPanel" onClick={(e) => e.stopPropagation()}>
        <div className="modalHeader">
          <strong>{t(lang, "వాట్సాప్ ప్రచారం", "WhatsApp campaigns")}</strong>
          <span className="modalCount">{activeCount} {t(lang, "నంబర్లు", "numbers")}</span>
          <button type="button" className="ghostBtn" onClick={onClose} aria-label={t(lang, "మూసివేయండి", "Close")}>✕</button>
        </div>

        <div className="campaignTabs" role="tablist">
          <button type="button" role="tab" aria-selected={tab === "compose"} className={tab === "compose" ? "active" : ""} onClick={() => setTab("compose")}>{t(lang, "కొత్త ప్రచారం", "Compose")}</button>
          <button type="button" role="tab" aria-selected={tab === "numbers"} className={tab === "numbers" ? "active" : ""} onClick={() => setTab("numbers")}>{t(lang, "నంబర్లు", "Numbers")}</button>
          <button type="button" role="tab" aria-selected={tab === "history"} className={tab === "history" ? "active" : ""} onClick={() => { setTab("history"); void loadCampaigns(); }}>{t(lang, "చరిత్ర", "History")}</button>
        </div>

        <div className="campaignBody">
          {error && <p className="error" role="alert">{error}</p>}

          {tab === "compose" && (
            <div className="campaignSection">
              {activeCount === 0 && (
                <p className="campaignHint">{t(lang, "ముందుగా 'నంబర్లు' ట్యాబ్‌లో ఒక వాట్సాప్ నంబర్ చేర్చండి. లేకపోతే సందేశాలు క్యూలో వేచి ఉంటాయి.", "Add a WhatsApp number in the Numbers tab first, otherwise messages just wait in the queue.")}</p>
              )}
              <label className="campaignField">{t(lang, "ప్రచారం పేరు", "Campaign name")}
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t(lang, "ఉదా. ఈద్ శుభాకాంక్షలు", "e.g. Eid greetings")} />
              </label>

              <fieldset className="campaignAudience">
                <legend>{t(lang, "ఎవరికి పంపాలి", "Audience")}</legend>
                <div className="campaignRow">
                  <label>{t(lang, "ప్రాంతం", "Area")}
                    <select value={segArea} onChange={(e) => setSegArea(e.target.value)}>
                      <option value="">{t(lang, "అన్ని ప్రాంతాలు", "All areas")}</option>
                      {areaOptions.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
                    </select>
                  </label>
                  <label>{t(lang, "వర్గం", "Category")}
                    <select value={segSource} onChange={(e) => setSegSource(e.target.value)}>
                      <option value="">{t(lang, "అన్నీ", "All")}</option>
                      <option value="life">{t(lang, "లైఫ్", "Life")}</option>
                      <option value="general">{t(lang, "జనరల్", "General")}</option>
                    </select>
                  </label>
                  <label>{t(lang, "ట్యాగ్", "Tag")}
                    <select value={segTag} onChange={(e) => setSegTag(e.target.value)}>
                      <option value="">{t(lang, "అందరూ", "Everyone")}</option>
                      <option value="ifp">IFP</option>
                      <option value="yt">YT</option>
                      <option value="target">T</option>
                      <option value="mf">MF</option>
                      <option value="flagged">{t(lang, "గుర్తు", "Flagged")}</option>
                    </select>
                  </label>
                </div>
                <p className="campaignPreview">
                  {preview === null
                    ? t(lang, "లెక్కిస్తోంది…", "Counting…")
                    : `${preview} ${t(lang, "సభ్యులకు వెళ్తుంది (మొబైల్ + ఒప్పుకున్నవారు)", "members will receive this (opted-in, with mobile)")}`}
                </p>
              </fieldset>

              <label className="campaignField">{t(lang, "సందేశం", "Message")}
                <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={3}
                  placeholder={t(lang, "సలామ్ {name}, …", "Salam {name}, …")} />
                <small>{t(lang, "{name} మరియు {area} ఆటోమేటిక్‌గా మారతాయి", "{name} and {area} are filled in per member")}</small>
              </label>

              <fieldset className="campaignAudience">
                <legend>{t(lang, "మీడియా (ఐచ్ఛికం)", "Media (optional)")}</legend>
                <div className="campaignMediaControls">
                  <label className="secondary campaignUploadBtn">
                    {t(lang, "అప్‌లోడ్", "Upload")}
                    <input type="file" style={{ display: "none" }}
                      accept="image/*,video/*,audio/*,application/pdf"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadMedia(f); e.currentTarget.value = ""; }} />
                  </label>
                  {mediaId && <button type="button" className="ghostBtn" onClick={clearMedia}>{t(lang, "టెక్స్ట్ మాత్రమే", "Text only")}</button>}
                  {mediaKind && <span className="campaignPill">{mediaKind}</span>}
                </div>
                {media.length > 0 && (
                  <div className="campaignMediaGrid">
                    {media.map((m) => (
                      <button type="button" key={m.id} title={m.filename}
                        className={`campaignMediaItem${m.id === mediaId ? " selected" : ""}`}
                        onClick={() => selectMedia(m)}>
                        {m.kind === "image"
                          ? <SecureImage path={m.url} token={token} alt={m.filename} />
                          : <span className="campaignMediaFile">{m.kind || "file"}</span>}
                        <small>{m.filename}</small>
                      </button>
                    ))}
                  </div>
                )}
              </fieldset>

              <label className="campaignField">{t(lang, "షెడ్యూల్ (ఖాళీగా వదిలితే వెంటనే)", "Schedule (blank = now)")}
                <input type="datetime-local" value={scheduleAt} onChange={(e) => setScheduleAt(e.target.value)} />
              </label>

              <button type="button" className="primary" disabled={busy || !name.trim()} onClick={() => void createCampaign()}>
                {busy ? t(lang, "క్యూలో వేస్తోంది…", "Queueing…") : t(lang, "క్యూలో పెట్టండి", "Queue campaign")}
              </button>
            </div>
          )}

          {tab === "numbers" && (
            <div className="campaignSection">
              <p className="campaignHint">{t(lang, "ప్రత్యేక సిమ్‌లు వాడండి — వ్యక్తిగత నంబర్ కాదు. ప్రతి నంబర్ రోజువారీ పరిమితిలోనే పంపుతుంది.", "Use dedicated SIMs, not a personal number. Each number sends only within its daily cap.")}</p>
              <table className="campaignTable">
                <thead><tr>
                  <th>{t(lang, "పేరు", "Label")}</th><th>{t(lang, "నంబర్", "Number")}</th>
                  <th>{t(lang, "ఈరోజు/పరిమితి", "Today/cap")}</th><th>{t(lang, "స్థితి", "Status")}</th><th></th>
                </tr></thead>
                <tbody>
                  {numbers.map((n) => (
                    <tr key={n.id}>
                      <td>{n.label}</td><td>{n.phone}</td>
                      <td>{n.sent_today}/{n.daily_cap}</td>
                      <td>
                        <span className={`campaignPill ${n.status}`}>{n.status === "active" ? t(lang, "యాక్టివ్", "active") : t(lang, "పాజ్", "paused")}</span>
                        {n.status === "paused" && n.paused_reason && <small className="campaignPausedReason">{n.paused_reason}</small>}
                      </td>
                      <td><button type="button" className="ghostBtn" onClick={() => void toggleNumber(n)}>{n.status === "active" ? t(lang, "పాజ్", "Pause") : t(lang, "యాక్టివేట్", "Activate")}</button></td>
                    </tr>
                  ))}
                  {numbers.length === 0 && <tr><td colSpan={5} className="campaignEmpty">{t(lang, "నంబర్లు లేవు", "No numbers yet")}</td></tr>}
                </tbody>
              </table>
              <div className="campaignRow campaignAddNumber">
                <label>{t(lang, "పేరు", "Label")}<input value={nLabel} onChange={(e) => setNLabel(e.target.value)} placeholder="SIM-A" /></label>
                <label>{t(lang, "నంబర్", "Number")}<input value={nPhone} onChange={(e) => setNPhone(e.target.value)} placeholder="+9190…" /></label>
                <label>{t(lang, "రోజు పరిమితి", "Daily cap")}<input type="number" value={nCap} onChange={(e) => setNCap(Number(e.target.value) || 0)} /></label>
                <label>{t(lang, "వార్మప్ ప్రారంభం", "Warm-up start")}<input type="number" value={nWarm} onChange={(e) => setNWarm(Number(e.target.value) || 0)} /></label>
                <button type="button" className="secondary" onClick={() => void addNumber()}>{t(lang, "చేర్చండి", "Add")}</button>
              </div>
            </div>
          )}

          {tab === "history" && (
            <div className="campaignSection">
              {!openId && (
                <table className="campaignTable">
                  <thead><tr>
                    <th>{t(lang, "ప్రచారం", "Campaign")}</th><th>{t(lang, "మొత్తం", "Total")}</th>
                    <th>{t(lang, "పంపారు", "Sent")}</th><th>{t(lang, "అందింది", "Deliv.")}</th>
                    <th>{t(lang, "మిగిలింది", "Queued")}</th><th>{t(lang, "విఫలం", "Failed")}</th>
                  </tr></thead>
                  <tbody>
                    {campaigns.map((c) => (
                      <tr key={c.id} className="campaignRowClickable" onClick={() => { setOpenId(c.id); void loadMessages(c.id); }}>
                        <td>{c.name}</td><td>{c.total}</td>
                        <td>{(c.stats.sent || 0) + (c.stats.delivered || 0) + (c.stats.read || 0)}</td>
                        <td>{(c.stats.delivered || 0) + (c.stats.read || 0)}</td>
                        <td>{(c.stats.queued || 0) + (c.stats.sending || 0)}</td>
                        <td>{c.stats.failed || 0}</td>
                      </tr>
                    ))}
                    {campaigns.length === 0 && <tr><td colSpan={6} className="campaignEmpty">{t(lang, "ఇంకా ప్రచారాలు లేవు", "No campaigns yet")}</td></tr>}
                  </tbody>
                </table>
              )}
              {openId && (
                <>
                  <button type="button" className="ghostBtn" onClick={() => setOpenId("")}>← {t(lang, "అన్ని ప్రచారాలు", "All campaigns")}</button>
                  <table className="campaignTable campaignLog">
                    <thead><tr>
                      <th>{t(lang, "నంబర్", "To")}</th><th>{t(lang, "స్థితి", "Status")}</th>
                      <th>{t(lang, "ప్రయత్నాలు", "Tries")}</th><th>{t(lang, "లోపం", "Error")}</th>
                    </tr></thead>
                    <tbody>
                      {messages.map((m) => (
                        <tr key={m.id}>
                          <td>{m.to_phone}</td>
                          <td><span className={`campaignPill ${m.status}`}>{statusLabel(m.status)}</span></td>
                          <td>{m.attempts}</td>
                          <td className="campaignErr">{m.last_error}</td>
                        </tr>
                      ))}
                      {messages.length === 0 && <tr><td colSpan={4} className="campaignEmpty">—</td></tr>}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
