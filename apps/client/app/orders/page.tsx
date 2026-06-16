"use client";
import { logger } from "@/lib/logger";

import { useEffect, useState } from "react";
import { graphqlClient } from "@/lib/api/graphqlClient";
import { Order } from "@/types/order.types";
import { GET_MY_ORDERS } from "@/lib/graphql/orders";
import Link from "next/link";
import {
  ShoppingBag,
  CreditCard,
  ShieldCheck,
  Package,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await graphqlClient.post("", {
          query: GET_MY_ORDERS,
        });

        if (res.data?.data?.myOrders) {
          setOrders(res.data.data.myOrders);
        }
      } catch (error) {
        logger.error("Failed to load orders", error as Error);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">My Orders</h1>
          <p className="text-sm text-slate-500 mt-1">
            View all your purchases and payment details.
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 bg-white rounded-2xl border border-slate-100 text-center">
            <ShoppingBag className="h-16 w-16 text-slate-200 mb-4" />
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              No orders yet
            </h3>
            <p className="text-slate-500 max-w-sm mb-6">
              Once you purchase a course, your order history will appear here.
            </p>
            <Link
              href="/course_filter"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
            >
              Browse Courses
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-2">
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <p className="text-sm text-slate-500">Total Orders</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {orders.length}
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <p className="text-sm text-slate-500">Courses Purchased</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  {orders.reduce((sum, o) => sum + o.courses.length, 0)}
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <p className="text-sm text-slate-500">Total Spent</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">
                  $
                  {orders.reduce((sum, o) => sum + o.totalAmount, 0).toFixed(2)}
                </p>
              </div>
            </div>

            {/* Order cards */}
            {orders.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
              >
                {/* Order header */}
                <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 bg-slate-50/50 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      {order.paymentMethod === "stripe" ? (
                        <CreditCard className="h-4 w-4 text-indigo-500" />
                      ) : (
                        <ShieldCheck className="h-4 w-4 text-blue-500" />
                      )}
                      <span className="text-sm font-medium text-slate-700 capitalize">
                        {order.paymentMethod}
                      </span>
                    </div>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-sm text-slate-500">
                      {new Date(order.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        order.status === "completed"
                          ? "bg-emerald-50 text-emerald-700"
                          : order.status === "pending"
                            ? "bg-amber-50 text-amber-700"
                            : order.status === "refunded"
                              ? "bg-slate-100 text-slate-600"
                              : "bg-red-50 text-red-700"
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                    <span className="text-lg font-bold font-mono text-slate-900">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Order courses */}
                <div className="px-6 py-4 space-y-3">
                  {order.courses.map((course) => (
                    <Link
                      key={course._id}
                      href={`/course/${course._id}`}
                      className="flex items-center gap-4 hover:bg-slate-50 rounded-lg p-1 -mx-1 transition-colors"
                    >
                      <div className="w-16 h-10 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                        {course.image ? (
                          <Image
                            src={course.image}
                            alt={course.title}
                            width={64}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                            <Package className="h-4 w-4 text-indigo-300" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate hover:text-indigo-600 transition-colors">
                          {course.title}
                        </p>
                      </div>
                      <span className="text-sm font-mono text-slate-500">
                        ${course.price?.toFixed(2)}
                      </span>
                    </Link>
                  ))}
                </div>

                {/* Order ID */}
                <div className="px-6 py-3 bg-slate-50/30 border-t border-slate-50">
                  <p className="text-xs text-slate-400">
                    Order ID: {order._id}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
