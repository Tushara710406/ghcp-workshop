"use client";

import { MobileSidebar } from "./mobile-sidebar";
import { DarkModeToggle } from "./dark-mode-toggle";

export const Navbar = () => {
  return (
    <nav className="pt-4 px-6 flex items-center justify-between">
      <div className="flex-col hidden lg:flex">
        <h1 className="text-2xl font-semibold">
          Sport App GitHub Copilot Workshop
        </h1>
        <p className="text-muted-foreground">
          Elevate Your Game with Contoso Sport: Where Sports Passion Meets
          Performance!
        </p>
      </div>
      <div className="flex items-center gap-2">
        <DarkModeToggle />
        <MobileSidebar />
      </div>
    </nav>
  );
};
