import { SidebarInput } from "@/components/ui/sidebar";

export const SidebarHeader = () => {
  return (
    <div className="flex flex-col gap-2 px-2">
      <div className="flex items-center justify-between">
        <img
          src="/lovable-uploads/4321434b-2144-462b-b83b-2b1129bccb08.png"
          alt="Logo"
          className="w-[148px] h-[44px] object-contain"
        />
      </div>
      <SidebarInput placeholder="Search..." />
    </div>
  );
};