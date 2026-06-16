"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getCurrentUser } from "@/lib/api/services/auth.service";
import { confirmStripePayment } from "@/lib/api/services/payment.service";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const method = searchParams.get("method");
  const sessionId = searchParams.get("session_id");
  const courseIds = searchParams.get("courseIds");
  const amountStr = searchParams.get("amount");
  const singleCourseId = searchParams.get("courseId"); // legacy fallback
  const firstCourseId = courseIds ? courseIds.split(",")[0] : singleCourseId;

  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);

  useEffect(() => {
    async function handleEnrollment() {
      // If method is stripe, we need to confirm payment
      if (method === "stripe" && sessionId && courseIds && !enrolled) {
        setEnrolling(true);
        try {
          const user = await getCurrentUser();

          if (user?.userId) {
            const amount = amountStr ? parseFloat(amountStr) : 0;

            await confirmStripePayment({
              userId: user.userId,
              courseIds: courseIds,
              sessionId: sessionId,
              amount: amount,
            });
          }
          setEnrolled(true);
        } catch {
          throw new Error("there is an error in payments ,try again later ");
        } finally {
          setEnrolling(false);
        }
      } else {
        // PayPal handles enrollment directly in the capture order response
        // Or if parameters are missing
        setEnrolled(true);
      }
    }

    handleEnrollment();
  }, [sessionId, method, courseIds, amountStr, enrolled]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-50 via-indigo-50 to-purple-50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl shadow-indigo-100/50 p-8 text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-rrom-indigo-500 via-purple-500 to-pink-500"></div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-linear-to-br from-indigo-100 to-purple-100 rounded-full opacity-50"></div>
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-linear-to-br from-pink-100 to-rose-100 rounded-full opacity-50"></div>

        <div className="relative z-10">
          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 bg-linear-to-br from-emerald-400 to-green-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-200">
            <CheckCircle className="h-10 w-10 text-white" />
          </div>

          <div className="flex items-center justify-center gap-1 mb-2">
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-medium text-amber-600">
              Payment Successful
            </span>
            <Sparkles className="h-4 w-4 text-amber-400" />
          </div>

          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            Welcome to Your Course!
          </h1>
          <p className="text-slate-500 mb-8">
            {enrolling
              ? "Setting up your enrollment..."
              : "You are now enrolled and ready to start learning."}
          </p>

          <div className="space-y-3">
            {firstCourseId && (
              <Button
                asChild
                className="w-full bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 rounded-xl text-lg shadow-lg shadow-indigo-500/25 transition-all duration-300"
              >
                <Link href={`/course/${firstCourseId}/learn`}>
                  Start Learning
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            )}

            <Button
              variant="outline"
              asChild
              className="w-full py-6 rounded-xl text-lg mt-3"
            >
              <Link href="/course">Browse More Courses</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
