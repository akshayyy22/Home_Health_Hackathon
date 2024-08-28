"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  IconArrowLeft,
  IconBrandTabler,
  IconSettings,
  IconUserBolt,
  IconShoppingCart,
  IconHeartRateMonitor,
  IconPill,
  IconClipboardCheck,
  IconVideo,
} from "@tabler/icons-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { account } from "@/lib/appwrite"; // Adjust the import path as needed
import StartMeeting from "../components/Monitoring";
import MedicationReminder from "../components/Remainder";
import AddMedicine from "../components/MedicineResupply";
import { CoverDemo } from "../components/IntroPreview";

export default function SidebarDemo() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false); // For mobile

  const links = [
    {
      label: "Dashboard",
      href: "#",
      icon: (
        <IconBrandTabler className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      component: <CoverDemo />,
    },
    {
      label: "Health Monitor",
      href: "#",
      icon: (
        <IconHeartRateMonitor className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Medicine Supply",
      href: "#",
      icon: (
        <IconPill className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      component: <AddMedicine />,
    },
    {
      label: "Reminder",
      href: "#",
      icon: (
        <IconClipboardCheck className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      component: <MedicationReminder />,
    },
    {
      label: "Monitoring Room",
      href: "#",
      icon: (
        <IconVideo className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      component: <StartMeeting />,
    },
    {
      label: "Settings",
      href: "#",
      icon: (
        <IconSettings className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      // component: <CardDemo />,
    },
    {
      label: "Logout",
      href: "#",
      icon: (
        <IconArrowLeft className="text-neutral-700 dark:text-neutral-200 h-5 w-5 flex-shrink-0" />
      ),
      onClick: async () => {
        try {
          await account.deleteSession("current"); // Logs out the user
          router.push("/auth/login"); // Redirects to login page
        } catch (error) {
          console.error("Logout error:", error);
        }
      },
    },
  ];

  return (
    <div className={cn("flex h-screen bg-gray-100 dark:bg-neutral-800")}>
      {/* Mobile Menu Button */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden text-white bg-black p-2 rounded"
        onClick={() => setIsSidebarVisible(!isSidebarVisible)}
      >
        {isSidebarVisible ? "Close" : "Menu"}
      </button>

      {/* Sidebar Component */}
      <Sidebar open={isSidebarOpen} setOpen={setIsSidebarOpen}>
        <SidebarBody className="flex flex-col h-full">
          <div className="flex flex-col flex-1 overflow-y-auto">
            {isSidebarOpen ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setActiveTab(link.label);
                    if (isSidebarOpen) {
                      setIsSidebarOpen(false); // Optionally close the sidebar after selection
                    }
                    if (isSidebarVisible) {
                      setIsSidebarVisible(false); // Close mobile menu after selection
                    }
                    if (link.onClick) link.onClick(); // Handle the logout
                  }}
                >
                  <SidebarLink link={link} />
                </div>
              ))}
            </div>
          </div>
          <div className="mt-auto">
            <SidebarLink
              link={{
                label: "Team Luminaries",
                href: "#",
                icon: (
                  <Image
                    src="/logo.ico"
                    className="h-7 w-7 flex-shrink-0 rounded-full"
                    width={50}
                    height={50}
                    alt="Avatar"
                  />
                ),
              }}
            />
          </div>
        </SidebarBody>
      </Sidebar>

      <main className="flex-1 p-2 md:p-10 bg-white dark:bg-neutral-900 overflow-y-auto">
        {links.find((link) => link.label === activeTab)?.component || null}
      </main>
    </div>
  );
}

export const Logo = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        PATIENT PANEL
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};
