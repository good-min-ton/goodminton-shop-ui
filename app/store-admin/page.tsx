import { redirect } from "next/navigation";

export default function StoreAdminRootPage(): never {
  redirect("/store-admin/dashboard");
}
