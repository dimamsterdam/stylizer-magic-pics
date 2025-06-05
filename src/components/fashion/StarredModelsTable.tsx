
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Star, Archive, Users } from "lucide-react";

interface Model {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  gender: string;
  starred: boolean;
}

interface StarredModelsTableProps {
  models: Model[];
  onUnstar: (modelId: string) => void;
}

export const StarredModelsTable = ({
  models,
  onUnstar
}: StarredModelsTableProps) => {
  if (models.length === 0) {
    return null;
  }

  return (
    <Card className="border-polaris-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Your Star Models ({models.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {models.map((model) => (
              <TableRow key={model.id}>
                <TableCell>
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center">
                    {model.imageUrl ? (
                      <img
                        src={model.imageUrl}
                        alt={model.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                    ) : (
                      <Users className="h-6 w-6 text-gray-400" />
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{model.name}</TableCell>
                <TableCell className="text-polaris-text-subdued">{model.gender}</TableCell>
                <TableCell>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUnstar(model.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
