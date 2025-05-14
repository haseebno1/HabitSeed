import { useState } from "react";
import { Search, Plus, Info } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";

import { 
  habitTemplates, 
  HabitTemplate, 
  HabitCategory, 
  CATEGORY_EMOJIS,
  CATEGORY_NAMES,
  getAllCategories
} from "@/lib/habitTemplates";

interface HabitTemplateSelectorProps {
  onSelectTemplate: (template: HabitTemplate) => void;
  onClose?: () => void;
}

export function HabitTemplateSelector({ onSelectTemplate, onClose }: HabitTemplateSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory | "all">("all");
  
  // Get all available categories
  const categories = getAllCategories();
  
  // Filter templates based on search query and selected category
  const filteredTemplates = habitTemplates.filter(template => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });
  
  // Group templates by category
  const templatesByCategory = categories.reduce((acc, category) => {
    acc[category] = filteredTemplates.filter(template => template.category === category);
    return acc;
  }, {} as Record<HabitCategory, HabitTemplate[]>);

  // Handle template selection
  const handleSelect = (template: HabitTemplate) => {
    onSelectTemplate(template);
    if (onClose) onClose();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" onValueChange={(value) => setSelectedCategory(value as HabitCategory | "all")}>
        <TabsList className="mb-2 flex flex-wrap">
          <TabsTrigger value="all" className="text-xs">
            All
          </TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category} value={category} className="text-xs flex items-center gap-1">
              <span>{CATEGORY_EMOJIS[category]}</span>
              <span className="hidden sm:inline">{CATEGORY_NAMES[category]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all">
          <ScrollArea className="h-[50vh] pr-4">
            {categories.map((category) => (
              <div key={category} className="mb-6">
                {templatesByCategory[category]?.length > 0 && (
                  <>
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <span>{CATEGORY_EMOJIS[category]}</span>
                      <span>{CATEGORY_NAMES[category]}</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {templatesByCategory[category].map((template) => (
                        <TemplateCard 
                          key={template.id} 
                          template={template} 
                          onSelect={handleSelect} 
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
            
            {filteredTemplates.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>No templates found matching your search.</p>
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        {categories.map((category) => (
          <TabsContent key={category} value={category}>
            <ScrollArea className="h-[50vh] pr-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {templatesByCategory[category].map((template) => (
                  <TemplateCard 
                    key={template.id} 
                    template={template} 
                    onSelect={handleSelect} 
                  />
                ))}
              </div>
              
              {templatesByCategory[category]?.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No templates found matching your search.</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

// Individual template card component
function TemplateCard({ template, onSelect }: { template: HabitTemplate; onSelect: (template: HabitTemplate) => void }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <span className="text-xl">{template.emoji}</span>
            <CardTitle className="text-base">{template.name}</CardTitle>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Info className="h-4 w-4" />
                  <span className="sr-only">Details</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top" align="end" className="max-w-[250px]">
                <p className="text-xs">{template.description}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  <Badge variant="outline" className="text-[10px]">
                    {template.trackingType}
                    {template.targetValue && template.unit && ` (${template.targetValue} ${template.unit})`}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {template.frequency}
                    {template.frequency === "weekly" && template.frequencyData?.daysOfWeek?.length && 
                      ` (${template.frequencyData.daysOfWeek.length} days/week)`}
                  </Badge>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <CardDescription className="text-xs line-clamp-2">
          {template.description}
        </CardDescription>
      </CardHeader>
      <CardFooter className="pt-0">
        <Button variant="outline" size="sm" className="w-full flex items-center gap-1" onClick={() => onSelect(template)}>
          <Plus className="h-3.5 w-3.5" />
          <span>Add Habit</span>
        </Button>
      </CardFooter>
    </Card>
  );
} 