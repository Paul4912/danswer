import { Persona } from "@/app/admin/assistants/interfaces";
import { Bubble } from "@/components/Bubble";
import { AssistantIcon } from "@/components/assistants/AssistantIcon";
import { useSortable } from "@dnd-kit/sortable";
import React, { useState } from "react";
import { FiBookmark, FiImage, FiSearch } from "react-icons/fi";
import { MdDragIndicator } from "react-icons/md";

import { Badge } from "../ui/badge";

export const AssistantCard = ({
  assistant,
  isSelected,
  onSelect,
}: {
  assistant: Persona;
  isSelected: boolean;
  onSelect: (assistant: Persona) => void;
}) => {
  const renderBadgeContent = (tool: { name: string }) => {
    switch (tool.name) {
      case "SearchTool":
        return (
          <>
            <FiSearch className="h-3 w-3 my-auto" />
            <span>Search</span>
          </>
        );
      case "ImageGenerationTool":
        return (
          <>
            <FiImage className="h-3 w-3 my-auto" />
            <span>Image Gen</span>
          </>
        );
      default:
        return tool.name;
    }
  };

  return (
    <div
      onClick={() => onSelect(assistant)}
      className={`
        flex flex-col overflow-hidden  w-full rounded-xl px-3 py-4
        cursor-pointer
        ${isSelected ? "bg-background-125" : "hover:bg-background-100"}
      `}
    >
      <div className="flex items-center gap-4">
        <AssistantIcon size="xs" assistant={assistant} />
        <div className="overflow-hidden text-ellipsis break-words flex-grow">
          <div className="flex items-start justify-start gap-2">
            <span className="line-clamp-1 text-sm text-black font-semibold leading-tight">
              {assistant.name}
            </span>
            {assistant.tools.map((tool, index) => (
              <Badge key={index} size="xs" variant="secondary" className="ml-1">
                <div className="flex items-center gap-1">
                  {renderBadgeContent(tool)}
                </div>
              </Badge>
            ))}
          </div>
          <span className="line-clamp-2 text-xs text-text-700">
            {assistant.description}
          </span>
        </div>
      </div>
    </div>
  );
};

export function DraggableAssistantCard(props: {
  assistant: Persona;
  isSelected: boolean;
  onSelect: (assistant: Persona) => void;
  llmName: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.assistant.id.toString() });

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    transition,
    opacity: isDragging ? 0.9 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="overlow-y-scroll inputscroll flex items-center"
    >
      <div {...attributes} {...listeners} className="mr-1 cursor-grab">
        <MdDragIndicator className="h-3 w-3 flex-none" />
      </div>

      <AssistantCard {...props} />
    </div>
  );
}

export function DisplayAssistantCard({
  selectedPersona,
}: {
  selectedPersona: Persona;
}) {
  return (
    <div className="p-4 bg-background backdrop-blur-sm rounded-lg shadow-md border border-border-medium max-w-md w-full mx-auto transition-all duration-300 ease-in-out hover:shadow-lg">
      <div className="flex items-center mb-3">
        <AssistantIcon
          disableToolip
          size="medium"
          assistant={selectedPersona}
        />
        <h2 className="ml-3 text-xl font-semibold text-text-900">
          {selectedPersona.name}
        </h2>
      </div>
      <p className="text-sm text-text-600 mb-3 leading-relaxed">
        {selectedPersona.description}
      </p>
      {selectedPersona.tools.length > 0 ||
      selectedPersona.llm_relevance_filter ||
      selectedPersona.llm_filter_extraction ? (
        <div className="space-y-2">
          <h3 className="text-base font-medium text-text-900">Capabilities:</h3>
          <ul className="space-y-.5">
            {/* display all tools */}
            {selectedPersona.tools.map((tool, index) => (
              <li
                key={index}
                className="flex items-center text-sm text-text-700"
              >
                <span className="mr-2 text-text-500 opacity-70">•</span>{" "}
                {tool.display_name}
              </li>
            ))}
            {/* Built in capabilities */}
            {selectedPersona.llm_relevance_filter && (
              <li className="flex items-center text-sm text-text-700">
                <span className="mr-2 text-text-500 opacity-70">•</span>{" "}
                Advanced Relevance Filtering
              </li>
            )}
            {selectedPersona.llm_filter_extraction && (
              <li className="flex items-center text-sm text-text-700">
                <span className="mr-2 text-text-500 opacity-70">•</span> Smart
                Information Extraction
              </li>
            )}
          </ul>
        </div>
      ) : (
        <p className="text-sm text-text-600 italic">
          No specific capabilities listed for this specialist.
        </p>
      )}
    </div>
  );
}
