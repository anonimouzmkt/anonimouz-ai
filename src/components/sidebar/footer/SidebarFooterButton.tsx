import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface SidebarFooterButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}

export const SidebarFooterButton = ({
  icon: Icon,
  label,
  onClick,
}: SidebarFooterButtonProps) => {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="w-full justify-start group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center"
      onClick={onClick}
    >
      <Icon className="mr-2 h-4 w-4 group-data-[collapsible=icon]:mr-0" />
      <span className="group-data-[collapsible=icon]:hidden">{label}</span>
    </Button>
  );
};