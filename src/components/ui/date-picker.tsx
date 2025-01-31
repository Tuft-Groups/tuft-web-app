"use client";

import * as React from "react";
import { format, setDate } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function DatePicker({ selectedDate, onChange }: { selectedDate: Date | undefined; onChange: (date: Date | undefined) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant={"outline"} className={cn("w-[280px] justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
          <CalendarIcon className="w-4 h-4 mr-2" />
          {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={selectedDate} onSelect={onChange} initialFocus />
      </PopoverContent>
    </Popover>
  );
}
