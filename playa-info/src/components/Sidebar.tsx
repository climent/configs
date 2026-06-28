/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  Type,
  Heading2,
  AlignLeft,
  ListPlus,
  Quote,
  BarChart2,
  LayoutGrid,
  Clock,
  FolderOpen,
  FilePlus,
  Trash2,
  Calendar,
  Sparkles,
  CheckCircle2,
  Lock,
  Download,
  Plus,
  Image,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";
import {
  Presentation,
  ElementType,
  DEFAULT_THEMES,
  PresentationMetadata,
} from "../types";
import { formatPublishedDate } from "../utils/dateFormatter";

interface SidebarProps {
  presentations: Presentation[];
  activeId: string;
  onSelectPresentation: (id: string) => void;
  onNewPresentation: () => void;
  onDeletePresentation: (id: string) => void;
  onUpdateMetadata: (metadata: Partial<PresentationMetadata>) => void;
  onApplyTheme: (themeIndex: number) => void;
  onUpdateSlideAlignment?: (alignment: "top" | "middle" | "bottom") => void;
  activeSlideAlignment?: "top" | "middle" | "bottom";
  onExportPDF: () => void;
  isExporting: boolean;
  onAddElement?: (type: ElementType) => void;
  onImportPresentations?: (decks: Presentation[]) => void;
}

