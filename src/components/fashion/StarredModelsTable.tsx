
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Star, Users, Trash } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  onDeleteModel: (modelId: string) => void;
  onImageClick: (model: Model) => void;
  showPlanLimitWarning: boolean;
  onUpgrade: () => void;
}

export const StarredModelsTable = ({
  models,
  onDeleteModel,
  onImageClick,
  showPlanLimitWarning,
  onUpgrade
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
        {showPlanLimitWarning && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertDescription className="text-yellow-800">
              You have reached the maximum number of models of your plan. Please{' '}
              <button 
                onClick={onUpgrade}
                className="underline hover:no-underline text-yellow-800 font-medium"
              >
                upgrade
              </button>
              {' '}to add more.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead className="w-16">Delete</TableHead>
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteModel(model.id)}
                    className="h-8 w-8 text-gray-500 hover:text-red-500 hover:bg-red-50"
                  >
                    <Trash className="h-4 w-4" />
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
