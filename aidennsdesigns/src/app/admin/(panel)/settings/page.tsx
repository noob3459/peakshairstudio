import { requireOwner } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { SettingsEditor } from "@/components/admin/settings-editor";

export default async function SettingsPage() {
  await requireOwner();
  return (<><h1>Site settings</h1><SettingsEditor part="site" initial={await getSettings()} /></>);
}