export default function Sidebar({
  presentations,
  activeId,
  onSelectPresentation,
  onNewPresentation,
  onDeletePresentation,
  onUpdateMetadata,
  onApplyTheme,
  onUpdateSlideAlignment,
  activeSlideAlignment,
  onExportPDF,
  isExporting,
  onAddElement,
  onImportPresentations,
}: SidebarProps) {
  const activePresentation = presentations.find((p) => p.id === activeId);
  const [activeTab, setActiveTab] = useState<"build" | "metadata" | "decks">(
    "build",
  );
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isThemeSectionOpen, setIsThemeSectionOpen] = useState(true);
  const [isTemplatesSectionOpen, setIsTemplatesSectionOpen] = useState(true);
  const [isElementsSectionOpen, setIsElementsSectionOpen] = useState(true);
  const [isAlignmentSectionOpen, setIsAlignmentSectionOpen] = useState(true);
  const [isMetadataSectionOpen, setIsMetadataSectionOpen] = useState(true);
  const [isExpirationSectionOpen, setIsExpirationSectionOpen] = useState(true);

  // Keep track of current time to show countdown / dynamic archives
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleDragStartElement = (
    e: React.DragEvent,
    elementType: ElementType,
  ) => {
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        dragType: "element",
        type: elementType,
      }),
    );
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragStartTemplate = (
    e: React.DragEvent,
    templateType: string,
  ) => {
    e.dataTransfer.setData(
      "text/plain",
      JSON.stringify({
        dragType: "template",
        template: templateType,
      }),
    );
    e.dataTransfer.effectAllowed = "copy";
  };

  const formatTimeRemaining = (expiresAtStr: string | null) => {
    if (!expiresAtStr) return "Never expires";
    const expiresAt = new Date(expiresAtStr);
    const diff = expiresAt.getTime() - currentTime.getTime();

    if (diff <= 0) {
      return "Archived (Expired)";
    }

    const secs = Math.floor(diff / 1000) % 60;
    const mins = Math.floor(diff / (1000 * 60)) % 60;
    const hours = Math.floor(diff / (1000 * 60 * 60)) % 24;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${mins}m remaining`;
    if (mins > 0) return `${mins}m ${secs}s remaining`;
    return `${secs}s remaining`;
  };

  const handleQuickExpiryPreset = (seconds: number) => {
    if (!activePresentation) return;
    const currentExpiresAtStr = activePresentation.metadata.expiresAt;
    let baseDate = new Date();
    if (currentExpiresAtStr) {
      const existingDate = new Date(currentExpiresAtStr);
      if (existingDate.getTime() > Date.now()) {
        baseDate = existingDate;
      }
    }
    const expiryDate = new Date(baseDate.getTime() + seconds * 1000);
    onUpdateMetadata({
      expiresAt: expiryDate.toISOString(),
      isArchived: false,
    });
  };

  const handleRemoveExpiry = () => {
    onUpdateMetadata({
      expiresAt: null,
      isArchived: false,
    });
  };

  const handleExportDecksJSON = () => {
    try {
      const dataStr =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(presentations, null, 2));
      const downloadAnchor = document.createElement("a");
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute(
        "download",
        `slide-builder-backup-${new Date().toISOString().split("T")[0]}.json`,
      );
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error("Failed to export decks", e);
      alert("Failed to export presentation backup");
    }
  };

  const handleImportDecksJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            if (onImportPresentations) {
              onImportPresentations(parsed);
              alert("Successfully restored presentations from backup!");
            }
          } else {
            alert(
              "Invalid backup file format. Must be a JSON array of presentations.",
            );
          }
        } catch (err) {
          console.error("Failed to parse backup JSON", err);
          alert(
            "Failed to parse backup JSON file. Please ensure it is a valid backup.",
          );
        }
      };
    }
  };

  const activeMeta = activePresentation?.metadata;
  const isArchived = activeMeta
    ? activeMeta.expiresAt
      ? new Date(activeMeta.expiresAt).getTime() <= currentTime.getTime()
      : false
    : false;

  return (
    <div
      id="sidebar-container"
      className="w-80 border-r border-slate-200 bg-white flex flex-col h-full shrink-0 select-none shadow-sm z-10"
    >
      {/* App Header */}
      <div
        id="app-header"
        className="p-4 border-b border-slate-100 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shadow-inner animate-pulse">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-sans font-bold text-slate-900 tracking-tight text-sm">
              Slide PDF Builder
            </h1>
            <p className="font-sans text-[10px] text-slate-500 font-semibold tracking-wider uppercase">
              ACCESSIBLE 20PT+ STANDARDS
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        id="sidebar-tabs"
        className="flex border-b border-slate-100 px-2 bg-slate-50/50"
      >
        <button
          id="tab-build"
          onClick={() => setActiveTab("build")}
          className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-all cursor-pointer ${
            activeTab === "build"
              ? "border-indigo-600 text-indigo-600 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-800"
          }`}
        >
          Build Slide
        </button>
        <button
          id="tab-metadata"
          onClick={() => setActiveTab("metadata")}
          className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-all cursor-pointer ${
            activeTab === "metadata"
              ? "border-indigo-600 text-indigo-600 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-800"
          }`}
        >
          Expiry / Meta
        </button>
        <button
          id="tab-decks"
          onClick={() => setActiveTab("decks")}
          className={`flex-1 py-3 text-xs font-semibold text-center border-b-2 transition-all cursor-pointer ${
            activeTab === "decks"
              ? "border-indigo-600 text-indigo-600 font-bold"
              : "border-transparent text-slate-400 hover:text-slate-800"
          }`}
        >
          My Decks ({presentations.length})
        </button>
      </div>

      {/* Tab Contents */}
      <div
        id="sidebar-tab-content"
        className="flex-1 overflow-y-auto p-4 space-y-3"
      >
        {activeTab === "build" && (
          <>
            {isArchived && (
              <div
                id="expiry-warning-banner"
                className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2"
              >
                <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[11px] text-amber-800 leading-normal">
                  <span className="font-bold block">Document Archived</span>
                  This deck is expired. Editing is disabled until you update the
                  expiration settings.
                </div>
              </div>
            )}

            {/* Draggable Templates */}
            <div>
              <div
                className="flex items-center justify-between cursor-pointer mb-1.5"
                onClick={() =>
                  setIsTemplatesSectionOpen(!isTemplatesSectionOpen)
                }
              >
                <h3
                  id="heading-templates"
                  className="text-[10px] font-bold text-black uppercase tracking-wider flex items-center gap-1.5"
                >
                  <FolderOpen className="w-3.5 h-3.5 text-indigo-500" /> Layout
                  Templates
                </h3>
                {isTemplatesSectionOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>

              {isTemplatesSectionOpen && (
                <>
                  <p className="text-[11px] text-slate-500 mb-3.5 leading-relaxed">
                    Drag a layout template onto the active slide workspace to
                    instantly apply the layout.
                  </p>
                  <div id="templates-list" className="grid grid-cols-2 gap-2">
                    <div
                      id="template-item-welcome"
                      draggable={!isArchived}
                      onDragStart={(e) => handleDragStartTemplate(e, "welcome")}
                      className={`border border-slate-150 bg-slate-50 hover:bg-slate-100 p-2.5 rounded-xl flex flex-col justify-between h-20 transition-all select-none hover:shadow-sm ${
                        isArchived
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-grab active:cursor-grabbing hover:border-slate-300"
                      }`}
                    >
                      <span className="text-[11px] font-bold text-slate-700">
                        Welcome Slide
                      </span>
                      <div className="w-full h-4 bg-white border border-slate-200 rounded flex flex-col gap-0.5 justify-center px-1.5">
                        <div className="w-8 h-1 bg-indigo-500 rounded-full" />
                        <div className="w-6 h-0.5 bg-slate-300 rounded-full" />
                      </div>
                    </div>

                    <div
                      id="template-item-bullets"
                      draggable={!isArchived}
                      onDragStart={(e) => handleDragStartTemplate(e, "bullets")}
                      className={`border border-slate-150 bg-slate-50 hover:bg-slate-100 p-2.5 rounded-xl flex flex-col justify-between h-20 transition-all select-none hover:shadow-sm ${
                        isArchived
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-grab active:cursor-grabbing hover:border-slate-300"
                      }`}
                    >
                      <span className="text-[11px] font-bold text-slate-700">
                        Bullet Points
                      </span>
                      <div className="w-full h-4 bg-white border border-slate-200 rounded flex flex-col gap-0.5 justify-center px-1.5">
                        <div className="w-5 h-1 bg-indigo-500 rounded-full" />
                        <div className="flex items-center gap-1">
                          <div className="w-1 h-1 bg-slate-400 rounded-full shrink-0" />
                          <div className="w-6 h-0.5 bg-slate-300 rounded-full" />
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-1 h-1 bg-slate-400 rounded-full shrink-0" />
                          <div className="w-4 h-0.5 bg-slate-300 rounded-full" />
                        </div>
                      </div>
                    </div>

                    <div
                      id="template-item-stats"
                      draggable={!isArchived}
                      onDragStart={(e) => handleDragStartTemplate(e, "stats")}
                      className={`border border-slate-150 bg-slate-50 hover:bg-slate-100 p-2.5 rounded-xl flex flex-col justify-between h-20 transition-all select-none hover:shadow-sm ${
                        isArchived
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-grab active:cursor-grabbing hover:border-slate-300"
                      }`}
                    >
                      <span className="text-[11px] font-bold text-slate-700">
                        Stats
                      </span>
                      <div className="w-full h-4 bg-white border border-slate-200 rounded flex items-center gap-1 px-1.5">
                        <div className="w-4 h-2 bg-indigo-500 rounded" />
                        <div className="flex-1 flex flex-col gap-0.5">
                          <div className="w-6 h-1 bg-slate-400 rounded-full" />
                          <div className="w-4 h-0.5 bg-slate-300 rounded-full" />
                        </div>
                      </div>
                    </div>

                    <div
                      id="template-item-quote"
                      draggable={!isArchived}
                      onDragStart={(e) => handleDragStartTemplate(e, "quote")}
                      className={`border border-slate-150 bg-slate-50 hover:bg-slate-100 p-2.5 rounded-xl flex flex-col justify-between h-20 transition-all select-none hover:shadow-sm ${
                        isArchived
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-grab active:cursor-grabbing hover:border-slate-300"
                      }`}
                    >
                      <span className="text-[11px] font-bold text-slate-700">
                        Quote
                      </span>
                      <div className="w-full h-4 bg-white border border-slate-200 rounded flex items-center gap-1 px-1.5">
                        <div className="w-0.5 h-3.5 bg-indigo-500 rounded" />
                        <div className="w-8 h-1 bg-slate-300 rounded-full" />
                      </div>
                    </div>

                    <div
                      id="template-item-comparison"
                      draggable={!isArchived}
                      onDragStart={(e) =>
                        handleDragStartTemplate(e, "comparison")
                      }
                      className={`border border-slate-150 bg-slate-50 hover:bg-slate-100 p-2.5 rounded-xl flex flex-col justify-between h-20 transition-all col-span-2 select-none hover:shadow-sm ${
                        isArchived
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-grab active:cursor-grabbing hover:border-slate-300"
                      }`}
                    >
                      <span className="text-[11px] font-bold text-slate-700">
                        2-Column Info Grid
                      </span>
                      <div className="w-full h-4 bg-white border border-slate-200 rounded flex justify-between gap-1.5 px-1.5 py-0.5">
                        <div className="flex-1 bg-slate-50 border border-slate-100 rounded flex flex-col gap-0.5 p-0.5">
                          <div className="w-4 h-0.5 bg-indigo-500 rounded-full" />
                          <div className="w-6 h-0.5 bg-slate-300 rounded-full" />
                        </div>
                        <div className="flex-1 bg-slate-50 border border-slate-100 rounded flex flex-col gap-0.5 p-0.5">
                          <div className="w-4 h-0.5 bg-indigo-500 rounded-full" />
                          <div className="w-6 h-0.5 bg-slate-300 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Draggable Individual Elements */}
            <div className="border-t border-slate-100 pt-3">
              <div
                className="flex items-center justify-between cursor-pointer mb-1.5"
                onClick={() => setIsElementsSectionOpen(!isElementsSectionOpen)}
              >
                <h3
                  id="heading-elements"
                  className="text-[10px] font-bold text-black uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-500" /> Add Slide
                  Elements
                </h3>
                {isElementsSectionOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>

              {isElementsSectionOpen && (
                <>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Drag a dynamic block into the slide container or click to
                    append.
                  </p>
                  <div id="elements-list" className="space-y-1.5">
                    <div
                      id="draggable-element-title"
                      draggable={!isArchived}
                      onDragStart={(e) => handleDragStartElement(e, "title")}
                      onClick={() => !isArchived && onAddElement?.("title")}
                      className={`flex items-center gap-3 p-2 bg-white hover:bg-indigo-50/40 border border-slate-150 rounded-xl text-xs font-semibold text-slate-700 hover:border-indigo-200 hover:text-indigo-700 transition-all select-none hover:shadow-sm ${
                        isArchived
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer active:scale-98"
                      }`}
                    >
                      <Type className="w-4 h-4 text-indigo-500" />
                      <span>Main Slide Title</span>
                    </div>

                    <div
                      id="draggable-element-subtitle"
                      draggable={!isArchived}
                      onDragStart={(e) => handleDragStartElement(e, "subtitle")}
                      onClick={() => !isArchived && onAddElement?.("subtitle")}
                      className={`flex items-center gap-3 p-2 bg-white hover:bg-indigo-50/40 border border-slate-150 rounded-xl text-xs font-semibold text-slate-700 hover:border-indigo-200 hover:text-indigo-700 transition-all select-none hover:shadow-sm ${
                        isArchived
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer active:scale-98"
                      }`}
                    >
                      <Heading2 className="w-4 h-4 text-violet-500" />
                      <span>Subtitle Callout</span>
                    </div>

                    <div
                      id="draggable-element-paragraph"
                      draggable={!isArchived}
                      onDragStart={(e) =>
                        handleDragStartElement(e, "paragraph")
                      }
                      onClick={() => !isArchived && onAddElement?.("paragraph")}
                      className={`flex items-center gap-3 p-2 bg-white hover:bg-indigo-50/40 border border-slate-150 rounded-xl text-xs font-semibold text-slate-700 hover:border-indigo-200 hover:text-indigo-700 transition-all select-none hover:shadow-sm ${
                        isArchived
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer active:scale-98"
                      }`}
                    >
                      <AlignLeft className="w-4 h-4 text-emerald-500" />
                      <span>Paragraph</span>
                    </div>

                    <div
                      id="draggable-element-bullets"
                      draggable={!isArchived}
                      onDragStart={(e) =>
                        handleDragStartElement(e, "bulletList")
                      }
                      onClick={() =>
                        !isArchived && onAddElement?.("bulletList")
                      }
                      className={`flex items-center gap-3 p-2 bg-white hover:bg-indigo-50/40 border border-slate-150 rounded-xl text-xs font-semibold text-slate-700 hover:border-indigo-200 hover:text-indigo-700 transition-all select-none hover:shadow-sm ${
                        isArchived
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer active:scale-98"
                      }`}
                    >
                      <ListPlus className="w-4 h-4 text-rose-500" />
                      <span>Bullet Points</span>
                    </div>

                    <div
                      id="draggable-element-stat"
                      draggable={!isArchived}
                      onDragStart={(e) => handleDragStartElement(e, "stat")}
                      onClick={() => !isArchived && onAddElement?.("stat")}
                      className={`flex items-center gap-3 p-2 bg-white hover:bg-indigo-50/40 border border-slate-150 rounded-xl text-xs font-semibold text-slate-700 hover:border-indigo-200 hover:text-indigo-700 transition-all select-none hover:shadow-sm ${
                        isArchived
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer active:scale-98"
                      }`}
                    >
                      <BarChart2 className="w-4 h-4 text-amber-500" />
                      <span>Big Numeric Stat Callout</span>
                    </div>

                    <div
                      id="draggable-element-quote"
                      draggable={!isArchived}
                      onDragStart={(e) => handleDragStartElement(e, "quote")}
                      onClick={() => !isArchived && onAddElement?.("quote")}
                      className={`flex items-center gap-3 p-2 bg-white hover:bg-indigo-50/40 border border-slate-150 rounded-xl text-xs font-semibold text-slate-700 hover:border-indigo-200 hover:text-indigo-700 transition-all select-none hover:shadow-sm ${
                        isArchived
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer active:scale-98"
                      }`}
                    >
                      <Quote className="w-4 h-4 text-orange-500" />
                      <span>Italicized Accent Quote</span>
                    </div>

                    <div
                      id="draggable-element-grid"
                      draggable={!isArchived}
                      onDragStart={(e) => handleDragStartElement(e, "grid")}
                      onClick={() => !isArchived && onAddElement?.("grid")}
                      className={`flex items-center gap-3 p-2 bg-white hover:bg-indigo-50/40 border border-slate-150 rounded-xl text-xs font-semibold text-slate-700 hover:border-indigo-200 hover:text-indigo-700 transition-all select-none hover:shadow-sm ${
                        isArchived
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer active:scale-98"
                      }`}
                    >
                      <LayoutGrid className="w-4 h-4 text-fuchsia-500" />
                      <span>2-Column Comparative Grid</span>
                    </div>

                    <div
                      id="draggable-element-image"
                      draggable={!isArchived}
                      onDragStart={(e) => handleDragStartElement(e, "image")}
                      onClick={() => !isArchived && onAddElement?.("image")}
                      className={`flex items-center gap-3 p-2 bg-white hover:bg-indigo-50/40 border border-slate-150 rounded-xl text-xs font-semibold text-slate-700 hover:border-indigo-200 hover:text-indigo-700 transition-all select-none hover:shadow-sm ${
                        isArchived
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer active:scale-98"
                      }`}
                    >
                      <Image className="w-4 h-4 text-sky-500" />
                      <span>Image</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Slide Layout Alignment */}
            <div className="border-t border-slate-100 pt-3">
              <div
                className="flex items-center justify-between cursor-pointer mb-1.5"
                onClick={() =>
                  setIsAlignmentSectionOpen(!isAlignmentSectionOpen)
                }
              >
                <h3
                  id="heading-alignment"
                  className="text-[10px] font-bold text-black uppercase tracking-wider flex items-center gap-1.5"
                >
                  <LayoutGrid className="w-3.5 h-3.5 text-indigo-500" /> Slide
                  elements alignment
                </h3>
                {isAlignmentSectionOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>

              {isAlignmentSectionOpen && (
                <div className="flex bg-slate-100 p-1 rounded-xl">
                  <button
                    disabled={isArchived}
                    onClick={() => onUpdateSlideAlignment?.("top")}
                    className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                      activeSlideAlignment === "top"
                        ? "bg-white shadow-sm text-indigo-700"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                    }`}
                  >
                    Top
                  </button>
                  <button
                    disabled={isArchived}
                    onClick={() => onUpdateSlideAlignment?.("middle")}
                    className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                      !activeSlideAlignment || activeSlideAlignment === "middle"
                        ? "bg-white shadow-sm text-indigo-700"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                    }`}
                  >
                    Middle
                  </button>
                  <button
                    disabled={isArchived}
                    onClick={() => onUpdateSlideAlignment?.("bottom")}
                    className={`flex-1 py-1.5 text-[11px] font-bold rounded-lg transition-all ${
                      activeSlideAlignment === "bottom"
                        ? "bg-white shadow-sm text-indigo-700"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                    }`}
                  >
                    Bottom
                  </button>
                </div>
              )}
            </div>

            {/* Quick Themes */}
            <div className="border-t border-slate-100 pt-3">
              <div
                className="flex items-center justify-between cursor-pointer mb-1.5"
                onClick={() => setIsThemeSectionOpen(!isThemeSectionOpen)}
              >
                <h3
                  id="heading-themes"
                  className="text-[10px] font-bold text-black uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" /> Apply
                  Slide Theme
                </h3>
                {isThemeSectionOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>

              {isThemeSectionOpen && (
                <>
                  <p className="text-[11px] text-slate-500 mb-3">
                    Instantly style the active slide's background, colors, and
                    font layout.
                  </p>
                  <div id="themes-grid" className="grid grid-cols-2 gap-2">
                    {DEFAULT_THEMES.map((theme, idx) => (
                      <button
                        id={`theme-btn-${idx}`}
                        key={idx}
                        disabled={isArchived}
                        onClick={() => onApplyTheme(idx)}
                        className={`flex items-center justify-between p-2 rounded-xl border border-slate-200 transition-all hover:border-slate-400 bg-white text-left ${
                          isArchived
                            ? "opacity-40 cursor-not-allowed"
                            : "cursor-pointer hover:shadow-sm"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="text-[11px] font-semibold text-slate-800 truncate">
                            {theme.fontFamily}
                          </span>
                        </div>
                        <div className="flex gap-1 shrink-0">
                          <span
                            className="w-3 h-3 rounded-full border border-slate-200 shrink-0 shadow-inner"
                            style={{ backgroundColor: theme.background }}
                          />
                          <span
                            className="w-3 h-3 rounded-full border border-slate-200 shrink-0 shadow-inner"
                            style={{ backgroundColor: theme.accent }}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* PDF Export trigger */}
            <div className="border-t border-slate-100 pt-3">
              <button
                id="sidebar-export-pdf-btn"
                onClick={onExportPDF}
                disabled={isExporting}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-sans text-xs font-bold rounded-xl shadow-md hover:shadow-lg transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4 animate-pulse" />
                {isExporting ? "Generating PDF..." : "Export Slides to PDF"}
              </button>
            </div>
          </>
        )}

        {activeTab === "metadata" && activeMeta && (
          <div id="metadata-settings" className="space-y-3">
            <div>
              <div
                className="flex items-center justify-between cursor-pointer mb-1.5"
                onClick={() => setIsMetadataSectionOpen(!isMetadataSectionOpen)}
              >
                <h3
                  id="metadata-header"
                  className="text-[10px] font-bold text-black uppercase tracking-wider flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-indigo-500" /> Document
                  Metadata
                </h3>
                {isMetadataSectionOpen ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </div>

              {isMetadataSectionOpen && (
                <>
                  <p className="text-[11px] text-slate-500 mb-3.5 leading-relaxed">
                    This metadata will be bundled inside the document and
                    manages slide archiving constraints.
                  </p>

                  <div className="space-y-3">
                    <div>
                      <label
                        id="label-meta-title"
                        className="block text-[11px] font-bold text-slate-600 uppercase mb-1"
                      >
                        PRESENTATION TITLE
                      </label>
                      <input
                        id="input-meta-title"
                        type="text"
                        value={activeMeta.title}
                        onChange={(e) =>
                          onUpdateMetadata({ title: e.target.value })
                        }
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all"
                        placeholder="e.g. Sales Onboarding Deck"
                      />
                    </div>

                    <div>
                      <label
                        id="label-meta-dept"
                        className="block text-[11px] font-bold text-slate-600 uppercase mb-1"
                      >
                        DEPARTMENT
                      </label>
                      <input
                        id="input-meta-dept"
                        type="text"
                        value={activeMeta.department}
                        onChange={(e) =>
                          onUpdateMetadata({ department: e.target.value })
                        }
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all"
                        placeholder="e.g. Product Accessibility"
                      />
                    </div>

                    <div>
                      <label
                        id="label-meta-ref"
                        className="block text-[11px] font-bold text-slate-600 uppercase mb-1"
                      >
                        CREATOR NAME
                      </label>
                      <input
                        id="input-meta-ref"
                        type="text"
                        value={activeMeta.referenceNumber}
                        onChange={(e) =>
                          onUpdateMetadata({ referenceNumber: e.target.value })
                        }
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all"
                        placeholder="e.g. Alex Rivera"
                      />
                    </div>

                    <div>
                      <label
                        id="label-meta-creator"
                        className="block text-[11px] font-bold text-slate-600 uppercase mb-1"
                      >
                        PUBLISHED DATE
                      </label>
                      <input
                        id="input-meta-creator"
                        type="text"
                        value={activeMeta.creator}
                        onChange={(e) =>
                          onUpdateMetadata({ creator: e.target.value })
                        }
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all"
                        placeholder={formatPublishedDate(currentTime)}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="border-t border-slate-100 pt-3">
              <div
                className="flex items-center justify-between cursor-pointer mb-1.5"
                onClick={() =>
                  setIsExpirationSectionOpen(!isExpirationSectionOpen)
                }
              >
                <h3
                  id="label-meta-expiry"
                  className="text-[10px] font-bold text-black uppercase tracking-wider flex items-center gap-1.5"
                >
                  <Clock className="w-3.5 h-3.5 text-indigo-500" /> Document
                  Expiration
                </h3>
                <div className="flex items-center gap-2">
                  {activeMeta.expiresAt && (
                    <button
                      id="meta-remove-expiry-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveExpiry();
                      }}
                      className="text-[10px] text-rose-600 hover:text-rose-800 font-bold transition-all cursor-pointer"
                    >
                      Clear Expiry
                    </button>
                  )}
                  {isExpirationSectionOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </div>

              {isExpirationSectionOpen && (
                <>
                  <p className="text-[10px] text-slate-500 mb-1.5 leading-normal">
                    Set a date and time for this file to be thrown away. The
                    date gets saves alongside the file, and it is used by the
                    system to automatically delete it. Use this when you are
                    creating slides with information that expires, like Ranger
                    social events.
                  </p>

                  {/* Expiry Timestamp Input */}
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      id="input-meta-expires-at"
                      type="datetime-local"
                      value={
                        activeMeta.expiresAt
                          ? new Date(
                              new Date(activeMeta.expiresAt).getTime() -
                                new Date().getTimezoneOffset() * 60000,
                            )
                              .toISOString()
                              .slice(0, 16)
                          : ""
                      }
                      onChange={(e) => {
                        if (e.target.value) {
                          onUpdateMetadata({
                            expiresAt: new Date(e.target.value).toISOString(),
                          });
                        } else {
                          onUpdateMetadata({ expiresAt: null });
                        }
                      }}
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white focus:border-indigo-500 transition-all"
                    />
                  </div>

                  {/* Quick Presets for Demo */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                      QUICK EXPIRY PRESETS (FOR PROTOTYPE REVIEW):
                    </span>
                    <div
                      id="expiry-presets-list"
                      className="grid grid-cols-4 gap-1"
                    >
                      <button
                        id="expiry-preset-1h"
                        onClick={() => handleQuickExpiryPreset(60 * 60)}
                        className="py-1.5 px-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 hover:border-indigo-200 text-indigo-700 text-[9px] font-bold rounded-lg transition-all cursor-pointer text-center"
                      >
                        +1h
                      </button>
                      <button
                        id="expiry-preset-12h"
                        onClick={() => handleQuickExpiryPreset(12 * 60 * 60)}
                        className="py-1.5 px-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 hover:border-indigo-200 text-indigo-700 text-[9px] font-bold rounded-lg transition-all cursor-pointer text-center"
                      >
                        +12h
                      </button>
                      <button
                        id="expiry-preset-24h"
                        onClick={() => handleQuickExpiryPreset(24 * 60 * 60)}
                        className="py-1.5 px-1 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 hover:border-indigo-200 text-indigo-700 text-[9px] font-bold rounded-lg transition-all cursor-pointer text-center"
                      >
                        +24h
                      </button>
                      <button
                        id="expiry-preset-reset"
                        onClick={handleRemoveExpiry}
                        className="py-1.5 px-1 bg-rose-50 hover:bg-rose-100 border border-rose-100 hover:border-rose-200 text-rose-700 text-[9px] font-bold rounded-lg transition-all cursor-pointer text-center"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  <div
                    id="metadata-expiry-countdown-display"
                    className="mt-3.5 bg-slate-50 border border-slate-150 rounded-xl p-2.5 flex items-center justify-between text-[11px]"
                  >
                    <span className="text-slate-500 font-semibold">
                      Archive Status:
                    </span>
                    <div className="flex items-center gap-1.5 font-bold">
                      <Clock
                        className={`w-3.5 h-3.5 ${isArchived ? "text-amber-500" : "text-emerald-500 animate-pulse"}`}
                      />
                      <span
                        className={
                          isArchived ? "text-amber-700" : "text-emerald-700"
                        }
                      >
                        {formatTimeRemaining(activeMeta.expiresAt)}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {activeTab === "decks" && (
          <div id="decks-tab-container" className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-black uppercase">
                Available Decks
              </span>
              <button
                id="sidebar-new-deck-btn"
                onClick={onNewPresentation}
                className="flex items-center gap-1 text-[10px] text-indigo-600 hover:text-indigo-800 font-bold border border-indigo-200 rounded px-2 py-1 bg-indigo-50/50 hover:bg-indigo-50 transition-all cursor-pointer shadow-sm"
              >
                <FilePlus className="w-3 h-3" /> New Deck
              </button>
            </div>

            <div id="saved-decks-list" className="space-y-2">
              {presentations.map((pres) => {
                const isActive = pres.id === activeId;
                const isPresArchived = pres.metadata.expiresAt
                  ? new Date(pres.metadata.expiresAt).getTime() <=
                    currentTime.getTime()
                  : false;

                return (
                  <div
                    id={`deck-item-container-${pres.id}`}
                    key={pres.id}
                    className={`p-3 rounded-xl border transition-all flex flex-col justify-between group hover:shadow-sm ${
                      isActive
                        ? "border-indigo-600 bg-indigo-50/20"
                        : "border-slate-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <button
                        id={`deck-select-btn-${pres.id}`}
                        onClick={() => onSelectPresentation(pres.id)}
                        className="flex-1 text-left cursor-pointer focus:outline-none"
                      >
                        <span className="text-xs font-bold text-slate-800 block truncate group-hover:text-indigo-700 transition-all">
                          {pres.metadata.title || "Untitled Presentation"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                          Creator: {pres.metadata.creator || "None"} •{" "}
                          {pres.slides.length} slide
                          {pres.slides.length !== 1 ? "s" : ""}
                        </span>
                      </button>

                      {presentations.length > 1 && (
                        <button
                          id={`deck-delete-btn-${pres.id}`}
                          onClick={() => onDeletePresentation(pres.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                          title="Delete Presentation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                      <div className="flex items-center gap-1">
                        {isPresArchived ? (
                          <span
                            id={`deck-status-archived-${pres.id}`}
                            className="inline-flex items-center gap-0.5 bg-amber-50 text-amber-700 font-bold px-1.5 py-0.5 rounded border border-amber-200"
                          >
                            <Lock className="w-2.5 h-2.5" /> Archived
                          </span>
                        ) : (
                          <span
                            id={`deck-status-active-${pres.id}`}
                            className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded border border-emerald-200"
                          >
                            <CheckCircle2 className="w-2.5 h-2.5" /> Active
                          </span>
                        )}
                      </div>
                      <span className="text-slate-400 font-medium truncate max-w-[120px]">
                        {pres.metadata.expiresAt
                          ? formatTimeRemaining(pres.metadata.expiresAt)
                          : "Never expires"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Backup & Recovery Controls */}
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Backup & Recovery
              </span>
              <p className="text-[10px] text-slate-500 leading-normal">
                Your decks are safely cached in this browser. Export a backup
                file to keep them secure or move them to another machine.
              </p>
              <div className="flex gap-2">
                <button
                  id="backup-export-btn"
                  onClick={handleExportDecksJSON}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 font-bold text-[10px] rounded-lg transition-all cursor-pointer shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" /> Save Backup
                </button>
                <label
                  id="backup-import-label"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2 bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-100 text-indigo-700 font-bold text-[10px] rounded-lg transition-all cursor-pointer shadow-sm text-center"
                >
                  <FolderOpen className="w-3.5 h-3.5" /> Restore
                  <input
                    id="backup-import-file-input"
                    type="file"
                    accept=".json"
                    onChange={handleImportDecksJSON}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
