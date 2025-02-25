
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const BrandNameForm = ({
  onSubmit
}: {
  onSubmit: (brandName: string) => void;
}) => {
  const [brandName, setBrandName] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (brandName.trim()) {
      onSubmit(brandName.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="brandName">What is the name of your brand?</Label>
        <Input
          id="brandName"
          type="text"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          placeholder="Enter your brand name"
          required
        />
      </div>
      <button
        type="submit"
        disabled={!brandName.trim()}
        className="w-full px-4 py-2 text-sm font-medium text-white bg-[#008060] rounded-md hover:bg-[#006e52] disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Continue
      </button>
    </form>
  );
};
