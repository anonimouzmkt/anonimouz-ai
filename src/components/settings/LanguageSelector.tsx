import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "@/hooks/useTranslation";
import { Language } from "@/utils/translations";
import { useToast } from "@/hooks/use-toast";

export const LanguageSelector = () => {
  const { t, setLanguage, currentLanguage } = useTranslation();
  const { toast } = useToast();

  const handleLanguageChange = async (language: string) => {
    try {
      await setLanguage(language as Language);
      toast({
        title: t("success"),
        description: t("languageUpdated"),
      });
    } catch (error) {
      console.error("Error updating language:", error);
      toast({
        title: t("error"),
        description: t("errorUpdatingLanguage"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-2">
      <h2 className="text-lg font-semibold">{t("language")}</h2>
      <Select value={currentLanguage} onValueChange={handleLanguageChange}>
        <SelectTrigger>
          <SelectValue placeholder={t("selectLanguage")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="en">{t("english")}</SelectItem>
          <SelectItem value="pt-BR">{t("portuguese")}</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};