
import React from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { Palette, Users, Camera } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface BrandIdentity {
  id: string;
  values: string[];
  age_range_min: number;
  age_range_max: number;
  gender: 'all' | 'male' | 'female' | 'non_binary';
  income_level: 'low' | 'medium' | 'high' | 'luxury';
  characteristics: string[];
  photography_mood: string;
  photography_lighting: string;
}

const LoadingSkeleton = () => {
  return (
    <div className="space-y-8">
      {/* Brand Values Section Skeleton */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 w-20" />
          </div>
          <div className="flex flex-wrap gap-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-32" />
            ))}
          </div>
        </div>
      </section>

      {/* Target Audience Section Skeleton */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </section>

      {/* Photography Section Skeleton */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-32" />
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const Brand = () => {
  const { toast } = useToast();
  const [newValue, setNewValue] = React.useState("");
  const [newCharacteristic, setNewCharacteristic] = React.useState("");

  const { data: brandIdentity, isLoading } = useQuery({
    queryKey: ['brandIdentity'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('brand_identity')
        .select('*')
        .maybeSingle();

      if (error) throw error;
      return data as BrandIdentity;
    }
  });

  const mutation = useMutation({
    mutationFn: async (values: Partial<BrandIdentity>) => {
      if (brandIdentity?.id) {
        const { error } = await supabase
          .from('brand_identity')
          .update(values)
          .eq('id', brandIdentity.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('brand_identity')
          .insert([{ ...values, user_id: (await supabase.auth.getUser()).data.user?.id }]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Brand identity updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update brand identity",
        variant: "destructive",
      });
      console.error('Error updating brand identity:', error);
    }
  });

  const handleAddValue = () => {
    if (!newValue.trim()) return;
    const updatedValues = [...(brandIdentity?.values || []), newValue.trim()];
    mutation.mutate({ values: updatedValues });
    setNewValue("");
  };

  const handleRemoveValue = (index: number) => {
    const updatedValues = (brandIdentity?.values || []).filter((_, i) => i !== index);
    mutation.mutate({ values: updatedValues });
  };

  const handleAddCharacteristic = () => {
    if (!newCharacteristic.trim()) return;
    const updatedCharacteristics = [...(brandIdentity?.characteristics || []), newCharacteristic.trim()];
    mutation.mutate({ characteristics: updatedCharacteristics });
    setNewCharacteristic("");
  };

  const handleRemoveCharacteristic = (index: number) => {
    const updatedCharacteristics = (brandIdentity?.characteristics || []).filter((_, i) => i !== index);
    mutation.mutate({ characteristics: updatedCharacteristics });
  };

  const breadcrumbItems = [
    { label: "Home", href: "/" },
    { label: "Brand Identity", href: "/brand" },
  ];

  if (isLoading) {
    return (
      <div className="container py-6">
        <Breadcrumbs items={breadcrumbItems} className="mb-6" />
        <Skeleton className="h-8 w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="col-span-2">
            <LoadingSkeleton />
          </div>
          <div className="col-span-1">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-6">
      <Breadcrumbs items={breadcrumbItems} className="mb-6" />
      
      <h1 className="text-2xl font-semibold text-polaris-text mb-8">Brand Identity</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-2 space-y-8">
          {/* Brand Values Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xl font-semibold text-polaris-text">
              <Palette className="h-6 w-6" />
              <h2>Brand Values</h2>
            </div>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add a brand value"
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddValue()}
                />
                <Button onClick={handleAddValue}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {brandIdentity?.values?.map((value, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-polaris-background px-3 py-2 rounded-md"
                  >
                    <span>{value}</span>
                    <button
                      onClick={() => handleRemoveValue(index)}
                      className="text-polaris-secondary hover:text-polaris-text"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Target Audience Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xl font-semibold text-polaris-text">
              <Users className="h-6 w-6" />
              <h2>Target Audience</h2>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Age Range (Minimum)</Label>
                <Input
                  type="number"
                  value={brandIdentity?.age_range_min || ""}
                  onChange={(e) => mutation.mutate({ age_range_min: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Age Range (Maximum)</Label>
                <Input
                  type="number"
                  value={brandIdentity?.age_range_max || ""}
                  onChange={(e) => mutation.mutate({ age_range_max: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select
                  value={brandIdentity?.gender || 'all'}
                  onValueChange={(value: 'all' | 'male' | 'female' | 'non_binary') => 
                    mutation.mutate({ gender: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="non_binary">Non-binary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Income Level</Label>
                <Select
                  value={brandIdentity?.income_level || 'medium'}
                  onValueChange={(value: 'low' | 'medium' | 'high' | 'luxury') => 
                    mutation.mutate({ income_level: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="luxury">Luxury</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Characteristics</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add an audience characteristic"
                  value={newCharacteristic}
                  onChange={(e) => setNewCharacteristic(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCharacteristic()}
                />
                <Button onClick={handleAddCharacteristic}>Add</Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {brandIdentity?.characteristics?.map((characteristic, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-polaris-background px-3 py-2 rounded-md"
                  >
                    <span>{characteristic}</span>
                    <button
                      onClick={() => handleRemoveCharacteristic(index)}
                      className="text-polaris-secondary hover:text-polaris-text"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Photography Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 text-xl font-semibold text-polaris-text">
              <Camera className="h-6 w-6" />
              <h2>Photography</h2>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Mood and Tone</Label>
                <Textarea
                  placeholder="Describe the mood and tone of your brand's photography"
                  value={brandIdentity?.photography_mood || ""}
                  onChange={(e) => mutation.mutate({ photography_mood: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Lighting</Label>
                <Textarea
                  placeholder="Describe your preferred lighting style"
                  value={brandIdentity?.photography_lighting || ""}
                  onChange={(e) => mutation.mutate({ photography_lighting: e.target.value })}
                />
              </div>
            </div>
          </section>
        </div>

        {/* Preview Panel */}
        <div className="col-span-1">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="w-full">
                Preview AI Context
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>AI Context Preview</SheetTitle>
                <SheetDescription>
                  This is how your brand identity will be interpreted by our AI
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-4">
                <div className="space-y-2">
                  <h3 className="font-medium">Brand Values</h3>
                  <p className="text-sm text-polaris-secondary">
                    {brandIdentity?.values?.join(', ') || 'No values defined'}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Target Audience</h3>
                  <p className="text-sm text-polaris-secondary">
                    {`${brandIdentity?.age_range_min || '?'}-${brandIdentity?.age_range_max || '?'} years old, 
                    ${brandIdentity?.gender === 'all' ? 'all genders' : brandIdentity?.gender}, 
                    ${brandIdentity?.income_level} income`}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Audience Characteristics</h3>
                  <p className="text-sm text-polaris-secondary">
                    {brandIdentity?.characteristics?.join(', ') || 'No characteristics defined'}
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium">Photography Style</h3>
                  <p className="text-sm text-polaris-secondary">
                    {brandIdentity?.photography_mood || 'No mood defined'}
                  </p>
                  <p className="text-sm text-polaris-secondary">
                    {brandIdentity?.photography_lighting || 'No lighting preferences defined'}
                  </p>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
};

export default Brand;

