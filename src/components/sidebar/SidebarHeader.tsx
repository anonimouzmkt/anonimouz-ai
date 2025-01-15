import { SidebarTrigger } from "@/components/ui/sidebar";

export const SidebarHeader = () => {
  return (
    <div className="flex items-center justify-between px-2">
      <div className="flex items-center gap-2">
        <img 
          src="/lovable-uploads/4321434b-2144-462b-b83b-2b1129bccb08.png" 
          alt="Logo" 
          className="w-7 h-7"
        />
        <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">Anonimouz A.I</span>
      </div>
      <SidebarTrigger />
    </div>
  );
};