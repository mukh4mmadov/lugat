import LegalDocument from "../components/LegalDocument";

// Text in the locale files under "privacy.": intro and sections s1-s13.
export default function PrivacyPolicyPage() {
  return <LegalDocument prefix="privacy" count={13} />;
}
