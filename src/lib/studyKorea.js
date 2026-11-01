import { useEffect, useState } from "react";
import { IEQAS_GUIDE, REGIONS } from "../data/korea/guide";
import { supabase } from "./supabase";

// Calls api/study-ai.js with the learner's session. Errors carry the HTTP
// status (429 = limit reached) and the response body.
export async function studyRequest(method, body) {
  const { data } = await supabase.auth.getSession();
  const response = await fetch("/api/study-ai", {
    method,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token || ""}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || "Request failed");
    error.status = response.status;
    error.data = payload;
    throw error;
  }
  return payload;
}

let rateCache = null;
// The Central Bank of Uzbekistan rate: so'm per won.
export function useWonRate() {
  const [rate, setRate] = useState(rateCache);
  useEffect(() => {
    if (rateCache) return;
    // The bank allows browser requests; our API is the fallback.
    fetch("https://cbu.uz/uz/arkhiv-kursov-valyut/json/KRW/")
      .then((response) => (response.ok ? response.json() : Promise.reject()))
      .then(([row]) => ({ ccy: "KRW", rate: Number(row.Rate) / (Number(row.Nominal) || 1), date: row.Date, source: "https://cbu.uz" }))
      .catch(() => fetch("/api/fx").then((response) => (response.ok ? response.json() : null)))
      .then((data) => {
        if (data?.rate > 0) {
          rateCache = data;
          setRate(data);
        }
      })
      .catch(() => {});
  }, []);
  return rate;
}

const group = (value) => Math.round(value).toLocaleString("ru-RU").replace(/,/g, " ");
export const formatWon = (won) => (won ? `₩${group(won)}` : "—");

export function formatSom(won, rate, t) {
  if (!won || !rate?.rate) return null;
  const som = won * rate.rate;
  return som >= 1e6 ? t("korea.mlnSom", { value: (som / 1e6).toFixed(1).replace(".", ",") }) : t("korea.som", { value: group(som) });
}

export const uniName = (uni, language) => (language !== "uz" && uni.en ? uni.en : uni.en || uni.ko);
export const regionName = (region, language) => (region ? REGIONS[region]?.[language] || REGIONS[region]?.uz || region : "—");
export const tr = (text, language) => (typeof text === "string" ? text : text?.[language] || text?.uz || "");

// What a university's IEQAS status means for a student visa.
export function ieqasExplain(uni, language) {
  const { degree, language: lang, excellent } = uni.ieqas;
  if (degree === "scrutiny" || lang === "scrutiny") return tr(IEQAS_GUIDE.scrutiny, language);
  if (excellent) return tr(IEQAS_GUIDE.excellent, language);
  if (degree === "certified" || lang === "certified") return tr(IEQAS_GUIDE.certified, language);
  return tr(IEQAS_GUIDE.none, language);
}
