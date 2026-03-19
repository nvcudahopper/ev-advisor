import { useState } from "react";
import type { Survey, DecisionResult } from "@shared/schema";
import { evaluate } from "@server/decisionEngine";
import SurveyWizard from "@/components/SurveyWizard";
import ConfirmPage from "@/components/ConfirmPage";
import ResultPage from "@/components/ResultPage";
import { PerplexityAttribution } from "@/components/PerplexityAttribution";
import { Car, Loader2 } from "lucide-react";

type Stage = "survey" | "confirm" | "loading" | "result";

export default function Home() {
  const [stage, setStage] = useState<Stage>("survey");
  const [surveyData, setSurveyData] = useState<Survey | null>(null);
  const [result, setResult] = useState<DecisionResult | null>(null);

  const handleSurveyComplete = (data: Survey) => {
    setSurveyData(data);
    setStage("confirm");
  };

  const handleConfirm = () => {
    if (!surveyData) return;
    setStage("loading");
    // Run evaluation directly in the browser — no API call needed
    try {
      const evalResult = evaluate(surveyData);
      setResult(evalResult);
      setStage("result");
    } catch (err) {
      console.error("Evaluation failed:", err);
      setStage("confirm");
    }
  };

  const handleBack = () => {
    setStage("survey");
  };

  const handleRestart = () => {
    setSurveyData(null);
    setResult(null);
    setStage("survey");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Car className="w-4 h-4 text-primary-foreground" />
          </div>
          <h1 className="text-base font-semibold text-foreground">
            电动车购车决策系统
          </h1>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {stage === "survey" && (
          <SurveyWizard
            initialData={surveyData}
            onComplete={handleSurveyComplete}
          />
        )}

        {stage === "confirm" && surveyData && (
          <ConfirmPage
            data={surveyData}
            onConfirm={handleConfirm}
            onBack={handleBack}
          />
        )}

        {stage === "loading" && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground text-sm">
              正在分析您的需求，生成个性化推荐...
            </p>
          </div>
        )}

        {stage === "result" && result && (
          <ResultPage result={result} onRestart={handleRestart} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="max-w-4xl mx-auto px-4">
          <PerplexityAttribution />
        </div>
      </footer>
    </div>
  );
}
