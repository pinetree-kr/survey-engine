import { createClient } from "@/lib/supabase/server";
import { Trash } from "@/components/dashboard/Trash";

export default async function TrashPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return <Trash userId={user.id} />;
}

