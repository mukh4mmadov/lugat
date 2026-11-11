import LegalDocument from "../components/LegalDocument";

// Text in the locale files under "terms.": intro and sections s1-s14.
export default function TermsOfServicePage() {
  return <LegalDocument prefix="terms" count={14} />;
}
