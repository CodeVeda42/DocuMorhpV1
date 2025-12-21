import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { CURRENT_ORG } from '../lib/mockData';
import { Save, Trash2, Shield, User, Check, Loader2, AlertCircle } from 'lucide-react';
import { Modal } from '../components/ui/Modal';
import { useUser } from '../hooks/useUser';

export const Settings = () => {
  const { user, updateProfile } = useUser();
  const [showClearModal, setShowClearModal] = useState(false);
  const [fullName, setFullName] = useState(user.name);
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync local state if user updates elsewhere (e.g. header)
  useEffect(() => {
    setFullName(user.name);
  }, [user.name]);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await updateProfile({ name: fullName });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch (err) {
      console.error(err);
      setError("Failed to save changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearData = () => {
    // In a real app, this would call an API endpoint
    alert("Data clear request sent.");
    setShowClearModal(false);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Settings</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage your organization and preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Profile Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
              <Input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
              <Input 
                type="email" 
                value={user.email}
                disabled
                className="bg-slate-50 text-slate-500 dark:bg-slate-950/50 dark:text-slate-500 cursor-not-allowed border-slate-200 dark:border-slate-800"
              />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={handleSaveProfile} disabled={isSaving || isSaved}>
                {isSaving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : isSaved ? (
                  <Check className="h-4 w-4 mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isSaving ? 'Saving...' : isSaved ? 'Saved!' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
            <Shield className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            Organization
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Organization Name</label>
              <Input 
                type="text" 
                defaultValue={CURRENT_ORG.name}
                placeholder="Organization name"
              />
            </div>
             <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Current Plan</label>
              <div className="flex items-center h-10 px-3 rounded-md border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300">
                <span className="uppercase font-bold text-xs bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 px-2 py-1 rounded mr-2">
                    {CURRENT_ORG.plan}
                </span>
                <span className="text-sm text-slate-500 dark:text-slate-400">Enterprise features enabled</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-red-100 dark:border-red-900/30">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-500 flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
                <h4 className="font-medium text-slate-900 dark:text-slate-200">Clear All Data</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">Permanently delete all documents and extracted data.</p>
            </div>
            <Button variant="danger" onClick={() => setShowClearModal(true)}>Clear Data</Button>
          </div>
        </CardContent>
      </Card>

      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Confirm Data Deletion"
        footer={
            <>
                <Button variant="ghost" onClick={() => setShowClearModal(false)}>Cancel</Button>
                <Button variant="danger" onClick={handleClearData}>Yes, Delete Everything</Button>
            </>
        }
      >
        <p className="text-slate-600 dark:text-slate-300">
            This action is irreversible. All your uploaded documents and their extracted insights will be permanently removed from our servers.
        </p>
      </Modal>
    </div>
  );
};
