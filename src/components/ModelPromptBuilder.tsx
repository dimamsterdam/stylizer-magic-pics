
import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, ChevronsUpDown, Shuffle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModelAttributes, attributeOptions, getRandomFromArray } from '@/types/modelTypes';

interface ModelPromptBuilderProps {
  attributes: ModelAttributes;
  onChange: (key: keyof ModelAttributes, value: string) => void;
  onPromptUpdate: (prompt: string) => void;
}

interface AttributeOption {
  label: string;
  value: string;
}

const AttributeSelector = ({
  attribute,
  value,
  options,
  onChange
}: {
  attribute: string;
  value: string;
  options: AttributeOption[];
  onChange: (value: string) => void;
}) => {
  const [open, setOpen] = React.useState(false);
  const [customValue, setCustomValue] = React.useState("");
  return <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="justify-between hover:bg-muted/50 focus:ring-1 focus:ring-offset-1 min-w-[90px] h-[30px] px-2 text-sm">
          <span className="truncate text-purple-500 font-medium">{value || `any ${attribute}`}</span>
          <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <div className="space-y-1 p-2">
          {options.map(option => <Button key={option.value} variant="ghost" className={cn("w-full justify-start gap-2", value === option.value && "bg-muted")} onClick={() => {
          onChange(option.value);
          setOpen(false);
        }}>
              {value === option.value && <Check className="h-4 w-4" />}
              {option.label}
            </Button>)}
          <div className="px-2 py-1">
            <Input placeholder="Custom value..." value={customValue} onChange={e => setCustomValue(e.target.value)} onKeyDown={e => {
            if (e.key === "Enter" && customValue) {
              onChange(customValue);
              setCustomValue("");
              setOpen(false);
            }
          }} />
          </div>
        </div>
      </PopoverContent>
    </Popover>;
};

export const ModelPromptBuilder: React.FC<ModelPromptBuilderProps> = ({
  attributes,
  onChange,
  onPromptUpdate
}) => {
  React.useEffect(() => {
    const prompt = `${attributes.gender} fashion model with ${attributes.bodyType} build, aged ${attributes.age}, ${attributes.ethnicity} ethnicity with ${attributes.hairLength} ${attributes.hairColor} hair, having a ${attributes.style} look.`;
    onPromptUpdate(prompt);
  }, [attributes, onPromptUpdate]);

  const handleRandomize = () => {
    onChange('gender', getRandomFromArray(attributeOptions.gender).value as ModelAttributes['gender']);
    onChange('bodyType', getRandomFromArray(attributeOptions.bodyType).value as ModelAttributes['bodyType']);
    onChange('age', getRandomFromArray(attributeOptions.age).value as ModelAttributes['age']);
    onChange('ethnicity', getRandomFromArray(attributeOptions.ethnicity).value as ModelAttributes['ethnicity']);
    onChange('hairLength', getRandomFromArray(attributeOptions.hairLength).value as ModelAttributes['hairLength']);
    onChange('hairColor', getRandomFromArray(attributeOptions.hairColor).value as ModelAttributes['hairColor']);
    onChange('style', getRandomFromArray(attributeOptions.style).value as ModelAttributes['style']);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-heading text-[--p-text]">Describe the fashion model</h3>
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleRandomize}
          className="flex items-center gap-2"
        >
          <Shuffle className="h-4 w-4" />
          Random
        </Button>
      </div>

      <div className="space-y-2.5 text-lg">
        <p className="leading-relaxed whitespace-nowrap">
          I want to create a{" "}
          <AttributeSelector attribute="gender" value={attributes.gender} options={attributeOptions.gender} onChange={value => onChange("gender", value)} />{" "}
          fashion model with a{" "}
          <AttributeSelector attribute="body type" value={attributes.bodyType} options={attributeOptions.bodyType} onChange={value => onChange("bodyType", value)} />{" "}
          build, aged{" "}
          <AttributeSelector attribute="age" value={attributes.age} options={attributeOptions.age} onChange={value => onChange("age", value)} />
          .
        </p>
        <p className="leading-relaxed whitespace-nowrap">
          The model should be of{" "}
          <AttributeSelector attribute="ethnicity" value={attributes.ethnicity} options={attributeOptions.ethnicity} onChange={value => onChange("ethnicity", value)} />{" "}
          ethnicity with{" "}
          <AttributeSelector attribute="hair length" value={attributes.hairLength} options={attributeOptions.hairLength} onChange={value => onChange("hairLength", value)} />{" "}
          <AttributeSelector attribute="hair color" value={attributes.hairColor} options={attributeOptions.hairColor} onChange={value => onChange("hairColor", value)} />{" "}
          hair.
        </p>
        <p className="leading-relaxed whitespace-nowrap">
          The model should have a{" "}
          <AttributeSelector attribute="style" value={attributes.style} options={attributeOptions.style} onChange={value => onChange("style", value)} />{" "}
          look.
        </p>
      </div>
    </div>
  );
};
