import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Upload, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { useStore } from '../store/useStore';
import { parseCSVFile, getPreviewRows } from '../lib/parseCSV';
import { toast } from 'sonner';

type Step = 'upload' | 'preview' | 'importing';

export function ImportModal() {
  const { importModalOpen, closeImportModal, importQuestions } = useStore();
  const [step, setStep] = useState<Step>('upload');
  const [dragging, setDragging] = useState(false);
  const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([]);
  const [previewHeaders, setPreviewHeaders] = useState<string[]>([]);
  const [rawCsv, setRawCsv] = useState('');
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep('upload');
    setDragging(false);
    setPreviewRows([]);
    setPreviewHeaders([]);
    setRawCsv('');
    setError('');
  };

  const handleClose = () => {
    reset();
    closeImportModal();
  };

  const processFile = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a .csv file');
      return;
    }
    setError('');
    const text = await file.text();
    setRawCsv(text);
    const rows = getPreviewRows(text, 5);
    if (rows.length === 0) {
      setError('CSV appears to be empty or invalid');
      return;
    }
    setPreviewHeaders(Object.keys(rows[0] || {}));
    setPreviewRows(rows);
    setStep('preview');
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleConfirmImport = () => {
    setStep('importing');
    setTimeout(() => {
      importQuestions(rawCsv);
      toast.success('CSV imported successfully!', {
        description: `Loaded ${previewRows.length}+ questions`,
      });
      handleClose();
    }, 600);
  };

  return (
    <AnimatePresence>
      {importModalOpen && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={handleClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal */}
          <motion.div
            className="relative bg-white rounded-[32px] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)] border border-slate-200/60 w-full max-w-lg overflow-hidden"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-7 pt-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-[20px] font-display font-semibold text-[#0a1b33]">
                  {step === 'preview' ? 'Preview Import' : 'Import DSA Sheet'}
                </h2>
                <p className="text-[13px] text-slate-500 mt-0.5">
                  {step === 'preview'
                    ? 'Review first 5 rows before importing'
                    : 'Upload a CSV file to load your questions'}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-7">
              {/* Upload Step */}
              {step === 'upload' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-[24px] p-10 text-center cursor-pointer transition-all ${
                      dragging ? 'border-blue-400 bg-blue-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <div className="mx-auto w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                      <Upload className="w-6 h-6 text-blue-500" />
                    </div>
                    <p className="text-[15px] font-semibold text-[#0a1b33] mb-1">
                      Drop your CSV file here
                    </p>
                    <p className="text-[13px] text-slate-500">
                      or <span className="text-blue-600 font-medium">click to browse</span>
                    </p>
                  </div>

                  {error && (
                    <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 rounded-xl px-4 py-3">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="text-[13px]">{error}</span>
                    </div>
                  )}

                  {/* Format hint */}
                  <div className="mt-5 p-4 bg-slate-50 rounded-[16px]">
                    <p className="text-[12px] font-semibold text-slate-600 mb-2 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> Expected CSV columns
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {['Company', 'Title', 'Topic', 'Difficulty', 'LeetCode URL', 'GFG URL', 'Frequency'].map(col => (
                        <span key={col} className="px-2 py-0.5 bg-white border border-slate-200 rounded-full text-[11px] font-medium text-slate-600">
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Preview Step */}
              {step === 'preview' && (
                <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}>
                  <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 rounded-xl px-4 py-2.5 mb-4">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="text-[13px] font-medium">CSV parsed successfully — showing first 5 rows</span>
                  </div>

                  <div className="overflow-x-auto rounded-[16px] border border-slate-200">
                    <table className="w-full text-[12px]">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          {previewHeaders.slice(0, 5).map(h => (
                            <th key={h} className="px-3 py-2.5 text-left font-semibold text-slate-600 whitespace-nowrap">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewRows.map((row, i) => (
                          <tr key={i} className="border-b border-slate-100 last:border-0">
                            {previewHeaders.slice(0, 5).map(h => (
                              <td key={h} className="px-3 py-2 text-slate-600 max-w-[140px] truncate">
                                {row[h] || '—'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex gap-3 mt-5">
                    <button
                      onClick={reset}
                      className="flex-1 py-2.5 rounded-full border border-slate-200 text-[13px] font-semibold text-slate-600 hover:border-slate-300 transition-all"
                    >
                      Back
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={handleConfirmImport}
                      className="flex-1 py-2.5 rounded-full bg-[#0a152d] text-white text-[13px] font-semibold shadow-sm hover:shadow-md transition-all"
                    >
                      Confirm Import
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Importing */}
              {step === 'importing' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-12 h-12 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-[15px] font-semibold text-[#0a1b33]">Importing questions…</p>
                  <p className="text-[13px] text-slate-500 mt-1">Normalizing data and saving to local storage</p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
