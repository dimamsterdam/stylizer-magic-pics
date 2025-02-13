
import React from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModelAttributes {
  gender: "Male" | "Female";
  bodyType: "Slim" | "Athletic" | "Curvy" | "Plus Size";
  age: "18-25" | "25-35" | "35-45" | "45+";
  ethnicity: "Asian" | "Black" | "Caucasian" | "Hispanic" | "Middle Eastern" | "Mixed";
  hairLength: "Short" | "Medium" | "Long";
  hairColor: "Black" | "Brown" | "Blonde" | "Red" | "Gray" | "Other";
  pose: "Natural" | "Professional" | "Casual" | "Dynamic";
}

interface ModelPromptBuilderProps {
  attributes: ModelAttributes;
  onChange: (key: keyof ModelAttributes, value: string) => void;
}

interface AttributeOption {
  label: string;
  value: string;
}

const attributeOptions: Record<keyof ModelAttributes, AttributeOption[]> = {
  gender: [
    { label: "Female", value: "Female" },
    { label: "Male", value: "Male" },
  ],
  bodyType: [
    { label: "Slim", value: "Slim" },
    { label: "Athletic", value: "Athletic" },
    { label: "Curvy", value: "Curvy" },
    { label: "Plus Size", value: "Plus Size" },
  ],
  age: [
    { label: "18-25", value: "18-25" },
    { label: "25-35", value: "25-35" },
    { label: "35-45", value: "35-45" },
    { label: "45+", value: "45+" },
  ],
  ethnicity: [
    { label: "Asian", value: "Asian" },
    { label: "Black", value: "Black" },
    { label: "Caucasian", value: "Caucasian" },
    { label: "Hispanic", value: "Hispanic" },
    { label: "Middle Eastern", value: "Middle Eastern" },
    { label: "Mixed", value: "Mixed" },
  ],
  hairLength: [
    { label: "Short", value: "Short" },
    { label: "Medium", value: "Medium" },
    { label: "Long", value: "Long" },
  ],
  hairColor: [
    { label: "Black", value: "Black" },
    { label: "Brown", value: "Brown" },
    { label: "Blonde", value: "Blonde" },
    { label: "Red", value: "Red" },
    { label: "Gray", value: "Gray" },
    { label: "Other", value: "Other" },
  ],
  pose: [
    { label: "Natural", value: "Natural" },
    { label: "Professional", value: "Professional" },
    { label: "Casual", value: "Casual" },
    { label: "Dynamic", value: "Dynamic" },
  ],
};

const AttributeSelector = ({
  attribute,
  value,
  options,
  onChange,
}: {
  attribute: string;
  value: string;
  options: AttributeOption[];
  onChange: (value: string) => void;
}) => {
  const [open, setOpen] = React.useState(false);
  const [customValue, setCustomValue] = React.useState("");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="justify-between hover:bg-muted/50 focus:ring-1 focus:ring-offset-1 min-w-[120px]"
        >
          <span className="truncate">{value || `any ${attribute}`}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <div className="space-y-1 p-2">
          {options.map((option) => (
            <Button
              key={option.value}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-2",
                value === option.value && "bg-muted"
              )}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {value === option.value && <Check className="h-4 w-4" />}
              {option.label}
            </Button>
          ))}
          <div className="px-2 py-1">
            <Input
              placeholder="Custom value..."
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && customValue) {
                  onChange(customValue);
                  setCustomValue("");
                  setOpen(false);
                }
              }}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export const ModelPromptBuilder: React.FC<ModelPromptBuilderProps> = ({
  attributes,
  onChange,
}) => {
  return (
    <div className="space-y-4 text-lg">
      <p className="leading-relaxed">
        I want to create a{" "}
        <AttributeSelector
          attribute="gender"
          value={attributes.gender}
          options={attributeOptions.gender}
          onChange={(value) => onChange("gender", value)}
        />{" "}
        fashion model with a{" "}
        <AttributeSelector
          attribute="body type"
          value={attributes.bodyType}
          options={attributeOptions.bodyType}
          onChange={(value) => onChange("bodyType", value)}
        />{" "}
        build, aged{" "}
        <AttributeSelector
          attribute="age"
          value={attributes.age}
          options={attributeOptions.age}
          onChange={(value) => onChange("age", value)}
        />
        .
      </p>
      <p className="leading-relaxed">
        The model should be of{" "}
        <AttributeSelector
          attribute="ethnicity"
          value={attributes.ethnicity}
          options={attributeOptions.ethnicity}
          onChange={(value) => onChange("ethnicity", value)}
        />{" "}
        ethnicity with{" "}
        <AttributeSelector
          attribute="hair length"
          value={attributes.hairLength}
          options={attributeOptions.hairLength}
          onChange={(value) => onChange("hairLength", value)}
        />{" "}
        <AttributeSelector
          attribute="hair color"
          value={attributes.hairColor}
          options={attributeOptions.hairColor}
          onChange={(value) => onChange("hairColor", value)}
        />{" "}
        hair.
      </p>
      <p className="leading-relaxed">
        The model should strike a{" "}
        <AttributeSelector
          attribute="pose"
          value={attributes.pose}
          options={attributeOptions.pose}
          onChange={(value) => onChange("pose", value)}
        />{" "}
        pose.
      </p>
    </div>
  );
};
