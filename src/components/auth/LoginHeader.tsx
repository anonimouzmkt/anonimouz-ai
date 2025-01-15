import { useTranslation } from "@/hooks/useTranslation";

export const LoginHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold tracking-tight">
        {t("welcomeBack")}
      </h1>
      <p className="mt-2 text-muted-foreground">{t("signIn")}</p>
    </div>
  );
};