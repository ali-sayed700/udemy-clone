"use client";

import dynamic from "next/dynamic";

const ToastContainer = dynamic(
  () => import("react-toastify").then((mod) => mod.ToastContainer),
  { ssr: false },
);

export default function AppToaster() {
  return <ToastContainer position="bottom-right" closeOnClick limit={3} />;
}
