'use client';

import React, { useState, useEffect, useRef } from 'react';
import { PlantPhoto, GrowthStage } from '@/types/garden';
import {
  fetchPlantPhotos,
  uploadPlantPhotoCloud,
  saveDemoPhoto,
  deletePlantPhoto,
  compressImageToWebP,
} from '@/lib/photo-storage';
import {
  Camera,
  Plus,
  Trash2,
  Calendar,
  Ruler,
  X,
  Loader2,
  AlertCircle,
  Eye,
  CheckCircle2,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';

interface PlantPhotoGalleryProps {
  plantId: string;
  plantNickname: string;
  currentStage: GrowthStage;
  isCloud: boolean;
}

export function PlantPhotoGallery({
  plantId,
  plantNickname,
  currentStage,
  isCloud,
}: PlantPhotoGalleryProps) {
  const [photos, setPhotos] = useState<PlantPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedPhotoForView, setSelectedPhotoForView] = useState<PlantPhoto | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Upload Form State
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [heightCm, setHeightCm] = useState<string>('');
  const [photoStage, setPhotoStage] = useState<GrowthStage>(currentStage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPhotos = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetchPlantPhotos(plantId, isCloud);
      if (res.error) {
        setErrorMessage(res.error);
      } else {
        setPhotos(res.photos);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to load photo history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotos();
  }, [plantId, isCloud]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileToUpload(file);
    const objUrl = URL.createObjectURL(file);
    setPreviewUrl(objUrl);
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileToUpload) return;

    setUploading(true);
    setErrorMessage(null);

    try {
      if (isCloud) {
        const res = await uploadPlantPhotoCloud({
          plantId,
          file: fileToUpload,
          caption: caption.trim() || undefined,
          growthStage: photoStage,
          heightCm: heightCm ? parseFloat(heightCm) : undefined,
        });

        if (res.error || !res.photo) {
          setErrorMessage(res.error || 'Failed to upload photo.');
        } else {
          setPhotos((prev) => [res.photo!, ...prev]);
          closeUploadModal();
        }
      } else {
        // Demo Mode via IndexedDB
        const { blob } = await compressImageToWebP(fileToUpload);
        const demoPhoto: PlantPhoto = {
          id: `demo-photo-${Date.now()}`,
          userPlantId: plantId,
          storagePath: `demo/${plantId}/${Date.now()}.webp`,
          caption: caption.trim() || undefined,
          growthStage: photoStage,
          heightCm: heightCm ? parseFloat(heightCm) : undefined,
          takenAt: new Date().toISOString(),
        };

        const saved = await saveDemoPhoto(demoPhoto, blob);
        setPhotos((prev) => [saved, ...prev]);
        closeUploadModal();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to process photo.');
    } finally {
      setUploading(false);
    }
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setFileToUpload(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setCaption('');
    setHeightCm('');
  };

  const handleDeletePhoto = async (photo: PlantPhoto) => {
    if (!confirm('Are you sure you want to delete this observation photo?')) return;

    try {
      const res = await deletePlantPhoto(photo, isCloud);
      if (res.success) {
        setPhotos((prev) => prev.filter((p) => p.id !== photo.id));
        if (selectedPhotoForView?.id === photo.id) {
          setSelectedPhotoForView(null);
        }
      } else {
        alert(res.error || 'Failed to delete photo.');
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting photo.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-serif font-bold text-base text-[#203027] flex items-center gap-2">
            <Camera size={18} className="text-[#174C35]" />
            <span>Chronological Visual Photo Journal</span>
          </h3>
          <p className="text-xs text-[#68766C]">
            {isCloud ? 'Encrypted & securely stored in private cloud vault.' : 'Stored locally on this device via browser IndexedDB.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#174C35] hover:bg-[#174C35] text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer min-h-[36px]"
        >
          <Plus size={14} />
          <span>Add Photo Observation</span>
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-xl bg-[#FBE9E2] border border-[#E4775D/30] text-xs text-[#963A23] font-medium flex items-center gap-2">
          <AlertCircle size={14} className="shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="py-12 flex flex-col items-center justify-center text-xs text-[#68766C] gap-2">
          <Loader2 size={20} className="animate-spin text-[#174C35]" />
          <span>Loading visual observations...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && photos.length === 0 && (
        <div className="py-10 px-4 rounded-2xl bg-white border border-dashed border-[#E3DFD2] text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#EAF1E4] text-[#174C35] flex items-center justify-center mx-auto">
            <ImageIcon size={22} />
          </div>
          <div className="max-w-sm mx-auto">
            <p className="font-serif font-bold text-sm text-[#203027]">
              No Visual Observations Yet
            </p>
            <p className="text-xs text-[#68766C] mt-1 leading-relaxed">
              Capture your first seedling photo to start tracking visual foliage changes, node expansion, and milestones over time.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#174C35] hover:bg-[#174C35] text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
          >
            <Camera size={13} />
            <span>Upload First Photo</span>
          </button>
        </div>
      )}

      {/* Photo Grid Gallery */}
      {!loading && photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {photos.map((photo) => {
            const dateStr = new Date(photo.takenAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={photo.id}
                className="group relative rounded-xl bg-white border border-[#E3DFD2] overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col"
              >
                {/* Photo Thumbnail */}
                <div
                  className="aspect-square bg-[#E3DFD2] relative cursor-pointer overflow-hidden"
                  onClick={() => setSelectedPhotoForView(photo)}
                >
                  {photo.signedUrl ? (
                    <img
                      src={photo.signedUrl}
                      alt={photo.caption || `${plantNickname} observation`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-[#68766C]">
                      Loading...
                    </div>
                  )}

                  {/* Stage Tag Overlay */}
                  {photo.growthStage && (
                    <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-[#203027]/80 backdrop-blur-xs text-white text-[10px] font-semibold">
                      {photo.growthStage}
                    </span>
                  )}
                </div>

                {/* Metadata Card Footer */}
                <div className="p-2 text-xs flex-1 flex flex-col justify-between">
                  <div className="min-w-0">
                    <p className="text-[11px] font-bold text-[#174C35] flex items-center gap-1">
                      <Calendar size={11} className="text-[#174C35]" />
                      <span>{dateStr}</span>
                      {photo.heightCm && (
                        <span className="ml-auto text-[#68766C] font-medium flex items-center gap-0.5">
                          <Ruler size={10} />
                          {photo.heightCm} cm
                        </span>
                      )}
                    </p>
                    {photo.caption && (
                      <p className="text-[11px] text-[#203027] mt-0.5 line-clamp-2 leading-tight">
                        {photo.caption}
                      </p>
                    )}
                  </div>

                  <div className="pt-1.5 mt-1 border-t border-[#E3DFD2] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setSelectedPhotoForView(photo)}
                      className="text-[10px] font-semibold text-[#174C35] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Eye size={11} />
                      <span>View</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeletePhoto(photo)}
                      className="text-[10px] text-[#963A23] hover:text-[#963A23] p-0.5 rounded transition-colors cursor-pointer"
                      title="Delete photo"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#203027]/70 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md bg-[#F8F6EE] rounded-2xl border border-[#E3DFD2] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-[#E3DFD2] bg-white flex items-center justify-between">
              <h4 className="font-serif font-bold text-base text-[#203027] flex items-center gap-2">
                <Camera size={16} className="text-[#174C35]" />
                <span>Upload Observation Photo</span>
              </h4>
              <button
                type="button"
                onClick={closeUploadModal}
                className="p-1.5 rounded-lg text-[#68766C] hover:bg-[#E3DFD2] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-5 space-y-4 overflow-y-auto">
              {/* File Selector */}
              <div>
                <label className="block text-xs font-bold text-[#174C35] uppercase tracking-wider mb-1.5">
                  1. Choose Photo (JPEG, PNG, WebP)
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  required
                  className="w-full text-xs text-[#68766C] file:mr-3 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-[#174C35] file:text-white hover:file:bg-[#174C35] file:cursor-pointer"
                />
              </div>

              {/* Preview */}
              {previewUrl && (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black/5 border border-[#E3DFD2]">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-contain"
                  />
                  <span className="absolute bottom-1 right-2 text-[10px] bg-black/60 text-white px-2 py-0.5 rounded-md">
                    Will be optimized to WebP
                  </span>
                </div>
              )}

              {/* Stage & Height */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#203027] mb-1">
                    Growth Stage
                  </label>
                  <select
                    value={photoStage}
                    onChange={(e) => setPhotoStage(e.target.value as GrowthStage)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E3DFD2] text-xs text-[#203027]"
                  >
                    <option value="Seed">Seed</option>
                    <option value="Germination">Germination</option>
                    <option value="Seedling">Seedling</option>
                    <option value="Growing">Growing</option>
                    <option value="Mature">Mature</option>
                    <option value="Harvested">Harvested</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#203027] mb-1">
                    Measured Height (cm)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="500"
                    placeholder="e.g. 14.5"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-[#E3DFD2] text-xs text-[#203027]"
                  />
                </div>
              </div>

              {/* Caption */}
              <div>
                <label className="block text-xs font-semibold text-[#203027] mb-1">
                  Observation Note / Caption
                </label>
                <textarea
                  rows={2}
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="e.g. First flower bud forming at apex; foliage deep vibrant green."
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#E3DFD2] text-xs text-[#203027] resize-none"
                />
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-[#E3DFD2] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={closeUploadModal}
                  disabled={uploading}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-[#68766C] hover:bg-[#E3DFD2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading || !fileToUpload}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#174C35] hover:bg-[#174C35] text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <Loader2 size={13} className="animate-spin" />
                      <span>Optimizing & Uploading...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={13} />
                      <span>Save Photo Observation</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Full Size Preview Modal */}
      {selectedPhotoForView && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#203027]/85 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh]">
            <div className="p-3 bg-[#203027] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera size={15} className="text-[#78A95A]" />
                <span className="text-xs font-semibold">
                  {plantNickname} — {new Date(selectedPhotoForView.takenAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                {selectedPhotoForView.growthStage && (
                  <span className="text-[10px] bg-[#174C35] px-2 py-0.5 rounded-full font-bold">
                    {selectedPhotoForView.growthStage}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setSelectedPhotoForView(null)}
                className="p-1 rounded-lg text-[#E3DFD2] hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 bg-black/90 flex items-center justify-center p-2 overflow-hidden">
              <img
                src={selectedPhotoForView.signedUrl}
                alt={selectedPhotoForView.caption || 'Observation photo'}
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-lg"
              />
            </div>

            {selectedPhotoForView.caption && (
              <div className="p-4 bg-[#F8F6EE] border-t border-[#E3DFD2] text-xs text-[#203027]">
                <p className="font-semibold text-[#174C35] mb-0.5">Observation Log:</p>
                <p className="leading-relaxed">{selectedPhotoForView.caption}</p>
                {selectedPhotoForView.heightCm && (
                  <p className="text-[11px] text-[#68766C] mt-1 font-medium">
                    Recorded Height: {selectedPhotoForView.heightCm} cm
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
