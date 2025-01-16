import { SidebarTrigger } from "@/components/ui/sidebar";

export const SidebarHeader = () => {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-3">
        <img
          src="/lovable-uploads/4321434b-2144-462b-b83b-2b1129bccb08.png"
          alt="Logo"
          className="w-10 h-10 object-contain"
        />
        <span className="text-base font-medium text-sidebar-foreground group-data-[collapsible=icon]:hidden">
          Anonimouz A.I
        </span>
      </div>
      <div className="flex items-center justify-center group-data-[collapsible=icon]:absolute group-data-[collapsible=icon]:right-2">
        <SidebarTrigger className="h-8 w-8" />
      </div>
    </div>
  );
};