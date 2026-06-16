// import { logger } from "@/lib/logger";
import { authFetchGraphQL } from "@/lib/api/fetchGraphqlServer";
import type { Order } from "@/types/order.types";
import InstructorOrdersClient from "./InstructorOrdersClient";

import { DASHBOARD_ORDERS_QUERY } from "@/lib/graphql/dashboard";
import { toast } from "react-toastify";

interface DashboardOrdersData {
  dashboardOrders: Order[];
}

export default async function InstructorOrdersPage() {
  let orders: Order[] = [];

  try {
    const data = (await authFetchGraphQL(
      DASHBOARD_ORDERS_QUERY,
    )) as DashboardOrdersData;
    orders = data.dashboardOrders || [];
  } catch (error) {
    // throw new Error(`Failed to fetch dashboard orders: ${error}`);
    toast.error(`Failed to fetch dashboard orders: ${error}`);
    // logger.error("Failed to fetch dashboard orders:", error as Error);
  }

  return <InstructorOrdersClient initialOrders={orders} />;
}
