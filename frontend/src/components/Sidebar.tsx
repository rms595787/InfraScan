// src/components/Sidebar.tsx
import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IconX } from "@tabler/icons-react";

// Define the shape of our navigation links
interface NavLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

// Define the props our new Sidebar will accept
interface InfraScanSidebarProps {
  open: boolean;
  onClose: () => void;
  navLinks: NavLink[];
  handleScroll: (href: string) => void;
}

export function InfraScanSidebar({ open, onClose, navLinks, handleScroll }: InfraScanSidebarProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40"
          />

          {/* Sidebar Panel */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 left-0 h-full w-72 bg-neutral-900 text-white p-6 z-50 flex flex-col"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold">InfraScan</h2>
              <button onClick={onClose}>
                <IconX className="h-6 w-6" />
              </button>
            </div>
            
            <nav className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    e.preventDefault();
                    handleScroll(link.href);
                  }}
                  className="flex items-center p-3 rounded-lg text-neutral-200 hover:bg-neutral-800 cursor-pointer transition-colors"
                >
                  {link.icon}
                  <span className="ml-4 text-lg">{link.label}</span>
                </a>
              ))}
            </nav>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}