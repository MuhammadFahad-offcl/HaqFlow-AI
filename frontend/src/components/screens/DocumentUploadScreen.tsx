import React, { useState, useEffect, useRef } from "react";
import { DocumentItem } from "../../types";
import { api } from "../../lib/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Alert, AlertTitle, AlertDescription } from "../ui/alert";
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  HelpCircle,
  FileCheck,
  RefreshCw,
  FolderOpen
} from "lucide-react";

interface DocumentUploadScreenProps {
  initialTargetDocId?: string;
  onProceedToActionPlan: () => void;
  onBackToMatches: () => void;
}

export function DocumentUploadScreen({
  initialTargetDocId,
  onProceedToActionPlan,
  onBackToMatches
}: DocumentUploadScreenProps) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(initialTargetDocId || null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [recentUploadMessage, setRecentUploadMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const docs = await api.getDocuments();
      setDocuments(docs);
      if (!selectedDocId && docs.length > 0) {
        // select first needed doc or first doc
        const needed = docs.find((d) => d.status === "needed");
        setSelectedDocId(needed ? needed.id : docs[0].id);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to load document vault.");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSimulation = async (docName: string, docId?: string, file?: File) => {
    setIsUploading(true);
    setErrorMsg(null);
    setRecentUploadMessage(null);

    try {
      const updated = await api.uploadDocument({
        name: docName,
        docId: docId || selectedDocId || undefined,
        fileSize: file ? `${Math.round((file.size / 1024) * 10) / 10} KB` : "1.6 MB",
        file
      });

      setDocuments((prev) =>
        prev.map((d) => (d.id === updated.id ? updated : d))
      );
      setSelectedDocId(updated.id);
      setRecentUploadMessage(`AI successfully scanned and extracted: ${updated.fileName}`);
    } catch (err: any) {
      setErrorMsg(err.message || "Document processing failed. Please retry.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleManualFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Real file is forwarded so live mode can POST it to /api/v1/analyze-document.
    // Mock mode ignores it and keeps its deterministic filename-based simulation.
    handleUploadSimulation(file.name, undefined, file);
  };

  const handleVerifyExtraction = async (docId: string) => {
    try {
      const verified = await api.verifyDocument(docId, "Verified correct by applicant.");
      setDocuments((prev) =>
        prev.map((d) => (d.id === verified.id ? verified : d))
      );
      setRecentUploadMessage("Extraction verified and added to eligibility proof record.");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to verify document.");
    }
  };

  const selectedDocument = documents.find((d) => d.id === selectedDocId);
  const missingDocs = documents.filter((d) => d.status === "needed");
  const readyDocs = documents.filter((d) => d.status === "uploaded" || d.status === "verified");

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-[#1e3a8a] border-t-transparent" />
        <h3 className="text-base font-semibold text-[#0f172a]">Loading document list...</h3>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="text-xs font-semibold text-[#1e3a8a] uppercase tracking-wider mb-1">
            Step 6 of 8 • Supporting Documents
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0f172a]">
            Upload & Check Your Documents
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-sans">
            HaqFlow reads your papers to confirm eligibility requirements so your application doesn't get stuck or denied.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            variant="default"
            onClick={onProceedToActionPlan}
            className="gap-1.5 text-xs font-semibold"
          >
            <span>Continue to Action Plan</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {recentUploadMessage && (
        <Alert variant="success">
          <AlertTitle className="text-xs font-semibold">Upload Complete</AlertTitle>
          <AlertDescription className="font-sans text-xs sm:text-sm">{recentUploadMessage}</AlertDescription>
        </Alert>
      )}

      {errorMsg && (
        <Alert variant="destructive">
          <AlertTitle className="text-xs font-semibold">Scan Error</AlertTitle>
          <AlertDescription className="flex items-center justify-between gap-2 mt-1">
            <span>{errorMsg}</span>
            <Button size="sm" variant="outline" onClick={loadDocuments} className="bg-white text-xs">
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Main 2-column layout: Upload & Extraction vs Required List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Upload Dropzone & Extraction Results (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Upload Dropzone */}
          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold flex items-center justify-between text-[#0f172a]">
                <span>Upload Document</span>
                {selectedDocument && (
                  <Badge variant="secondary" className="text-xs">
                    Target: {selectedDocument.title}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="font-sans text-xs text-slate-500">
                Upload PDFs, scans, or cell phone photos of your layoff notice, ID, or lease.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleManualFileSelected}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-[#1e3a8a] rounded-lg p-8 bg-slate-50/50 hover:bg-[#eff6ff]/30 transition-all cursor-pointer text-center group"
              >
                <div className="h-12 w-12 rounded-full bg-white group-hover:bg-[#1e3a8a] group-hover:text-white text-[#1e3a8a] flex items-center justify-center mb-3 transition-colors border border-slate-200 shadow-xs">
                  {isUploading ? (
                    <Sparkles className="h-6 w-6 animate-spin text-[#6b21a8]" />
                  ) : (
                    <UploadCloud className="h-6 w-6" />
                  )}
                </div>
                <p className="text-sm font-semibold text-[#0f172a] font-sans">
                  {isUploading ? "Reading document details..." : "Click to select a file or drag and drop here"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports PDF, JPG, and PNG files up to 10MB
                </p>
              </div>

              {/* Demo 1-Click Document Attachments */}
              <div className="bg-slate-50 rounded-lg border border-slate-200 p-4 space-y-2">
                <span className="block text-xs font-semibold text-[#1e3a8a]">
                  Quick Demo: Try Uploading a Sample File
                </span>
                <p className="text-xs text-slate-600 font-sans">
                  Tap any sample document below to simulate instant scanning and extraction:
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isUploading}
                    onClick={() =>
                      handleUploadSimulation("Employer_Separation_Notice_Apex.pdf", "doc-sep-notice")
                    }
                    className="text-xs h-8 bg-white"
                  >
                    + Layoff Separation Notice
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isUploading}
                    onClick={() =>
                      handleUploadSimulation("Infant_Birth_Record_Leo.pdf", "doc-birth-cert")
                    }
                    className="text-xs h-8 bg-white"
                  >
                    + Infant Birth Certificate
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    disabled={isUploading}
                    onClick={() =>
                      handleUploadSimulation("Signed_Residential_Lease_2026.pdf", "doc-lease")
                    }
                    className="text-xs h-8 bg-white"
                  >
                    + Residential Lease
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Extraction Result Display */}
          {selectedDocument?.extractedData ? (
            <Card className="border-slate-200 bg-white">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="flex items-center gap-1 text-xs font-semibold text-[#1e3a8a]">
                      <Sparkles className="h-3 w-3 text-[#6b21a8]" />
                      Document Information Read
                    </span>
                    <CardTitle className="text-xl font-bold text-[#0f172a]">
                      {selectedDocument.fileName || selectedDocument.title}
                    </CardTitle>
                  </div>

                  {/* Confidence Indicator */}
                  <div className="flex items-center gap-2">
                    {selectedDocument.extractedData.confidenceScore >= 80 ? (
                      <Badge variant="success" className="text-xs">
                        High Confidence ({selectedDocument.extractedData.confidenceScore}%)
                      </Badge>
                    ) : (
                      <Badge variant="low-confidence" className="text-xs">
                        Please Verify ({selectedDocument.extractedData.confidenceScore}%)
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 pt-4 text-xs sm:text-sm">
                {selectedDocument.extractedData.confidenceScore < 80 && (
                  <Alert variant="low-confidence" className="py-2.5">
                    <AlertDescription className="text-xs font-sans">
                      <strong>Please check this carefully:</strong> Some text was harder to read. Confirm the details below match your paper copy.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-lg border border-slate-200">
                  <div>
                    <span className="block text-xs text-slate-500 font-medium">Document Type</span>
                    <span className="font-semibold text-[#0f172a]">
                      {selectedDocument.extractedData.documentTypeRead}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 font-medium">Issuer / Employer</span>
                    <span className="font-semibold text-[#0f172a]">
                      {selectedDocument.extractedData.issuer}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 font-medium">Document Date</span>
                    <span className="font-semibold text-[#0f172a]">
                      {selectedDocument.extractedData.dateDetected}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-slate-500 font-medium">Key Details</span>
                    <span className="font-semibold text-[#0f172a]">
                      {selectedDocument.extractedData.keyFigures}
                    </span>
                  </div>
                </div>

                <div className="text-xs text-slate-700 bg-white p-3 rounded-md border border-slate-200 font-sans">
                  <strong>Verification Note:</strong> {selectedDocument.extractedData.notes}
                </div>
              </CardContent>

              <CardFooter className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {selectedDocument.extractedData.userVerified
                    ? "✓ Confirmed by you"
                    : "Please review and confirm below"}
                </span>

                {!selectedDocument.extractedData.userVerified ? (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleVerifyExtraction(selectedDocument.id)}
                    className="gap-1 text-xs font-medium"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Confirm Details Are Correct</span>
                  </Button>
                ) : (
                  <Badge variant="success">Verified & Ready</Badge>
                )}
              </CardFooter>
            </Card>
          ) : (
            <Card className="border-slate-200 bg-slate-50/50 text-center p-8">
              <FileText className="h-8 w-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-[#0f172a]">
                No document selected for preview
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Choose an item from the checklist on the right or upload a file above.
              </p>
            </Card>
          )}
        </div>

        {/* Right Column: Missing Documents Checklist (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="border-slate-200 bg-white">
            <CardHeader className="pb-3 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-bold text-[#0f172a]">
                  Document Checklist
                </CardTitle>
                <span className="text-xs text-slate-500">
                  {readyDocs.length} of {documents.length} ready
                </span>
              </div>
              <CardDescription className="font-sans text-xs text-slate-500">
                All documents needed for your matched benefit programs.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-3 space-y-2">
              {/* Missing list */}
              {missingDocs.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-[#b45309] block px-1">
                    Still Needed ({missingDocs.length})
                  </span>
                  {missingDocs.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-start justify-between gap-2 ${
                        selectedDocId === doc.id
                          ? "border-[#1e3a8a] bg-[#eff6ff]/50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <span className="font-semibold text-[#0f172a]">{doc.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-sans">
                          Needed for {doc.associatedProgramIds.length} program(s)
                        </p>
                      </div>
                      <Badge variant="warning" className="text-[10px]">
                        Needed
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              {/* Ready / Verified List */}
              {readyDocs.length > 0 && (
                <div className="space-y-1.5 pt-3">
                  <span className="text-xs font-semibold text-[#1e3a8a] block px-1">
                    Uploaded & Verified ({readyDocs.length})
                  </span>
                  {readyDocs.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDocId(doc.id)}
                      className={`p-3 rounded-lg border text-xs cursor-pointer transition-all flex items-start justify-between gap-2 ${
                        selectedDocId === doc.id
                          ? "border-[#1e3a8a] bg-[#eff6ff]/50"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                          <span className="font-semibold text-[#0f172a]">{doc.title}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-sans">{doc.fileName}</p>
                      </div>
                      <Badge
                        variant={doc.status === "verified" ? "success" : "secondary"}
                        className="text-[10px]"
                      >
                        {doc.status === "verified" ? "Verified" : "Uploaded"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
