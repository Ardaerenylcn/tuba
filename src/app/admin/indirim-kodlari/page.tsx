import { db } from "@/lib/db";
import { DiscountCodesClient } from "./client";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "İndirim Kodları | Admin" };

export default async function DiscountCodesPage() {
  const codes = await db.discountCode.findMany({ orderBy: { createdAt: "desc" } });
  return <DiscountCodesClient initial={codes.map((c) => ({ ...c, value: Number(c.value), minOrderAmount: c.minOrderAmount ? Number(c.minOrderAmount) : null }))} />;
}
