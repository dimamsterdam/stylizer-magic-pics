
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Switch } from "@/components/ui/switch";
import { Star, Users } from "lucide-react";

interface Model {
  id: string;
  name: string;
  description: string;
  imageUrl: string | null;
  gender: string;
  starred: boolean;
  archived?: boolean;
}

interface StarredModelsTableProps {
  models: Model[];
  onToggleStatus: (modelId: string, archived: boolean) => void;
  onImageClick: (model: Model) => void;
}

export const StarredModelsTable = ({
  models,
  onToggleStatus,
  onImageClick
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
              <TableHead className="w-24">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {models.map((model) => (
              <TableRow key={model.id}>
                <TableCell>
                  <div 
                    className="w-12 h-12 rounded-lg overflow-hidden bg-gray-200 flex items-center justify-center cursor-pointer hover:opacity-75 transition-opacity"
                    onClick={() => onImageClick(model)}
                  >
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
                <TableCell className="text-polaris-text-subdued capitalize">{model.gender}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={!model.archived}
                      onCheckedChange={(checked) => onToggleStatus(model.id, !checked)}
                    />
                    <span className={`text-sm ${!model.archived ? 'text-green-600' : 'text-gray-500'}`}>
                      {!model.archived ? 'Active' : 'Archived'}
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
