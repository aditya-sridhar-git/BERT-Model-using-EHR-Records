import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClinicalBERT — BERT Pre-trained on EHR Clinical Notes",
  description:
    "ClinicalBERT provides publicly available BERT embeddings pre-trained on MIMIC-III clinical notes for downstream NLP tasks including NER and NLI on medical text.",
  keywords: [
    "ClinicalBERT",
    "BERT",
    "EHR",
    "Clinical NLP",
    "MIMIC",
    "NER",
    "Medical AI",
    "HuggingFace",
  ],
  openGraph: {
    title: "ClinicalBERT — Clinical NLP At Scale",
    description:
      "Publicly available BERT embeddings pre-trained on MIMIC-III clinical notes.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
