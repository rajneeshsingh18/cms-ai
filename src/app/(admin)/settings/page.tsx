import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
  
export default function SettingsPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold tracking-tight mb-6">Settings</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Site Settings</CardTitle>
                    <CardDescription>Manage your site settings here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Settings form will go here.</p>
                </CardContent>
            </Card>
        </div>
    );
}