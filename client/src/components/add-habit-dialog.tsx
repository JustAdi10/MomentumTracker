import { useState } from "react";
import { useHabits, newHabitSchema } from "@/hooks/use-habits";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Watch, Loader2 } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

type AddHabitDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type FormValues = z.infer<typeof newHabitSchema>;

export default function AddHabitDialog({ open, onOpenChange }: AddHabitDialogProps) {
  const { addHabit, isAddingHabit } = useHabits();

  // Form setup
  const form = useForm<FormValues>({
    resolver: zodResolver(newHabitSchema),
    defaultValues: {
      name: "",
      description: "",
      frequency: "daily",
      icon: "",
      color: "",
      reminderTime: "",
    },
  });

  // Handle form submission
  const onSubmit = (data: FormValues) => {
    addHabit(data);
    // Reset form and close dialog after successful submission
    setTimeout(() => {
      if (!isAddingHabit) {
        form.reset();
        onOpenChange(false);
      }
    }, 300);
  };
  
  // Color options
  const colorOptions = [
    { label: "Blue", value: "#5D68F1" },
    { label: "Red", value: "#FF6B6B" },
    { label: "Green", value: "#4CAF50" },
    { label: "Orange", value: "#FF9800" },
    { label: "Purple", value: "#9C27B0" }
  ];
  
  // Icon options
  const iconOptions = [
    { label: "Exercise", value: "exercise" },
    { label: "Reading", value: "book" },
    { label: "Meditation", value: "meditation" },
    { label: "Water", value: "water" },
    { label: "Study", value: "study" }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-full md:max-w-[500px] mx-4 rounded-xl p-6">
        <DialogHeader>
          <DialogTitle className="text-center text-primary text-xl">Add New Habit</DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Create a new habit to track. Regular habits build momentum for lasting change.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Habit Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Morning Exercise" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="30 minutes of cardio" 
                      className="resize-none"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How often do you want to perform this habit?
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Icon (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select icon" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {iconOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color (Optional)</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select color" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {colorOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center">
                              <div 
                                className="w-4 h-4 rounded-full mr-2" 
                                style={{ backgroundColor: option.value }}
                              ></div>
                              {option.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="reminderTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reminder Time (Optional)</FormLabel>
                  <div className="flex items-center">
                    <Watch className="h-4 w-4 text-gray-400 mr-2" />
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                  </div>
                  <FormDescription>
                    Set a daily reminder for this habit
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end mt-6">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isAddingHabit}
                className="rounded-lg w-full sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isAddingHabit}
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg w-full sm:w-auto"
              >
                {isAddingHabit ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Habit'
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
