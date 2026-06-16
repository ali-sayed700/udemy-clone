import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Mail, Book, DollarSign, Calendar, User } from "lucide-react";

export interface StudentDetails {
  studentName: string;
  studentEmail?: string;
  studentInitial: string;
  courseTitle: string;
  courseImage?: string;
  amount: number;
  courseId: string | undefined;
  date?: string;
}

interface StudentDetailsSheetProps {
  details: StudentDetails | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function StudentDetailsSheet({
  details,
  open,
  onOpenChange,
}: StudentDetailsSheetProps) {
  if (!details) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 overflow-y-auto">
        <SheetHeader className="mb-8">
          <SheetTitle className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <User className="w-5 h-5 text-indigo-500" />
            Student Details
          </SheetTitle>
          <SheetDescription className="text-slate-500 dark:text-slate-400">
            Purchase information for this student.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          {/* Profile Section */}
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-800">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-3 shadow-md">
              {details.studentInitial}
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              {details.studentName}
            </h3>
            {details.studentEmail && (
              <div className="flex items-center gap-1.5 mt-1 text-sm text-slate-500 dark:text-slate-400">
                <Mail className="w-3.5 h-3.5" />
                <a href={`mailto:${details.studentEmail}`} className="hover:text-indigo-500 transition-colors">
                  {details.studentEmail}
                </a>
              </div>
            )}
          </div>

          {/* Details List */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
              Purchase Information
            </h4>
            
            <div className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/50 flex items-center justify-center shrink-0">
                <Book className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Course Name</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">
                  {details.courseTitle}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-900/50 flex items-center justify-center shrink-0">
                <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400">Amount Paid</p>
                <p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">
                  ${details.amount.toFixed(2)}
                </p>
              </div>
            </div>

            {details.date && (
              <div className="flex items-start gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-900/50 flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Transaction Date</p>
                  <p className="text-sm font-medium text-slate-900 dark:text-white mt-0.5">
                    {new Date(details.date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
