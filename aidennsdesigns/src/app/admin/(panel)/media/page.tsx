import { requireOwner } from "@/lib/auth";
import { listMedia } from "@/lib/data";
import { MediaManager } from "@/components/admin/media-manager";

export default async function MediaPage() {
  await requireOwner();
  return (<><h1>Images & files</h1><MediaManager items={await listMedia()} /></>);
}
