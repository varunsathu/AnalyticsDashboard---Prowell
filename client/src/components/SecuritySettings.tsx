import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Key, Lock, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { clearEncryptionKey, regenerateEncryptionKey, isEncrypted } from "@/lib/encryption";

export default function SecuritySettings() {
  const [isRegenerating, setIsRegenerating] = useState(false);
  const { toast } = useToast();

  const handleRegenerateKey = async () => {
    if (!window.confirm(
      "Warning: Regenerating your encryption key will make existing encrypted data unreadable. " +
      "Only do this if you've lost access to your data or suspect your key is compromised. " +
      "This action cannot be undone. Continue?"
    )) {
      return;
    }

    setIsRegenerating(true);
    try {
      await regenerateEncryptionKey();
      toast({
        title: "Security Key Regenerated",
        description: "New encryption key created. Previous encrypted data will not be accessible.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to regenerate encryption key",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleClearData = () => {
    if (!window.confirm(
      "Warning: This will clear your local encryption key. " +
      "You will lose access to all encrypted data unless you have a backup. " +
      "This action cannot be undone. Continue?"
    )) {
      return;
    }

    clearEncryptionKey();
    toast({
      title: "Encryption Key Cleared",
      description: "Local security key has been removed",
    });
  };

  return (
    <div className="space-y-6">
      <Card className="bg-white border border-charcoal-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-teal-600" />
            <CardTitle className="text-lg text-charcoal-900">
              Data Security & Encryption
            </CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <Lock className="h-4 w-4" />
            <AlertDescription>
              Your sensitive data is automatically encrypted before being sent to the server. 
              This includes journal entries, notes content, and personal information.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border border-charcoal-200 rounded-lg">
              <h3 className="font-semibold text-charcoal-900 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Protected Data
              </h3>
              <ul className="text-sm text-charcoal-700 space-y-1">
                <li>• Journal entries content</li>
                <li>• Journal highlights & gratitude</li>
                <li>• Journal challenges & goals</li>
                <li>• Notes content</li>
                <li>• Personal reflections</li>
              </ul>
            </div>

            <div className="p-4 border border-charcoal-200 rounded-lg">
              <h3 className="font-semibold text-charcoal-900 mb-2 flex items-center gap-2">
                <Key className="w-4 h-4 text-blue-600" />
                Security Features
              </h3>
              <ul className="text-sm text-charcoal-700 space-y-1">
                <li>• AES-256-GCM encryption</li>
                <li>• Client-side encryption</li>
                <li>• Unique encryption keys</li>
                <li>• Local key storage</li>
                <li>• Zero-knowledge architecture</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t border-charcoal-200">
            <h3 className="font-semibold text-charcoal-900 mb-3">Security Actions</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-charcoal-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-charcoal-900">Encryption Status</h4>
                  <p className="text-sm text-charcoal-600">
                    Client-side encryption is active and protecting your data
                  </p>
                </div>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border border-charcoal-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-charcoal-900">Regenerate Encryption Key</h4>
                  <p className="text-sm text-charcoal-600">
                    Create a new encryption key (will make old data unreadable)
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRegenerateKey}
                  disabled={isRegenerating}
                  className="text-orange-600 hover:text-orange-700"
                >
                  <Key className="w-4 h-4 mr-1" />
                  {isRegenerating ? "Regenerating..." : "Regenerate"}
                </Button>
              </div>

              <div className="flex items-center justify-between p-3 border border-charcoal-200 rounded-lg">
                <div>
                  <h4 className="font-medium text-charcoal-900">Clear Local Key</h4>
                  <p className="text-sm text-charcoal-600">
                    Remove encryption key from this device
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearData}
                  className="text-red-600 hover:text-red-700"
                >
                  <AlertTriangle className="w-4 h-4 mr-1" />
                  Clear Key
                </Button>
              </div>
            </div>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Your encryption key is stored locally in your browser. 
              If you clear browser data or use a different device, you'll need to regenerate 
              the key (which will make previous encrypted data unreadable).
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}