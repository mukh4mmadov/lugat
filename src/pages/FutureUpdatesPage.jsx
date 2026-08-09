import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import GlassCard from "../components/GlassCard";

export default function FutureUpdatesPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const features = [
    {
      id: 1,
      icon: "🔐",
      title: t("roadmap.feature1.title"),
      description: t("roadmap.feature1.description"),
      benefit: t("roadmap.feature1.benefit"),
      status: t("roadmap.planned")
    },
    {
      id: 2,
      icon: "☁️",
      title: t("roadmap.feature2.title"),
      description: t("roadmap.feature2.description"),
      benefit: t("roadmap.feature2.benefit"),
      status: t("roadmap.planned")
    },
    {
      id: 3,
      icon: "📝",
      title: t("roadmap.feature3.title"),
      description: t("roadmap.feature3.description"),
      benefit: t("roadmap.feature3.benefit"),
      status: t("roadmap.comingSoon")
    },
    {
      id: 4,
      icon: "📚",
      title: t("roadmap.feature4.title"),
      description: t("roadmap.feature4.description"),
      benefit: t("roadmap.feature4.benefit"),
      status: t("roadmap.future")
    },
    {
      id: 5,
      icon: "🤖",
      title: t("roadmap.feature5.title"),
      description: t("roadmap.feature5.description"),
      benefit: t("roadmap.feature5.benefit"),
      status: t("roadmap.future")
    },
    {
      id: 6,
      icon: "🧠",
      title: t("roadmap.feature6.title"),
      description: t("roadmap.feature6.description"),
      benefit: t("roadmap.feature6.benefit"),
      status: t("roadmap.comingSoon")
    },
    {
      id: 7,
      icon: "🎤",
      title: t("roadmap.feature7.title"),
      description: t("roadmap.feature7.description"),
      benefit: t("roadmap.feature7.benefit"),
      status: t("roadmap.future")
    },
    {
      id: 8,
      icon: "📊",
      title: t("roadmap.feature8.title"),
      description: t("roadmap.feature8.description"),
      benefit: t("roadmap.feature8.benefit"),
      status: t("roadmap.future")
    },
    {
      id: 9,
      icon: "🎯",
      title: t("roadmap.feature9.title"),
      description: t("roadmap.feature9.description"),
      benefit: t("roadmap.feature9.benefit"),
      status: t("roadmap.future")
    },
    {
      id: 10,
      icon: "💬",
      title: t("roadmap.feature10.title"),
      description: t("roadmap.feature10.description"),
      benefit: t("roadmap.feature10.benefit"),
      status: t("roadmap.comingSoon")
    },
    {
      id: 11,
      icon: "📝",
      title: t("roadmap.feature11.title"),
      description: t("roadmap.feature11.description"),
      benefit: t("roadmap.feature11.benefit"),
      status: t("roadmap.future")
    }
  ];

  const getStatusColor = (status) => {
    const normalizedStatus = status.toUpperCase();
    switch (normalizedStatus) {
      case "PLANNED":
      case "REJALASHTIRILGAN":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300";
      case "COMING SOON":
      case "KELAJAKDA":
      case "СКОРО":
        return "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300";
      case "FUTURE":
      case "KELAJAK":
      case "В БУДУЩЕМ":
        return "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300";
    }
  };

  const getStatusLabel = (status) => {
    // Status is already translated from t() function
    return status;
  };

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-7xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 text-center"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-sky-500 px-4 py-2 text-sm font-bold text-white shadow-lg"
          >
            <span className="text-lg">🚀</span>
            {t("roadmap.comingSoon")}
          </motion.div>
          
          <h1 className="mt-6 text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            {t("roadmap.title")}
          </h1>
          
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-300 sm:text-xl">
            {t("roadmap.subtitle")}
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.05, duration: 0.5 }}
            >
              <GlassCard className="h-full p-6 transition hover:scale-[1.02]">
                <div className="mb-4 flex items-start justify-between">
                  <span className="text-4xl">{feature.icon}</span>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${getStatusColor(feature.status)}`}>
                    {getStatusLabel(feature.status)}
                  </span>
                </div>
                
                <h3 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">
                  {feature.title}
                </h3>
                
                <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
                  {feature.description}
                </p>
                
                <div className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800/50">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                    {t("roadmap.benefit")}
                  </p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {feature.benefit}
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className="mt-16"
        >
          <h2 className="mb-8 text-2xl font-black text-center text-slate-900 dark:text-white">
            {t("roadmap.timeline.now")}
          </h2>
          
          <div className="space-y-8">
            {/* Current */}
            <div className="flex items-start gap-4">
              <div className="flex shrink-0 items-center justify-center w-24 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white">
                {t("roadmap.timeline.now")}
              </div>
              <div className="flex-1 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                <p className="font-medium text-slate-900 dark:text-white">
                  {t("roadmap.timeline.current")}
                </p>
              </div>
            </div>

            {/* Next */}
            <div className="flex items-start gap-4">
              <div className="flex shrink-0 items-center justify-center w-24 rounded-xl bg-sky-500 px-4 py-2 text-sm font-bold text-white">
                {t("roadmap.timeline.next")}
              </div>
              <div className="flex-1 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                  <li>• {t("roadmap.feature1.title")}</li>
                  <li>• {t("roadmap.feature2.title")}</li>
                  <li>• {t("roadmap.feature3.title")}</li>
                  <li>• {t("roadmap.feature6.title")}</li>
                  <li>• {t("roadmap.feature10.title")}</li>
                </ul>
              </div>
            </div>

            {/* Later */}
            <div className="flex items-start gap-4">
              <div className="flex shrink-0 items-center justify-center w-24 rounded-xl bg-violet-500 px-4 py-2 text-sm font-bold text-white">
                {t("roadmap.timeline.later")}
              </div>
              <div className="flex-1 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                  <li>• {t("roadmap.feature4.title")}</li>
                  <li>• {t("roadmap.feature5.title")}</li>
                  <li>• {t("roadmap.feature7.title")}</li>
                  <li>• {t("roadmap.feature8.title")}</li>
                  <li>• {t("roadmap.feature9.title")}</li>
                  <li>• {t("roadmap.feature11.title")}</li>
                </ul>
              </div>
            </div>

            {/* Future */}
            <div className="flex items-start gap-4">
              <div className="flex shrink-0 items-center justify-center w-24 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-4 py-2 text-sm font-bold text-white">
                {t("roadmap.timeline.future")}
              </div>
              <div className="flex-1 rounded-xl bg-slate-50 p-4 dark:bg-slate-800/50">
                <p className="text-sm text-slate-600 dark:text-slate-400 italic">
                  {t("roadmap.timeline.future")} — More features in development
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-16"
        >
          <GlassCard className="mx-auto max-w-2xl p-8 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.5 }}
            >
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                {t("roadmap.cta.title")}
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-300 mb-6">
                {t("roadmap.cta.subtitle")}
              </p>
              <button
                type="button"
                onClick={() => navigate("/study")}
                className="rounded-2xl bg-gradient-to-r from-sky-500 to-violet-500 px-8 py-3 font-black text-white transition hover:scale-105 shadow-lg"
              >
                {t("roadmap.cta.button")}
              </button>
            </motion.div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
