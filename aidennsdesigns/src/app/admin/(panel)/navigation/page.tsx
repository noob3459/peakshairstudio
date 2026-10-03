import { requireOwner } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { SettingsEditor } from "@/components/admin/settings-editor";

export default async function NavigationPage() {
  await requireOwner();
  return (<><h1>Navigation & footer</h1><SettingsEditor part="navigation" initial={await getSettings()} /></>);
}
