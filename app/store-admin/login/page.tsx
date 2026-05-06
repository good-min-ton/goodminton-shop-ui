import { redirect } from "next/navigation";

export default function StoreAdminLoginRedirect(): never {
  redirect("/admin/login");
}
