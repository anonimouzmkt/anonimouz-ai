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
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Languages } from "lucide-react";

export const LanguageSelector = () => {
  const { t, setLanguage, currentLanguage } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleLanguageChange = async (language: string) => {
    try {
      console.log("Language change requested:", language);
      await setLanguage(language as Language);
      
      await queryClient.invalidateQueries({ queryKey: ["profile"] });
      
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
    <Card>
      <CardHeader className="flex flex-row items-center space-x-2">
        <Languages className="w-5 h-5 text-primary" />
        <CardTitle className="text-xl font-semibold">{t("language")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={currentLanguage} onValueChange={handleLanguageChange}>
          <SelectTrigger>
            <SelectValue placeholder={t("selectLanguage")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">{t("english")}</SelectItem>
            <SelectItem value="pt-BR">{t("portuguese")}</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};