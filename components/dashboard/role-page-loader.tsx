import { LoaderCircle } from "lucide-react";

export function RolePageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <LoaderCircle className="size-7 animate-spin text-lime-600" />
    </div>
  );
}
